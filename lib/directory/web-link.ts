export function directoryWebLink(input: string): string | null {
  const value = input.trim();
  if (!value) return "";
  if (/[\s\\]/.test(value)) return null;
  const absolute = /^https?:\/\//i.test(value);
  if (!absolute && !/^[^/:?#@]+\.[^/:?#@]+(?::\d+)?(?:[/?#]|$)/.test(value)) return null;
  const link = absolute ? value : "https://" + value;
  try {
    const parsed = new URL(link);
    return parsed.hostname && !parsed.username && !parsed.password ? link : null;
  } catch {
    return null;
  }
}
