import { createFileRoute } from "@tanstack/react-router";
import { useLang, useSite } from "@/lib/i18n";
import PageShell from "@/components/PageShell";

export const Route = createFileRoute("/caife")({
  head: () => ({
    meta: [
      { title: "CAIFE — Daniel Lofredo Rota" },
      {
        name: "description",
        content: "The Discos CAIFE archive. Recovered master tapes of a mid-century Ecuadorian label.",
      },
    ],
  }),
  component: CaifePage,
});

function CaifePage() {
  const site = useSite();
  const caife = site.caife;
  const { lang } = useLang();
  const storyUrl = `https://www.caifecaifecaife.com/?lang=${lang}`;

  return (
    <PageShell section={site.ui.sections.caife}>
      <div className="hairline flex flex-col gap-3 border-b px-5 py-6 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <h1 className="font-heading text-[clamp(1.9rem,5vw,3rem)] font-light leading-[0.95] tracking-[-0.03em]">
            {caife.name}
          </h1>
          <p className="meta mt-3">{caife.note}</p>
        </div>
        <a
          href={caife.href}
          target="_blank"
          rel="noreferrer"
          className="meta transition-colors hover:text-foreground"
        >
          {caife.where} ↗
        </a>
      </div>

      <div className="px-5 py-10 md:px-10 md:py-14">
        <p className="max-w-2xl text-justify font-mono text-[11px] leading-[1.9] tracking-[0.2em] text-foreground/90">
          {caife.description}
        </p>
        <a
          href={storyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex items-center border border-foreground px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-foreground hover:text-background"
        >
          {caife.cta}
        </a>
      </div>
    </PageShell>
  );
}
