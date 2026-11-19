import { directoryImageType, sourceImageLimit, storedImageLimit, thumbnailLimit } from "./gallery";

function canvasWithContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw Error("Your browser couldn’t resize this image. Try another browser.");
  context.imageSmoothingQuality = "high";
  return {canvas, context};
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob?.size) resolve(blob);
    else reject(Error("This image couldn’t be resized. Try another photo."));
  }, type, quality));
}

async function displayImage(image: HTMLImageElement, longestSide: number) {
  let scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight));
  for (;;) {
    const {canvas, context} = canvasWithContext(
      Math.max(1, Math.round(image.naturalWidth * scale)),
      Math.max(1, Math.round(image.naturalHeight * scale)),
    );
    try {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await encode(canvas, "image/webp", .84);
      if (blob.size <= storedImageLimit) return blob;
    } finally {
      canvas.width = canvas.height = 0;
    }
    scale *= .75;
  }
}

async function thumbnail(image: HTMLImageElement) {
  const scale = Math.min(1, image.naturalWidth / 288, image.naturalHeight / 216);
  const {canvas, context} = canvasWithContext(
    Math.max(1, Math.round(288 * scale)), Math.max(1, Math.round(216 * scale)),
  );
  try {
    const cover = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * cover;
    const height = image.naturalHeight * cover;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const blob = await encode(canvas, "image/jpeg", .78);
    if (blob.size > thumbnailLimit) throw Error("This preview couldn’t be resized. Try another photo.");
    return blob;
  } finally {
    canvas.width = canvas.height = 0;
  }
}

export async function prepareDirectoryImage(file: File, kind: "logo" | "gallery") {
  if (!file.size || file.size > sourceImageLimit) throw Error("Choose a photo of 10 MB or less.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!directoryImageType(bytes)) throw Error("Choose a JPG, PNG, or WebP image.");
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode().catch(() => { throw Error("This photo couldn’t be opened. Try another image."); });
    if (!image.naturalWidth || !image.naturalHeight) throw Error("This image has no usable dimensions.");
    const display = await displayImage(image, kind === "logo" ? 512 : 1600);
    return { display, preview: kind === "gallery" ? await thumbnail(image) : null };
  } finally {
    URL.revokeObjectURL(url);
  }
}
