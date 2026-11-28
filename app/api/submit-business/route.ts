export async function POST() {
  return Response.json(
    {
      error:
        "Please use the form at /directory/submit.",
    },
    { status: 503 },
  );
}
