import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { howItWorks, imageSlots } from "@/content/id";
import { imageSrc, screenSrc } from "@/lib/landing/assets";
import { CirclesPattern, ImageSlot, PhoneFrame, SectionHead } from "./ui";
import { Reveal } from "./Reveal";

const statusIcons = [Circle, Circle, ArrowRight] as const;

export function HowItWorks() {
  const [step1, step2, step3, step4] = howItWorks.steps;
  const slice = screenSrc("02-pilah");
  const agenda = imageSrc("F4");

  return (
    <section id="cara-kerja" className="lp-section lp-section--paper" aria-labelledby="judul-cara-kerja">
      <div className="lp-container">
        <SectionHead
          id="judul-cara-kerja"
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          aside={howItWorks.aside}
        />

        <div className="bento">
          {/* Langkah 01 */}
          <Reveal className="bento__card bento__card--tall bento__card--c1">
            <span className="bento__index">Langkah {step1.index}</span>
            <h3 className="bento__title">{step1.title}</h3>
            <p className="bento__desc">{step1.description}</p>
            <div className="bento__phone" aria-hidden="true">
              <PhoneFrame
                screen="02-pilah"
                src={slice}
                label="Panduan memilah"
                sizes="(min-width: 1024px) 240px, 200px"
              />
            </div>
          </Reveal>

          {/* Langkah 02 */}
          <Reveal className="bento__card bento__card--c2" delay={60}>
            <span className="bento__index">Langkah {step2.index}</span>
            <h3 className="bento__title">{step2.title}</h3>
            <p className="bento__desc">{step2.description}</p>
            <div className="bento__chips">
              {step2.statuses.map((status, index) => {
                const Icon = statusIcons[index];
                return (
                  <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className={index === 0 ? "chip chip--active" : "chip"}>
                      <Icon size={8} strokeWidth={2.5} aria-hidden="true" />
                      {status}
                    </span>
                    {index < step2.statuses.length - 1 ? (
                      <ChevronRight size={12} className="chip__arrow" aria-hidden="true" />
                    ) : null}
                  </span>
                );
              })}
            </div>
          </Reveal>

          {/* Langkah 03 */}
          <Reveal className="bento__card bento__card--c3" delay={120}>
            <span className="bento__index">Langkah {step3.index}</span>
            <h3 className="bento__title">{step3.title}</h3>
            <p className="bento__desc">{step3.description}</p>
            <div className="bento__saldo">
              <span className="bento__saldo-label">Saldo anggota</span>
              <span className="bento__saldo-ph">05-saldo.png · baris ringkasan</span>
              <span className="bento__saldo-note">
                <Check size={11} strokeWidth={3} aria-hidden="true" /> Tercatat saat setoran
              </span>
            </div>
          </Reveal>

          {/* Langkah 04 */}
          <Reveal className="bento__card bento__card--dark bento__card--c4" delay={180}>
            <CirclesPattern className="bento__pattern" />
            <div className="bento__dark-copy">
              <span className="bento__index">
                Langkah {step4.index} {step4.optional ? "(opsional)" : ""}
              </span>
              <h3 className="bento__title" style={{ marginTop: 8 }}>
                {step4.title}
              </h3>
              <p className="bento__desc" style={{ marginTop: 8 }}>
                {step4.description}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <span className="chip" style={{ background: "rgba(255,255,255,.08)", borderColor: "transparent", color: "#DDF3EC" }}>
                  <CalendarDays size={12} aria-hidden="true" /> Agenda
                </span>
                <span className="chip" style={{ background: "rgba(255,255,255,.08)", borderColor: "transparent", color: "#DDF3EC" }}>
                  <ClipboardList size={12} aria-hidden="true" /> Tugas relawan
                </span>
                <span className="chip" style={{ background: "rgba(255,255,255,.08)", borderColor: "transparent", color: "#DDF3EC" }}>
                  <Megaphone size={12} aria-hidden="true" /> Pengumuman
                </span>
              </div>
            </div>
            <div className="bento__photo" aria-hidden="true">
              <ImageSlot
                src={agenda}
                alt={imageSlots.F4.alt}
                slot={imageSlots.F4.label}
                size={imageSlots.F4.size}
                sizes="132px"
                plain
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
