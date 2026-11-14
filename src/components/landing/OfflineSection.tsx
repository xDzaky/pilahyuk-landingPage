import Image from "next/image";
import { offline, imageSlots } from "@/content/id";
import { imageSrc } from "@/lib/landing/assets";
import { CirclesPattern, Eyebrow, TextLink } from "./ui";
import { OfflineDiagram } from "./OfflineDiagram";

export function OfflineSection() {
  const photo = imageSrc("O1");

  return (
    <section id="offline" className="lp-section lp-section--paper" aria-labelledby="judul-offline">
      <div className="band-wrap">
        <div className="band">
          <div className="band__bg" aria-hidden="true">
            {photo ? (
              <Image
                src={photo}
                alt={imageSlots.O1.alt}
                fill
                sizes="100vw"
              />
            ) : null}
          </div>
          <CirclesPattern className="band__pattern" />

          <div className="band__inner">
            <div className="band__copy">
              <Eyebrow light>{offline.eyebrow}</Eyebrow>
              <h2 id="judul-offline" className="t-h2">
                {offline.title}
              </h2>
              <p className="band__lead">{offline.lead}</p>
              <div className="band__cta">
                <TextLink light href="#layar">
                  {offline.cta}
                </TextLink>
              </div>
            </div>

            <OfflineDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
