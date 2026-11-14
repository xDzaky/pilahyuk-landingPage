import { House, Recycle, Scale, Truck, Users } from "lucide-react";
import { audience } from "@/content/id";
import { Reveal } from "./Reveal";

const icons = {
  house: House,
  users: Users,
  scale: Scale,
  truck: Truck,
  recycle: Recycle,
} as const;

export function Audience() {
  return (
    <section className="lp-section lp-section--tight lp-section--paper" aria-labelledby="judul-untuk-siapa">
      <div className="lp-container">
        <Reveal>
          <h2 id="judul-untuk-siapa" className="t-h3 audience__title">
            {audience.title}
          </h2>
        </Reveal>

        <div className="audience__scroller">
          <ul className="audience__grid">
            {audience.roles.map((role, index) => {
              const Icon = icons[role.icon as keyof typeof icons];
              return (
                <Reveal
                  key={role.name}
                  as="li"
                  className="audience__item"
                  delay={index * 60}
                >
                  <Icon size={32} strokeWidth={1.6} aria-hidden="true" />
                  <span className="audience__name">{role.name}</span>
                  <span className="audience__line">{role.line}</span>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
