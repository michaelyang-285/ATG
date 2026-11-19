import type { User } from "@supabase/supabase-js";

export function canReviewDeletions(user: User) {
  return user.app_metadata.directory_admin === true ||
    (Boolean(user.email_confirmed_at) && user.email?.toLowerCase() === "marketing@285marketing.com");
}
