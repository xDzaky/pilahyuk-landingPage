import Image from "next/image";
import { ArrowDown, History, MapPinOff, Smartphone, Tag, WifiOff } from "lucide-react";
import { hero, site } from "@/content/id";
import { imageSrc, screenSrc } from "@/lib/landing/assets";
import { CirclesPattern, Eyebrow, PhoneFrame, PillButton } from "./ui";

const trustIcons = {
  "map-pin-off": MapPinOff,
  tag: Tag,
  history: History,
} as const;

export function Hero() {
  const heroImage = imageSrc("H1");
  const front = screenSrc("01-beranda");
  const back = screenSrc("03-ajukan");
  const apkUrl = process.env.NEXT_PUBLIC_APK_URL || null;
  const version = process.env.NEXT_PUBLIC_APK_VERSION || "2.0";

  return (
    <section className="hero" id="top" aria-labelledby="judul-hero">
      <div className="hero__frame">
        <div className="hero__bg">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Gang kampung pada pagi hari, warga membawa wadah pilah sampah"
              fill
              priority
              sizes="100vw"
            />
          ) : (
            <div className="hero__bg-fallback" />
          )}
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <CirclesPattern className="hero__pattern" />

        <div className="hero__inner">
          <div className="hero__copy">
            <Eyebrow light>{hero.eyebrow}</Eyebrow>

            <h1 id="judul-hero" className="t-display hero__title">
              {hero.titleBefore}
              <span className="hero__accent">{hero.titleAccent}</span>
            </h1>

            <p className="hero__lead">{hero.lead}</p>

            <div className="hero__actions">
              <PillButton
                href={apkUrl ?? undefined}
                disabled={!apkUrl}
                disabledReason="Tautan unduhan belum diatur"
                tone="amber"
              >
                {hero.primaryCta}
              </PillButton>
              <a className="textlink textlink--light" href="#cara-kerja">
                {hero.secondaryCta}
                <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>

            <ul className="hero__trust">
              {hero.trust.map((item) => {
                const Icon = trustIcons[item.icon as keyof typeof trustIcons];
                return (
                  <li key={item.text} className="hero__trust-item">
                    <Icon size={15} strokeWidth={2} aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hero__phones" aria-hidden="true">
            <div className="hero__phone-front">
              <PhoneFrame screen="01-beranda" src={front} label="Beranda" sizes="300px" />
            </div>
            <div className="hero__phone-back">
              <PhoneFrame screen="03-ajukan" src={back} label="Ajukan penjemputan" sizes="260px" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero__card">
        <div className="hero__cell">
          <Smartphone size={20} strokeWidth={1.8} aria-hidden="true" />
          <span>
            {hero.downloadCard.android}
            <small>Versi {version}</small>
          </span>
        </div>
        <div className="hero__cell">
          <WifiOff size={20} strokeWidth={1.8} aria-hidden="true" />
          <span>{hero.downloadCard.offline}</span>
        </div>
        <div className="hero__cell">
          <PillButton
            href={apkUrl ?? undefined}
            disabled={!apkUrl}
            disabledReason="Tautan unduhan belum diatur"
            tone="amber"
            size="sm"
          >
            {hero.downloadCard.cta}
          </PillButton>
        </div>
      </div>

      <span className="sr-only">
        {site.description}
      </span>
    </section>
  );
}
