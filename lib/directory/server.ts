import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export class Failure extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}
export async function owner(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new Failure(401, "Sign in to continue.");
  const { data, error } = await db().auth.getUser(token);
  if (error || !data.user?.email)
    throw new Failure(401, "Your session expired. Sign in again.");
  return data.user;
}
export async function human() {
  if ((await checkBotId()).isBot)
    throw new Failure(403, "We could not verify this submission.");
}
export function respond(fn: () => Promise<unknown>) {
  return fn()
    .then((value) =>
      NextResponse.json(value, {
        headers: { "Cache-Control": "private, no-store" },
      }),
    )
    .catch((e) =>
      NextResponse.json(
        {
          error:
            e instanceof Failure
              ? e.message
              : "Unable to complete this request. Please try again.",
        },
        { status: e instanceof Failure ? e.code : 503 },
      ),
    );
}
