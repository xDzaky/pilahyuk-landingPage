"use client";

import { useRef, useState } from "react";
import { appScreens } from "@/content/id";
import { PhoneFrame, SectionHead } from "./ui";

export type RolePanel = {
  id: string;
  label: string;
  bullets: readonly string[];
  screens: { name: string; label: string; src: string | null }[];
};

export function AppScreens({ roles }: { roles: RolePanel[] }) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const clamped = (index + roles.length) % roles.length;
    setSelected(clamped);
    tabRefs.current[clamped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(selected + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(selected - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(roles.length - 1);
    }
  };

  const role = roles[selected];

  return (
    <section id="layar" className="lp-section lp-section--paper" aria-labelledby="judul-layar">
      <div className="lp-container">
        <SectionHead id="judul-layar" eyebrow={appScreens.eyebrow} title={appScreens.title} />

        <div className="tabs" role="tablist" aria-label="Pilih peran pengguna">
          {roles.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              className="tab"
              aria-selected={selected === index}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          key={role.id}
          className="panel"
          role="tabpanel"
          id={`panel-${role.id}`}
          aria-labelledby={`tab-${role.id}`}
          tabIndex={0}
        >
          <div>
            <ul className="panel__list">
              {role.bullets.map((bullet, index) => (
                <li key={bullet} className="panel__item">
                  <span className="panel__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="panel__text">{bullet}</span>
                </li>
              ))}
            </ul>
            <p className="panel__note">{appScreens.note}</p>
          </div>

          <div className="phone-stack">
            {role.screens.map((screen) => (
              <PhoneFrame
                key={`${role.id}-${screen.name}`}
                screen={screen.name}
                src={screen.src}
                label={screen.label}
                sizes="(min-width: 640px) 280px, 240px"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
