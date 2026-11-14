import { History, Lock, MapPinOff, ShieldCheck } from "lucide-react";
import { promise } from "@/content/id";
import { Reveal } from "./Reveal";

const icons = {
  "map-pin-off": MapPinOff,
  lock: Lock,
  history: History,
  "shield-check": ShieldCheck,
} as const;

export function PromiseBand() {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="judul-janji-data">
      <div className="lp-container">
        <h2 id="judul-janji-data" className="sr-only">
          Janji data PilahYuk
        </h2>

        <Reveal className="promise-band">
          {promise.items.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <div key={item.title} className="promise-band__item">
                <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <div className="promise-band__title">{item.title}</div>
                  <p className="promise-band__line">{item.line}</p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
