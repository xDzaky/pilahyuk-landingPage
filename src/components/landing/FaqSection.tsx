"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { faq } from "@/content/id";
import { Eyebrow } from "./ui";

export function FaqSection() {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#faq-")) return;
    const slug = hash.replace("#faq-", "");
    if (!faq.items.some((item) => item.slug === slug)) return;
    const frame = requestAnimationFrame(() => setOpen(slug));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = (slug: string) => {
    const next = open === slug ? null : slug;
    setOpen(next);
    if (typeof window !== "undefined") {
      const url = next ? `#faq-${next}` : "#faq";
      window.history.replaceState(null, "", url);
    }
  };

  return (
    <section id="faq" className="lp-section lp-section--surface" aria-labelledby="judul-faq">
      <div className="lp-container">
        <div className="faq__grid">
          <div className="faq__intro">
            <Eyebrow>{faq.eyebrow}</Eyebrow>
            <h2 id="judul-faq" className="t-h2">
              {faq.title}
            </h2>
            <p className="faq__contact">
              {faq.contactPrefix} <span>{faq.contact}</span>
            </p>
          </div>

          <div className="faq__list">
            {faq.items.map((item) => {
              const isOpen = open === item.slug;
              return (
                <div key={item.slug} className={isOpen ? "faq-item is-open" : "faq-item"}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-${item.slug}`}
                      className="faq-item__q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.slug}`}
                      onClick={() => toggle(item.slug)}
                    >
                      <span>{item.question}</span>
                      <span className="faq-item__icon" aria-hidden="true">
                        {isOpen ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
                      </span>
                    </button>
                  </h3>
                  <div
                    className="faq-item__a"
                    id={`faq-panel-${item.slug}`}
                    role="region"
                    aria-labelledby={`faq-${item.slug}`}
                    aria-hidden={!isOpen}
                  >
                    <div>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
