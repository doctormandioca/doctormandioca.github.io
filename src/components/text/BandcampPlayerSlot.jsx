/**
 * Render Bandcamp's official embed directly in the release dialog.
 *
 * The former implementation moved an iframe around the document using fixed
 * positioning, a portal and ResizeObserver measurements. That is unnecessary
 * for an embedded player and can leave it detached from the dialog. Keeping the
 * iframe in normal document flow avoids that positioning/layering failure.
 */
export default function BandcampPlayerSlot({
  albumId,
  title,
  height = 472,
  tracklist = true,
  linkColor = "9a9a9a",
  transparent = true,
  className = "",
}) {
  const normalizedAlbumId = albumId == null ? "" : String(albumId).trim();

  // Bandcamp album IDs are numeric. Do not create a broken embed URL.
  if (!/^\d+$/.test(normalizedAlbumId)) {
    if (normalizedAlbumId) {
      console.warn("[Bandcamp] Invalid album ID:", normalizedAlbumId);
    }
    return (
      <p role="status" className="meta py-4">
        Bandcamp player unavailable: invalid album ID.
      </p>
    );
  }

  const safeLinkColor = /^[0-9a-fA-F]{6}$/.test(linkColor)
    ? linkColor
    : "9a9a9a";
  const embedUrl =
    `https://bandcamp.com/EmbeddedPlayer/album=${normalizedAlbumId}` +
    `/size=large/bgcol=0f0f0f/linkcol=${safeLinkColor}` +
    `/tracklist=${tracklist ? "true" : "false"}/artwork=large/` +
    `${transparent ? "transparent=true/" : ""}#`;

  return (
    <div className={className}>
      <iframe
        title={`${title || "Bandcamp"} — Bandcamp player`}
        src={embedUrl}
        width="100%"
        height={height}
        style={{
          display: "block",
          width: "100%",
          height: `${height}px`,
          border: 0,
          background: "#0f0f0f",
        }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
        allowFullScreen
      />
    </div>
  );
}
