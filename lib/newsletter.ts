import { db } from "@/lib/directory/server";

export async function subscribeEmail(email: string) {
  const { error } = await db().from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw error;
}
