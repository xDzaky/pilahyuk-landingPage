"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  QrCode,
  Truck,
  Wallet,
  WifiOff,
} from "lucide-react";
import { features } from "@/content/id";
import { Eyebrow, ImageSlot } from "./ui";

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  slot: string;
  src: string | null;
  alt: string;
  placeholder: string;
  size: string;
};

const icons = {
  "list-checks": ListChecks,
  truck: Truck,
  wallet: Wallet,
  "calendar-days": CalendarDays,
  "qr-code": QrCode,
  "book-open": BookOpen,
  "wifi-off": WifiOff,
} as const;

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Features({ items }: { items: FeatureCard[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const step = useCallback(() => {
    const first = railRef.current?.querySelector<HTMLElement>(".fcard");
    return first ? first.offsetWidth + 20 : 316;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      rail.scrollTo({
        left: clamped * step(),
        behavior: prefersReduced() ? "auto" : "smooth",
      });
      setActive(clamped);
    },
    [items.length, step]
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      const width = step();
      const index = Math.round(rail.scrollLeft / width);
      setActive(Math.max(0, Math.min(items.length - 1, index)));
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => rail.removeEventListener("scroll", onScroll);
  }, [items.length, step]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rail = railRef.current;
      if (!rail || !drag.current.down) return;
      const dx = event.clientX - drag.current.startX;
      if (Math.abs(dx) > 4) drag.current.moved = true;
      rail.scrollLeft = drag.current.startLeft - dx;
    };
    const onUp = () => {
      const rail = railRef.current;
      if (!rail) return;
      drag.current.down = false;
      rail.classList.remove("is-dragging");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      down: true,
      startX: event.clientX,
      startLeft: rail.scrollLeft,
      moved: false,
    };
    rail.classList.add("is-dragging");
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section id="fitur" className="lp-section lp-section--surface" aria-labelledby="judul-fitur">
      <div className="lp-container">
        <div className="features__head">
          <div>
            <Eyebrow>{features.eyebrow}</Eyebrow>
            <h2 id="judul-fitur" className="t-h2" style={{ marginTop: 16 }}>
              {features.title}
            </h2>
          </div>
          <div className="features__arrows">
            <button
              type="button"
              className="arrow-btn"
              aria-label="Fitur sebelumnya"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="arrow-btn"
              aria-label="Fitur berikutnya"
              onClick={() => goTo(active + 1)}
              disabled={active === items.length - 1}
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="rail"
          role="region"
          aria-label="Daftar fitur, geser untuk melihat semuanya"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
        >
          {items.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons] ?? ListChecks;
            return (
              <article key={item.id} className="fcard" aria-labelledby={`fitur-${item.id}`}>
                <div className="fcard__media">
                  <ImageSlot
                    src={item.src}
                    alt={item.alt}
                    slot={item.placeholder}
                    size={item.size}
                    plain
                    sizes="(min-width: 768px) 296px, 264px"
                  />
                </div>
                <div className="fcard__scrim" aria-hidden="true" />
                <span className="fcard__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.9} />
                </span>
                <div className="fcard__body">
                  <h3 id={`fitur-${item.id}`} className="fcard__title">
                    {item.title}
                  </h3>
                  <p className="fcard__desc">{item.description}</p>
                  <a className="fcard__link" href={item.href} tabIndex={0}>
                    Pelajari
                    <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                    <span className="sr-only"> tentang {item.title}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="dots" role="tablist" aria-label="Pilih fitur">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Ke fitur ${index + 1}: ${item.title}`}
              className={index === active ? "dot is-active" : "dot"}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
