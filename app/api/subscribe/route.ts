// Signup stays unavailable until an actual newsletter provider is configured.
// Never log email addresses or report success for an unsaved subscription.
export async function POST() {
  return Response.json(
    { error: "Newsletter signup is not open yet. Please check back soon." },
    { status: 503 },
  );
}
