import type { User } from "@supabase/supabase-js";
import { listing } from "@/lib/directory/validate";
import { revalidatePath } from "next/cache";
import { accountAdmin } from "@/lib/account-admin";
import { db, Failure, owner, respond } from "@/lib/directory/server";
import { eventStore } from "@/lib/community-event-store";

async function authorize(req: Request) {
  if (!accountAdmin(await owner(req)))
    throw new Failure(403, "Account administrator access required.");
}
const fields = [
  "firstName",
  "lastName",
  "name",
  "phone",
  "city",
  "zip",
] as const;
function profile(user: User) {
  return {
    id: user.id,
    email: user.email,
    created: user.created_at,
    lastSignIn: user.last_sign_in_at,
    info: Object.fromEntries(
      fields.map((key) => [key, user.user_metadata[key] || ""]),
    ),
    approved: user.app_metadata.approved_author === true,
    authorId: user.app_metadata.author_profile_id || "",
  };
}
export function GET(req: Request) {
  return respond(async () => {
    await authorize(req);
    const url = new URL(req.url);
    const client = db();
    const id = url.searchParams.get("id");
    if (!id) {
      const page = Number(url.searchParams.get("page") || 1);
      if (!Number.isSafeInteger(page) || page < 1)
        throw new Failure(400, "Invalid page.");
      const perPage = Number(url.searchParams.get("perPage") ?? 50);
      if (![50, 100, 250, 500].includes(perPage))
        throw new Failure(400, "Choose 50, 100, 250, or 500 rows per page.");
      const result = await client.auth.admin.listUsers({ page, perPage });
      if (result.error) throw result.error;
      return {
        people: result.data.users.map(profile),
        next: "nextPage" in result.data && !!result.data.nextPage,
      };
    }
    const assignments = await client
      .from("author_assignments")
      .select("*")
      .eq("owner_id", id)
      .order("updated_at", { ascending: false });
    if (url.searchParams.has("progress")) {
      if (assignments.error) throw assignments.error;
      return assignments.data;
    }
    const result = await client.auth.admin.getUserById(id);
    if (result.error || !result.data.user)
      throw new Failure(404, "Account unavailable.");
    const person = profile(result.data.user);
    const [listings, content] = await Promise.all([
      client
        .from("directory_entries")
        .select("id,status,draft,contact,published,revision,profile_slug")
        .eq("owner_id", id),
      eventStore().fetch(
        `{
        "events":*[_type=="communityEventOwner" && ownerId==$id]{"versions":*[_id==^.eventId || _id=="drafts."+^.eventId]{_id,title,reviewStatus}},
        "authors":*[_type=="authorProfile"]{_id,firstName,lastName,bio},
        "stories":*[_type=="story" && defined(authorProfile._ref) && authorProfile._ref==$author]{_id,title}
      }`,
        { id, author: person.authorId },
        { cache: "no-store" },
      ),
    ]);
    if (listings.error) throw listings.error;
    return {
      person,
      listings: listings.data,
      ...content,
      assignments: assignments.data,
      assignmentError: !!assignments.error,
    };
  });
}
export function POST(req: Request) {
  return respond(async () => {
    await authorize(req);
    const body = await req.json();
    const client = db();
    const result = await client.auth.admin.getUserById(body.id);
    const user = result.data.user;
    if (result.error || !user?.email)
      throw new Failure(404, "Account unavailable.");
    if (body.action === "reset") {
      const reset = await client.auth.resetPasswordForEmail(user.email, {
        redirectTo: "https://allthingsgwinnett.com/reset-password",
      });
      if (reset.error)
        throw new Failure(
          400,
          "Recovery email could not be requested. Try again later.",
        );
    } else if (body.action === "profile") {
      const info: Record<string, string> = {};
      for (const key of fields) {
        if (typeof body.info?.[key] !== "string" || body.info[key].length > 250)
          throw new Failure(400, "Check the profile fields.");
        info[key] = body.info[key].trim();
      }
      if (
        typeof body.approved !== "boolean" ||
        typeof body.authorId !== "string"
      )
        throw new Failure(400, "Check author settings.");
      if (
        body.authorId &&
        (await eventStore().getDocument(body.authorId))?._type !==
          "authorProfile"
      )
        throw new Failure(400, "Choose an existing author.");
      if (
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
      )
        throw new Failure(400, "Enter a valid account email.");
      const saved = await client.auth.admin.updateUserById(user.id, {
        ...(body.email !== user.email ? { email: body.email } : {}),
        user_metadata: info,
        app_metadata: {
          approved_author: body.approved,
          author_profile_id: body.authorId,
        },
      });
      if (saved.error) throw saved.error;
    } else if (body.action === "listing") {
      const table = client.from("directory_entries");
      const values = listing(body.fields, user.email, user.id);
      const saved = await table
        .update({
          ...values,
          revision: body.revision + 1,
          ...(body.status === "published" ? { published: values.draft } : {}),
        })
        .eq("owner_id", user.id)
        .eq("id", body.listingId)
        .eq("status", body.status)
        .eq("revision", body.revision)
        .is("deletion_due_at", null)
        .select("profile_slug")
        .maybeSingle();
      if (saved.error) throw saved.error;
      if (!saved.data)
        throw new Failure(409, "Listing changed. Reload before editing.");
      revalidatePath("/directory");
      revalidatePath("/directory/[slug]", "page");
    } else if (body.action === "assign") {
      if (user.app_metadata.approved_author !== true)
        throw new Failure(400, "Approve this author first.");
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.length > 300 ||
        !Array.isArray(body.questions) ||
        !body.questions.length ||
        body.questions.length > 100 ||
        body.questions.some(
          (q: unknown) => typeof q !== "string" || !q.trim() || q.length > 2000,
        )
      )
        throw new Failure(400, "Add an assignment title and questions.");
      const saved = await client.from("author_assignments").insert({
        owner_id: user.id,
        title: body.title.trim(),
        questions: body.questions,
      });
      if (saved.error) throw saved.error;
    } else throw new Failure(400, "Unknown action.");
    return { ok: true };
  });
}
