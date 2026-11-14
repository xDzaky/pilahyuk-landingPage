"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/id";
import { Logo, PillButton } from "./ui";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = nav.links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>

      <nav className={scrolled ? "nav is-scrolled" : "nav"} aria-label="Utama">
        <a className="nav__logo" href="#top" aria-label={`${site.name} — kembali ke atas`}>
          <Logo />
          <span>{site.name}</span>
        </a>

        <div className="nav__links">
          {nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? "nav__link is-active" : "nav__link"}
              aria-current={active === link.id ? "location" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav__actions">
          <Link className="nav__login" href="/login">
            {nav.login}
          </Link>
          <PillButton href="#unduh" size="sm" tone="amber">
            {nav.download}
          </PillButton>
          <button
            type="button"
            className="nav__menu"
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="menu-seluler"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} strokeWidth={2} />
          </button>
        </div>
      </nav>

      <div
        id="menu-seluler"
        className={open ? "sheet is-open" : "sheet"}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="sheet__top">
          <span className="sheet__brand">
            <Logo tone="light" />
            {site.name}
          </span>
          <button type="button" className="sheet__close" aria-label="Tutup menu" onClick={close}>
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="sheet__links">
          {nav.links.map((link) => (
            <a key={link.id} className="sheet__link" href={`#${link.id}`} onClick={close}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="sheet__foot">
          <PillButton href="#unduh" tone="amber">
            {nav.download}
          </PillButton>
          <Link className="sheet__login" href="/login" onClick={close}>
            {nav.login} ke portal
          </Link>
        </div>
      </div>
    </>
  );
}
