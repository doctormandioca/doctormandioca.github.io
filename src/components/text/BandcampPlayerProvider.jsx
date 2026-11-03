import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const BandcampPlayerContext = createContext(null);

export function useBandcampPlayer() {
  return useContext(BandcampPlayerContext);
}

const embedUrl = (track) =>
  `https://bandcamp.com/EmbeddedPlayer/album=${encodeURIComponent(String(track.albumId))}/size=large/bgcol=0f0f0f/linkcol=${track.linkColor}/tracklist=${track.tracklist ? "true" : "false"}/artwork=large/${track.transparent ? "transparent=true/" : ""}#`;

/**
 * Owns exactly one Bandcamp iframe for the lifetime of the app.
 * Route-level player slots only tell this provider where the iframe should sit.
 * When a route unmounts, the iframe is kept alive in a tiny off-screen-free
 * docked state, so client-side navigation does not destroy Bandcamp playback.
 */
export default function BandcampPlayerProvider({ children }) {
  const [track, setTrack] = useState(null);
  const [docked, setDocked] = useState(true);
  const [box, setBox] = useState(null);
  const slotRef = useRef(null);

  const measure = useCallback(() => {
    const slot = slotRef.current;
    if (!slot || !slot.isConnected) return;

    const rect = slot.getBoundingClientRect();
    const next = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    setBox((previous) => {
      if (
        previous &&
        previous.top === next.top &&
        previous.left === next.left &&
        previous.width === next.width &&
        previous.height === next.height
      ) {
        return previous;
      }
      return next;
    });
  }, []);

  const mount = useCallback(
    (albumId, title, element, options = {}) => {
      if (!albumId || !element) return undefined;

      const normalizedAlbumId = String(albumId);
      const nextTrack = {
        albumId: normalizedAlbumId,
        title: title || "Bandcamp",
        tracklist: options.tracklist !== false,
        linkColor: options.linkColor || "9a9a9a",
        transparent: options.transparent !== false,
      };
      slotRef.current = element;

      // Reattaching the same album to a different page slot must not update
      // the iframe src. Changing even its display options reloads Bandcamp and
      // interrupts the current session, so preserve the existing player by ID.
      setTrack((current) =>
        current?.albumId === nextTrack.albumId ? current : nextTrack
      );
      setDocked(false);
      measure();

      return () => {
        // An old slot's cleanup must not dock a newer slot that has already mounted.
        if (slotRef.current !== element) return;
        slotRef.current = null;
        setBox(null);
        setDocked(true);
      };
    },
    [measure]
  );

  const stop = useCallback(() => {
    slotRef.current = null;
    setTrack(null);
    setBox(null);
    setDocked(true);
  }, []);

  useEffect(() => {
    if (docked || !slotRef.current) return undefined;

    const update = () => measure();
    window.addEventListener("resize", update);
    // Capture scroll events from nested scrollers as well as the document.
    window.addEventListener("scroll", update, true);

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(slotRef.current);
      if (document.body) observer.observe(document.body);
    }

    update();
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      observer?.disconnect();
    };
  }, [docked, measure]);

  return (
    <BandcampPlayerContext.Provider value={{ mount, track, stop }}>
      {children}
      <PlayerLayer track={track} docked={docked} box={box} onStop={stop} />
    </BandcampPlayerContext.Provider>
  );
}

function PlayerLayer({ track, docked, box, onStop }) {
  if (!track) return null;

  const inline = !docked && Boolean(box);
  const iframeStyle = inline
    ? {
        position: "fixed",
        top: `${box.top}px`,
        left: `${box.left}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        zIndex: 60,
        border: 0,
      }
    : {
        // Keep the same iframe DOM node alive while it is not shown in a page slot.
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        border: 0,
      };

  return (
    <>
      <iframe
        title={track.title}
        src={embedUrl(track)}
        style={iframeStyle}
        allow="autoplay; encrypted-media; fullscreen"
        loading="eager"
        aria-hidden={inline ? undefined : true}
        tabIndex={inline ? 0 : -1}
      />

      {!inline ? (
        <div className="hairline fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-3 border bg-background px-3 py-2 shadow-sm">
          <span className="max-w-[min(18rem,60vw)] truncate font-mono text-[10px] uppercase tracking-[0.16em]">
            ▶ {track.title}
          </span>
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop Bandcamp playback"
            title="Stop playback"
            className="shrink-0 font-mono text-[13px] leading-none text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
