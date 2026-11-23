"use client";
import { useState } from "react";
import { AdminListingFields } from "./AdminListingFields";
import OperatingHoursFields from "./OperatingHoursFields";
import { defaultWeek, isWeek } from "@/lib/directory/hours";
import { galleryLimit, sourceImageLimit } from "@/lib/directory/gallery";
import { prepareDirectoryImage } from "@/lib/directory/prepare-image";
import { directoryThumbnail } from "@/lib/directory/thumbnail";
import { services } from "@/lib/directory/categories";
import { browserClient } from "@/lib/browser-client";

export default function AdminListingMediaHours({
  listingId,
  draft,
  contact,
  onUpload,
}: {
  contact: Record<string, unknown>;
  listingId: string;
  draft: Record<string, unknown>;
  onUpload: (busy: boolean) => void;
}) {
  const [logo, setLogo] = useState(
    typeof draft.logo === "string" ? draft.logo : "",
  );
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(draft.services) ? draft.services : [],
  );
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
  async function upload(files: File[], kind: "gallery" | "logo") {
    setError("");
    if (kind === "gallery" && files.length + gallery.length > galleryLimit) {
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
        const { display, preview } = await prepareDirectoryImage(file, kind);
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
        if (kind === "logo") setLogo(result.url);
        else setGallery((g) => [...g, result.url]);
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
      <section className="listing-group">
        <h3>Location and services</h3>
        <AdminListingFields
          group="location"
          values={{ ...draft, ...contact }}
        />
        <details>
          <summary>
            Services ·{" "}
            {selected.length ? selected.join(", ") : "Select services"}
          </summary>
          <fieldset>
            <legend className="sr-only">Service options</legend>
            {services.map((service) => (
              <label key={service}>
                <input
                  type="checkbox"
                  checked={selected.includes(service)}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(service)
                        ? current.filter((v) => v !== service)
                        : [...current, service],
                    )
                  }
                />
                {service === "Mobile"
                  ? "Mobile · I travel to customers"
                  : service}
              </label>
            ))}
          </fieldset>
        </details>
        <input type="hidden" name="services" value={JSON.stringify(selected)} />
      </section>
      <section className="listing-group">
        {" "}
        <OperatingHoursFields
          week={week}
          legacy={String(draft.hours || "")}
          onChange={setWeek}
        />
        <input type="hidden" name="weeklyHours" value={JSON.stringify(week)} />
      </section>
      <section className="listing-group">
        <h3>Public contact and links</h3>
        <AdminListingFields group="links" values={{ ...draft, ...contact }} />
      </section>
      <section className="listing-group listing-media">
        <h3>Logo and photos</h3>
        <fieldset>
          <legend>Business logo</legend>
          <input type="hidden" name="logo" value={logo} />
          {logo ? (
            <>
              <img
                src={logo}
                className="h-24 w-24 rounded border bg-white object-contain"
                alt="Current business logo"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => setLogo("")}
              >
                Remove logo
              </button>
            </>
          ) : (
            <p>No logo uploaded.</p>
          )}
          <label>
            {logo ? "Replace logo" : "Add logo"}
            <input
              type="file"
              disabled={uploading}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload([file], "logo");
              }}
            />
          </label>
        </fieldset>
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
                void upload(files, "gallery");
              }}
            />
          </label>
        </fieldset>
        {(uploading || error) && (
          <p role="status">{uploading ? "Uploading image…" : error}</p>
        )}
      </section>
    </>
  );
}
