import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getEvents } from "@/lib/data";
import { photoCredits } from "@/lib/photoCredits";

const REPO_URL = "https://github.com/IgnacioDN/PULSO-BA";
const LINK_CLASS = "text-white/70 transition hover:text-white";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const events = await getEvents();

  const photographers = Array.from(
    new Set([
      ...events.flatMap((e) => (e.photo ? [e.photo.photographer] : [])),
      ...Object.values(photoCredits.category).map((c) => c.photographer),
    ]),
  ).join(", ");

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#171210]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl font-bold">{tNav("brand")}</p>
            <p className="mt-2 text-sm text-white/70">{t("tagline")}</p>
          </div>

          <nav aria-label={t("navLabel")} className="flex flex-col gap-2 text-sm font-medium">
            <Link href="/events" className={LINK_CLASS}>{tNav("catalog")}</Link>
            <Link href="/map" className={LINK_CLASS}>{tNav("map")}</Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>{t("code")}</a>
          </nav>
        </div>

        <div className="mt-8 space-y-2 border-t border-white/10 pt-6 text-xs text-white/55">
          <p>{t("demo")}</p>
          <p>{t("photos", { photographers })}</p>
          <p>© {new Date().getFullYear()} {t("author")} · {t("license")}</p>
        </div>
      </div>
    </footer>
  );
}
