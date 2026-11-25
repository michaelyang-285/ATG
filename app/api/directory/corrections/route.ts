import { createHash } from "node:crypto";
import { correctionOptIn, correctionRoles, type DirectoryRequest } from "@/lib/directory/correction";
import { getListing, listingPath } from "@/lib/directory/profile";
import { Failure, human, respond } from "@/lib/directory/server";
import { subscribeEmail } from "@/lib/newsletter";

function required(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Failure(400, `Enter a valid ${label}.`);
  }
  return value.trim();
}

const requestLabels: Record<DirectoryRequest, { subject: string; details: string }> = {
  correction: { subject: "correction", details: "Suggested correction" },
  claim: { subject: "ownership claim", details: "Ownership verification details" },
  dispute: { subject: "ownership review ticket", details: "Reason for ownership review and verification details" },
};

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
    // Older profiles submitted a boolean before ownership reviews had their own form.
    const kind = body.kind ?? (body.claim === true ? "claim" : "correction");
    if (kind !== "correction" && kind !== "claim" && kind !== "dispute")
      throw new Failure(400, "Choose a valid request type.");
    const claimed = listing.source === "local";
    if (kind === "claim" && claimed)
      throw new Failure(409, "This listing is already claimed. Refresh the profile and choose Request ownership review.");
    if (kind === "dispute" && !claimed)
      throw new Failure(409, "This listing is unclaimed. Refresh the profile and choose Claim this listing.");

    const label = requestLabels[kind as DirectoryRequest];
    const ticket = kind === "dispute" ? `ATG-${body.submissionId}` : undefined;
    const key = process.env.DIRECTORY_CORRECTION_RESEND_KEY;
    if (!key) throw new Failure(503, "We couldn’t send your request. Please try again later.");

    const message = {
      from: "All Things Gwinnett <directory@mail.285marketing.com>",
      to: ["marketing@285marketing.com"],
      reply_to: email,
      subject: `ATG directory ${label.subject}${ticket ? " " + ticket : ""}: ${listing.name.replace(/[\r\n]+/g, " ")}`,
      text: [
        listing.name,
        "https://allthingsgwinnett.com" + listingPath(listing.slug),
        "",
        `From: ${firstName} ${lastName} <${email}>`,
        `Relationship to business (self-reported): ${body.relationship}`,
        `Marketing opt-in: ${body.marketingOptIn ? "Yes. " + correctionOptIn : "No"}`,
        "",
        label.details + ":",
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
    if (!delivery.ok) throw new Failure(503, "We couldn’t send your request. Please try again.");
    if (body.marketingOptIn) {
      try {
        await subscribeEmail(email);
      } catch {
        throw new Failure(503, "Your request was sent. Please retry to finish signing up for emails.");
      }
    }
    return { ok: true, ticket };
  });
}
