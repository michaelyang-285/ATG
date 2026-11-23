export function hasAccountContact(info: Record<string, unknown>) {
  return (
    [info.firstName, info.lastName].every(
      (v) => typeof v === "string" && !!v.trim() && v.length <= 240,
    ) &&
    typeof info.phone === "string" &&
    info.phone.length <= 240 &&
    info.phone.replace(/\D/g, "").length >= 7
  );
}
