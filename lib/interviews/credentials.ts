import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "crypto";
import { db } from "@/lib/directory/server";

function encryptionKey(owner: string) {
  return Buffer.from(hkdfSync("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!, owner, "atg-interviews-key-v1", 32));
}

export async function saveCredential(owner: string, value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(owner), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const sealed = [iv, cipher.getAuthTag(), encrypted].map(part => part.toString("base64")).join(".");
  const { error } = await db().from("interview_credentials").upsert({owner_id: owner, sealed_key: sealed});
  if (error) throw error;
}

export async function credential(owner: string) {
  const { data, error } = await db().from("interview_credentials").select("sealed_key").eq("owner_id", owner).maybeSingle();
  if (error) throw error;
  if (!data) return process.env.OPENAI_API_KEY || "";
  const [iv, tag, bytes] = data.sealed_key.split(".").map((x: string) => Buffer.from(x, "base64"));
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(owner), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(bytes), cipher.final()]).toString("utf8");
}
