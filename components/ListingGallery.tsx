"use client";

import { useRef, useState } from "react";
import { galleryLimit } from "@/lib/directory/gallery";
import { directoryThumbnail } from "@/lib/directory/thumbnail";

export default function ListingGallery({ name, photos }: { name: string; photos: string[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const images = photos.slice(0, galleryLimit);
  if (!images.length) return null;

  function show(index: number) {
    setSelected(index);
    dialog.current?.showModal();
  }

  function move(offset: number) {
    setSelected(index => ((index ?? 0) + offset + images.length) % images.length);
  }

  return <section className="listing-gallery" aria-label={name + " photo gallery"}>
    <h2>Photos</h2>
    <div className="listing-thumbnails">
      {images.map((src, index) => <button key={index} type="button" onClick={() => show(index)}
        aria-label={`Enlarge photo ${index + 1} of ${images.length} from ${name}`} aria-haspopup="dialog">
        <img src={directoryThumbnail(src)} alt="" width={144} height={108} loading="lazy" />
      </button>)}
    </div>
    <dialog ref={dialog} aria-label={name + " photo viewer"} className="listing-lightbox"
      onClose={() => setSelected(null)}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <div className="listing-lightbox-content">
        <div className="listing-lightbox-bar">
          <span aria-live="polite">{selected !== null && `Photo ${selected + 1} of ${images.length}`}</span>
          <button type="button" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {selected !== null && <img src={images[selected]} alt={`${name}, photo ${selected + 1}`} />}
        {images.length > 1 && <div className="listing-lightbox-bar">
          <button type="button" onClick={() => move(-1)}>Previous</button>
          <button type="button" onClick={() => move(1)}>Next</button>
        </div>}
      </div>
    </dialog>
  </section>;
}
