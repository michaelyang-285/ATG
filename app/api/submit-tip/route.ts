export async function POST() {
  return Response.json(
    {
      error:
        "Please use the form at /contact.",
    },
    { status: 503 },
  );
}
