export async function POST() {
  return Response.json(
    {
      error:
        "Online submissions are not open yet. Please contact the Facebook group admins.",
    },
    { status: 503 },
  );
}
