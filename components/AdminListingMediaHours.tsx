"use client";
import { useState } from "react";
import OperatingHoursFields from "./OperatingHoursFields";
import { defaultWeek, isWeek } from "@/lib/directory/hours";
import { galleryLimit, sourceImageLimit } from "@/lib/directory/gallery";
import { prepareDirectoryImage } from "@/lib/directory/prepare-image";
import { directoryThumbnail } from "@/lib/directory/thumbnail";
import { browserClient } from "@/lib/browser-client";

export default function AdminListingMediaHours({
  listingId,
  draft,
  onUpload,
}: {
  listingId: string;
  draft: Record<string, unknown>;
  onUpload: (busy: boolean) => void;
}) {
  const [gallery, setGallery] = useState<string[]>(
    Array.isArray(draft.gallery) ? draft.gallery : [],
  );
  const [week, setWeek] = useState(
    isWeek(draft.weeklyHours)
      ? draft.weeklyHours
      : draft.hours
        ? null
        : defaultWeek(),
  );
  const [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  async function upload(files: File[]) {
    setError("");
    if (files.length + gallery.length > galleryLimit) {
      setError("Choose fewer photos. The gallery holds " + galleryLimit + ".");
      return;
    }
    setUploading(true);
    onUpload(true);
    try {
      const token = (await browserClient()?.auth.getSession())?.data.session
        ?.access_token;
      if (!token) throw Error("Sign in again to upload photos.");
      for (const file of files) {
        if (file.size > sourceImageLimit)
          throw Error("Choose photos of 10 MB or less.");
        const { display, preview } = await prepareDirectoryImage(
          file,
          "gallery",
        );
        const form = new FormData();
        form.set("listingId", listingId);
        form.set("file", display, "photo");
        if (preview) form.set("thumbnail", preview, "thumbnail.jpg");
        const res = await fetch("/api/directory/upload", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: form,
        });
        const result = await res.json();
        if (!res.ok) throw Error(result.error || "Photo upload failed.");
        setGallery((g) => [...g, result.url]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      onUpload(false);
    }
  }
  return (
    <>
      <OperatingHoursFields
        week={week}
        legacy={String(draft.hours || "")}
        onChange={setWeek}
      />
      <input type="hidden" name="weeklyHours" value={JSON.stringify(week)} />
      <fieldset>
        <legend>
          Gallery ({gallery.length} of {galleryLimit})
        </legend>
        <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((url, i) => (
            <div key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                <img
                  src={directoryThumbnail(url)}
                  alt={"Listing photo " + (i + 1)}
                  className="aspect-[4/3] w-full object-cover"
                />
              </a>
              <button
                type="button"
                aria-label={"Remove photo " + (i + 1)}
                disabled={uploading}
                onClick={() =>
                  setGallery((g) => g.filter((photo) => photo !== url))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <label>
          Add photos
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading || gallery.length >= galleryLimit}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              void upload(files);
            }}
          />
        </label>
        <p role="status">{uploading ? "Uploading photos…" : error}</p>
      </fieldset>
    </>
  );
}
