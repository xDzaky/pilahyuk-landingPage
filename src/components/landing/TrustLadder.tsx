import { trust } from "@/content/id";
import type { TrustVariant } from "./ui";
import { Eyebrow, Stamp, TrustBadge } from "./ui";
import { Reveal } from "./Reveal";

export function TrustLadder() {
  return (
    <section id="data-jujur" className="lp-section lp-section--surface" aria-labelledby="judul-data-jujur">
      <div className="lp-container">
        <div className="trust__grid">
          <Reveal className="trust__copy">
            <Eyebrow>{trust.eyebrow}</Eyebrow>
            <h2 id="judul-data-jujur" className="t-h2">
              {trust.title}
            </h2>
            <p>{trust.paragraph}</p>
            <div className="trust__stamp">
              <Stamp id="stamp-trust" />
            </div>
          </Reveal>

          <div>
            <div className="trust__rows">
              {trust.rows.map((row, index) => (
                <Reveal
                  key={row.label}
                  className="trust-row"
                  delay={index * 60}
                  as="div"
                >
                  <TrustBadge variant={row.variant as TrustVariant} label={row.label} />
                  <span className="trust-row__text">
                    {row.description}
                    <span className="trust-row__example">{row.example}</span>
                  </span>
                </Reveal>
              ))}
            </div>
            <p className="trust__note">{trust.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
