import type {User} from "@supabase/supabase-js";

export function accountAdmin(user: User) {
  return user.id === "7709fd6e-865f-46b2-a95a-cf466e3d15c6";
}
