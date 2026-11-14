import { BadgeCheck } from "lucide-react";
import { community, imageSlots } from "@/content/id";
import { imageSrc } from "@/lib/landing/assets";
import { Eyebrow, ImageSlot, Stamp, TextLink } from "./ui";
import { Reveal } from "./Reveal";

export function CommunitySection() {
  return (
    <section id="komunitas" className="lp-section lp-section--paper" aria-labelledby="judul-komunitas">
      <div className="lp-container">
        {/* Baris A — satu-satunya bingkai poligon di halaman */}
        <div className="zig">
          <Reveal className="zig__media">
            <figure className="poly">
              <ImageSlot
                src={imageSrc("C1")}
                alt={imageSlots.C1.alt}
                slot={imageSlots.C1.label}
                size={imageSlots.C1.size}
                sizes="(min-width: 1024px) 460px, 100vw"
              />
              <span className="zig__stamp" aria-hidden="true">
                <Stamp id="stamp-komunitas" width={56} />
              </span>
            </figure>
          </Reveal>

          <Reveal className="zig__copy" delay={80}>
            <Eyebrow>{community.blockA.eyebrow}</Eyebrow>
            <h2 id="judul-komunitas" className="t-h2">
              {community.blockA.title}
            </h2>
            <p>{community.blockA.body}</p>
          </Reveal>
        </div>

        {/* Baris B */}
        <div className="zig zig--reverse">
          <Reveal className="zig__media" delay={80}>
            <div className="culture-wrap">
              <figure className="culture">
                <ImageSlot
                  src={imageSrc("C2")}
                  alt={imageSlots.C2.alt}
                  slot={imageSlots.C2.label}
                  size={imageSlots.C2.size}
                  plain
                  sizes="(min-width: 1024px) 420px, 90vw"
                />
              </figure>
              <span className="culture__chip">
                <BadgeCheck size={15} strokeWidth={2} aria-hidden="true" />
                Izin tercatat
              </span>
            </div>
          </Reveal>

          <Reveal className="zig__copy">
            <Eyebrow>{community.blockB.eyebrow}</Eyebrow>
            <h2 className="t-h2">{community.blockB.title}</h2>
            <p>{community.blockB.body}</p>
            <div className="zig__links">
              {community.blockB.links.map((link) => (
                <TextLink key={link} href="#layar">
                  {link}
                </TextLink>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
