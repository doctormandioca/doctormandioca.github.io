import { useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/i18n";
import { useBandcampPlayer } from "@/components/text/BandcampPlayerProvider";

/** A page-sized placeholder controlled by the one persistent app-level iframe. */
export default function BandcampPlayerSlot({
  albumId,
  title,
  height = 472,
  tracklist = true,
  linkColor = "9a9a9a",
  transparent = true,
  className = "",
}) {
  const site = useSite();
  const player = useBandcampPlayer();
  const mount = player?.mount;
  const slotRef = useRef(null);
  const normalizedAlbumId = albumId == null ? "" : String(albumId);

  // A route/dialog may reuse this component instance for a different album.
  // Store the requested album alongside the flag so a previous selection can
  // never cause the next album to initialize its Bandcamp iframe automatically.
  const [request, setRequest] = useState({ albumId: "", active: false });
  const requested = request.active && request.albumId === normalizedAlbumId;

  // A matching album means the already-running iframe can be reattached as-is.
  // Display options are intentionally ignored so navigation never reloads it.
  const matchesCurrentPlayer = player?.track?.albumId === normalizedAlbumId;

  useEffect(() => {
    if (!requested || !normalizedAlbumId || !mount || !slotRef.current) return undefined;
    return mount(normalizedAlbumId, title, slotRef.current, { tracklist, linkColor, transparent });
  }, [requested, normalizedAlbumId, title, mount, tracklist, linkColor, transparent]);

  if (!normalizedAlbumId) return null;

  return (
    <div className={className}>
      {requested ? (
        <div
          ref={slotRef}
          style={{ height: `${height}px`, minHeight: `${height}px` }}
          aria-label={`${title || "Bandcamp"} player`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setRequest({ albumId: normalizedAlbumId, active: true })}
          className="hairline inline-flex items-center gap-3 border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
        >
          {matchesCurrentPlayer
            ? (site.lang === "es" ? "Mostrar reproductor actual" : "Show current Bandcamp player")
            : (site.lang === "es" ? "Cargar reproductor de Bandcamp" : "Load Bandcamp player")}
        </button>
      )}
    </div>
  );
}
