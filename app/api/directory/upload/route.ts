import { db, human, owner, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req),
      file = (await req.formData()).get("file");
    if (!(file instanceof Blob) || !file.size || file.size > 2000000)
      throw new Failure(400, "Choose an image under 2 MB.");
    const b = Buffer.from(await file.arrayBuffer());
    const ext = b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))
      ? "png"
      : b.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"))
        ? "jpg"
        : b.toString("ascii", 0, 4) === "RIFF" &&
            b.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (!ext) throw new Failure(400, "Choose a PNG, JPEG or WebP image.");
    const bucket = db().storage.from("directory-media"),
      key = user.id + "/" + crypto.randomUUID() + "." + ext;
    const { error } = await bucket.upload(key, b, {
      contentType: ext === "jpg" ? "image/jpeg" : "image/" + ext,
    });
    if (error) throw error;
    return { url: bucket.getPublicUrl(key).data.publicUrl };
  });
}
