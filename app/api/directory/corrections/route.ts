import { createHash } from "node:crypto";
import { correctionOptIn, correctionRoles } from "@/lib/directory/correction";
import { getListing, listingPath } from "@/lib/directory/profile";
import { Failure, human, respond } from "@/lib/directory/server";
import { subscribeEmail } from "@/lib/newsletter";

function required(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Failure(400, `Enter a valid ${label}.`);
  }
  return value.trim();
}

export function POST(request: Request) {
  return respond(async () => {
    await human();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") throw new Failure(400, "Check the form and try again.");

    const firstName = required(body.firstName, "first name", 100);
    const lastName = required(body.lastName, "last name", 100);
    const email = required(body.email, "email address", 254).toLowerCase();
    const correction = required(body.correction, "correction", 3000);
    const slug = required(body.slug, "listing", 256);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Failure(400, "Enter a valid email address.");
    if (!correctionRoles.includes(body.relationship)) throw new Failure(400, "Select your relationship to the business.");
    if (typeof body.marketingOptIn !== "boolean" || typeof body.submissionId !== "string" ||
        !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(body.submissionId)) {
      throw new Failure(400, "Reopen the listing and try again.");
    }

    const listing = await getListing(slug);
    if (!listing) throw new Failure(404, "This listing is no longer available.");
    const key = process.env.DIRECTORY_CORRECTION_RESEND_KEY;
    if (!key) throw new Failure(503, "We couldn’t send your correction. Please try again later.");

    const message = {
      from: "All Things Gwinnett <directory@mail.285marketing.com>",
      to: ["marketing@285marketing.com"],
      reply_to: email,
      subject: `ATG directory correction: ${listing.name.replace(/[\r\n]+/g, " ")}`,
      text: [
        listing.name,
        "https://allthingsgwinnett.com" + listingPath(listing.slug),
        "",
        `From: ${firstName} ${lastName} <${email}>`,
        `Relationship to business (self-reported): ${body.relationship}`,
        `Marketing opt-in: ${body.marketingOptIn ? "Yes. " + correctionOptIn : "No"}`,
        "",
        "Suggested correction:",
        correction,
      ].join("\n"),
    };
    const payload = JSON.stringify(message);
    const fingerprint = createHash("sha256").update(payload).digest("hex");
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `atg-correction/${body.submissionId}/${fingerprint}`,
      },
      body: payload,
      cache: "no-store",
    });
    if (!delivery.ok) throw new Failure(503, "We couldn’t send your correction. Please try again.");
    if (body.marketingOptIn) {
      try {
        await subscribeEmail(email);
      } catch {
        throw new Failure(503, "Your correction was sent. Please retry to finish signing up for emails.");
      }
    }
    return { ok: true };
  });
}
