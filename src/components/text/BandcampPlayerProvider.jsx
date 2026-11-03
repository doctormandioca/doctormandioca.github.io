import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const BandcampPlayerContext = createContext(null);

export function useBandcampPlayer() {
  return useContext(BandcampPlayerContext);
}

const embedUrl = (track) =>
  `https://bandcamp.com/EmbeddedPlayer/album=${encodeURIComponent(String(track.albumId))}/size=large/bgcol=0f0f0f/linkcol=${track.linkColor}/tracklist=${track.tracklist ? "true" : "false"}/artwork=large/${track.transparent ? "transparent=true/" : ""}#`;

/**
 * Owns exactly one Bandcamp iframe for the lifetime of the app.
 * Route-level player slots only tell this provider where the iframe should sit.
 * When a route unmounts, the iframe is kept alive in a tiny docked state so
 * client-side navigation does not destroy Bandcamp playback.
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
      // Reattaching the same album must not change iframe src: doing so restarts
      // Bandcamp playback when a route reuses or repositions the player slot.
      setTrack((current) =>
        current?.albumId === nextTrack.albumId ? current : nextTrack,
      );
      setDocked(false);
      measure();

      return () => {
        if (slotRef.current !== element) return;
        slotRef.current = null;
        setBox(null);
        setDocked(true);
      };
    },
    [measure],
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
  // The iframe must be a sibling of Radix's dialog portal in document.body.
  // Otherwise a stacking context on the app root can trap z-index: 60 below
  // the dialog overlay, making the Bandcamp player appear missing on the live site.
  if (!track || typeof document === "undefined" || !document.body) return null;

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
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        border: 0,
      };

  return createPortal(
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
        <div className="hairline fixed bottom-4 right-4 z-[70] flex items-center gap-3 border border-white/15 bg-black/90 px-4 py-3 text-white shadow-xl">
          <span className="text-[10px] uppercase tracking-[0.18em]">
            ▶ {track.title}
          </span>
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop Bandcamp playback"
            className="text-white/60 transition-colors hover:text-white"
          >
            ×
          </button>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
