# Direct Bandcamp iframe fix

This patch is for the **doctormandioca/doctormandioca.github.io** repository
(the site with the `/ambien` release grid), not the separate
`caiferecords.github.io` project.

## Replace these three existing files

1. `src/components/quixosis/ReleaseDialog.jsx`
2. `src/routes/ambien.jsx`
3. `src/index.css`

Each replacement is included with its correct folder path in this ZIP.
In GitHub, open the existing file, choose Edit (pencil), replace its contents
with the matching downloaded file, and commit.

## What this changes

- Keeps the hand-drawn line-art artwork on the album covers.
- Applies the artwork/background hover effect only on mouse/trackpad devices.
  This prevents touch browsers from leaving the white hover state latched.
- Gives keyboard focus a yellow highlight rather than a white one.
- Removes the blank Bandcamp slot and the separate "Load Bandcamp player" click.
- Embeds Bandcamp's official iframe directly in the release dialog, like the
  working `caiferecords.github.io` site.
- Keeps the iframe mounted but visually hidden when the dialog closes, so
  playback can continue while visitors browse.

The old `BandcampPlayerProvider.jsx` and `BandcampPlayerSlot.jsx` can remain
in the repository; this release dialog no longer depends on their floating
iframe positioning mechanism.

After committing all three files, check GitHub Actions for a green deployment,
then hard-refresh the `/ambien` page.
