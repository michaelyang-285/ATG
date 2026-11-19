export const galleryLimit = 10;
export const sourceImageLimit = 10_000_000;
export const storedImageLimit = 2_000_000;
export const thumbnailLimit = 128_000;

export function directoryImageType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return "png";
  const header = new TextDecoder().decode(bytes.subarray(0, 12));
  if (header.startsWith("RIFF") && header.endsWith("WEBP") && bytes.length >= 12) return "webp";
  return null;
}
