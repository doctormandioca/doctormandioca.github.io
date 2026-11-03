import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useSite } from "@/lib/i18n";

/**
 * Keeps Bandcamp's own iframe directly inside the release dialog.
 *
 * This deliberately avoids the old floating iframe/slot system: no measuring
 * the placeholder, no moving an iframe through document.body, and no second
 * "Load Bandcamp player" click. The iframe stays mounted when the dialog is
 * closed so Bandcamp can continue playback while visitors browse.
 */
export default function ReleaseDialog({ release, open, onOpenChange }) {
  const site = useSite();
  const ui = site.ui.releases;
  const panelRef = useRef(null);
  const closeLabel = site.lang === "es" ? "Cerrar" : "Close";

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!release) return null;

  // The catalogue already builds the official Bandcamp URL in content/ambien.js.
  // Keep a safe fallback for any release object without the precomputed URL.
  const embedSrc =
    release.embed ||
    (release.albumId
      ? `https://bandcamp.com/EmbeddedPlayer/album=${encodeURIComponent(
          String(release.albumId),
        )}/size=large/bgcol=0f0f0f/linkcol=9a9a9a/tracklist=false/artwork=large/transparent=true/`
      : "");

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label={`${release.title} — Bandcamp`}
      inert={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
      className={[
        "fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 md:p-8 transition-opacity duration-200",
        open ? "bg-black/75 opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-lg border border-white/20 bg-background text-foreground shadow-[0_30px_60px_-40px_rgba(0,0,0,0.9)]"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={closeLabel}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-foreground/25 text-foreground/60 transition-colors hover:border-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="hairline flex items-baseline justify-between gap-4 border-b py-3 pl-4 pr-12">
          <div className="min-w-0">
            <p className="meta">+ambién · Bandcamp</p>
            <h2 className="mt-2 font-heading text-base font-light leading-tight tracking-[-0.02em]">
              {release.title}
            </h2>
          </div>
          <span className="meta shrink-0">{release.year}</span>
        </div>

        <div className="px-4 py-3">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={`${release.title} — Bandcamp`}
              className="h-[360px] w-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <p className="meta py-8 text-center">
              {site.lang === "es"
                ? "No hay un reproductor de Bandcamp disponible para este lanzamiento."
                : "No Bandcamp player is available for this release."}
            </p>
          )}
        </div>

        <div className="hairline flex items-center justify-between gap-4 border-t px-4 py-3">
          <span className="meta">{release.credit}</span>
          {release.bandcamp && (
            <a
              href={release.bandcamp}
              target="_blank"
              rel="noopener noreferrer"
              className="meta shrink-0 transition-colors hover:text-foreground"
            >
              {ui.open}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
