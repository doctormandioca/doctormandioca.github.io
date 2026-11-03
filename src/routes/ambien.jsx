import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/i18n";
import { releases, catalogue } from "@/content/ambien";
import PageShell from "@/components/PageShell";
import { useReleasePlayer } from "@/components/quixosis/ReleasePlayerProvider";
import { Image } from "@/components/ui/image";

export const Route = createFileRoute("/ambien")({
  head: () => ({
    meta: [
      { title: "+ambién — Releases" },
      {
        name: "description",
        content: "+ambién. Ambient label from Quito, Ecuador. Playable from Bandcamp, through the site.",
      },
    ],
  }),
  component: AmbienPage,
});

function AmbienPage() {
  const site = useSite();
  const project = site.music.find((item) => item.id === "ambien");
  const { showRelease } = useReleasePlayer();

  return (
    <PageShell section={site.ui.sections.ambien}>
      <div className="hairline flex flex-col gap-3 border-b px-5 py-6 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <h1 className="font-heading text-[clamp(1.9rem,5vw,3rem)] font-light leading-[0.95] tracking-[-0.03em]">
            {project.name}
          </h1>
          <p className="meta mt-3">{project.note}</p>
        </div>
        <a
          href={catalogue}
          target="_blank"
          rel="noreferrer"
          className="meta transition-colors hover:text-foreground"
        >
          {site.ui.releases.catalogue}
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {releases.map((release) => (
          <button
            key={release.slug}
            type="button"
            data-release-trigger
            onClick={() => showRelease(release)}
            className="release-card-trigger hairline flex flex-col gap-4 border-b border-r p-4 text-left transition-colors duration-300"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={release.cover}
                alt={release.title}
                fittingType="fill"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              <Image
                src={release.lineArt}
                alt=""
                aria-hidden="true"
                fittingType="fill"
                className="release-card-line-art pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-base font-light leading-tight tracking-[-0.02em]">
                  {release.title}
                </h2>
                <span className="release-card-meta meta shrink-0 transition-colors duration-300">
                  {release.year}
                </span>
              </div>
              <p className="release-card-meta meta transition-colors duration-300">
                {release.credit}
              </p>
            </div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
