import { about, imageSlots } from "@/content/id";
import { imageSrc } from "@/lib/landing/assets";
import { CheckBullet, Eyebrow, ImageSlot, TextLink } from "./ui";
import { Reveal } from "./Reveal";

export function About() {
  const highlightStart = about.lead.indexOf(about.leadHighlight);
  const before = highlightStart >= 0 ? about.lead.slice(0, highlightStart) : about.lead;
  const after =
    highlightStart >= 0
      ? about.lead.slice(highlightStart + about.leadHighlight.length)
      : "";

  return (
    <section id="tentang" className="lp-section lp-section--surface" aria-labelledby="judul-tentang">
      <div className="lp-container">
        <div className="about__grid">
          <div className="about__media">
            <div className="cluster">
              <Reveal className="cluster__main">
                <ImageSlot
                  src={imageSrc("A1")}
                  alt={imageSlots.A1.alt}
                  slot={imageSlots.A1.label}
                  size={imageSlots.A1.size}
                  plain
                  sizes="(min-width: 1024px) 380px, 70vw"
                />
              </Reveal>
              <Reveal className="cluster__sm1" delay={80}>
                <ImageSlot
                  src={imageSrc("A2")}
                  alt={imageSlots.A2.alt}
                  slot="A2"
                  size="600×600"
                  plain
                  sizes="150px"
                />
              </Reveal>
              <Reveal className="cluster__sm2" delay={160}>
                <ImageSlot
                  src={imageSrc("A3")}
                  alt={imageSlots.A3.alt}
                  slot="A3"
                  size="600×600"
                  plain
                  sizes="120px"
                />
              </Reveal>
            </div>
          </div>

          <div className="about__copy">
            <Eyebrow>{about.eyebrow}</Eyebrow>

            <h2 id="judul-tentang" className="sr-only">
              Tentang PilahYuk
            </h2>

            <p className="about__lead">
              {before}
              <strong>{about.leadHighlight}</strong>
              {after}
            </p>

            <ul className="bullet-list">
              {about.bullets.map((bullet) => (
                <CheckBullet key={bullet}>{bullet}</CheckBullet>
              ))}
            </ul>

            <div className="about__cta">
              <TextLink href="#cara-kerja">{about.cta}</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
