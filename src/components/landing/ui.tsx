import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import type { ReactNode } from "react";

/* ── Logo ─────────────────────────────────────────────────────────────── */

export function Logo({ tone = "dark", size = 36 }: { tone?: "dark" | "light"; size?: number }) {
  const box = tone === "dark" ? "var(--brand-900)" : "#ffffff";
  const mark = tone === "dark" ? "#DDF3EC" : "var(--brand-900)";

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.33),
        background: box,
        color: mark,
        display: "grid",
        placeItems: "center",
        flex: "none",
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.2 3.8c.4 7.3-2.6 13-8.4 14.4-3 .7-5.6-.1-7.3-1.7C2.6 14.6 2.4 11 4.1 8.2 6.4 4.4 12 3.4 20.2 3.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M5.4 19.4c1.4-4.1 4.2-7.5 8.2-9.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/* ── Pola lingkaran konsentris ─────────────────────────────────────────── */

export function CirclesPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {[290, 236, 182, 128, 74].map((r) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

/* ── Label kecil di atas judul ─────────────────────────────────────────── */

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <span className={light ? "eyebrow eyebrow--light" : "eyebrow"}>{children}</span>;
}

/* ── Tombol pil §3.4 ───────────────────────────────────────────────────── */

type PillProps = {
  children: ReactNode;
  href?: string;
  tone?: "amber" | "brand" | "light";
  size?: "md" | "sm";
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
};

export function PillButton({
  children,
  href,
  tone = "amber",
  size = "md",
  disabled = false,
  disabledReason,
  className = "",
}: PillProps) {
  const classes = ["pill", `pill--${tone}`, size === "sm" ? "pill--sm" : "", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span>{children}</span>
      <span className="pill__icon" aria-hidden="true">
        <ArrowUpRight size={size === "sm" ? 16 : 18} strokeWidth={2} />
      </span>
    </>
  );

  if (disabled || !href) {
    return (
      <button type="button" className={classes} disabled aria-disabled="true" title={disabledReason}>
        {content}
      </button>
    );
  }

  return (
    <a className={classes} href={href}>
      {content}
    </a>
  );
}

/* Ikon panah ke bawah untuk tautan sekunder hero */
export function DownIcon() {
  return <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />;
}

/* ── Tautan teks ───────────────────────────────────────────────────────── */

export function TextLink({
  children,
  href,
  light = false,
  icon = "chevron",
}: {
  children: ReactNode;
  href: string;
  light?: boolean;
  icon?: "chevron" | "none";
}) {
  return (
    <a className={light ? "textlink textlink--light" : "textlink"} href={href}>
      {children}
      {icon === "chevron" ? <ChevronRight size={15} strokeWidth={2} aria-hidden="true" /> : null}
    </a>
  );
}

/* ── Kepala section ────────────────────────────────────────────────────── */

export function SectionHead({
  eyebrow,
  title,
  aside,
  center = false,
  id,
}: {
  eyebrow?: string;
  title: string;
  aside?: string;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className="lp-head" style={center ? { justifyContent: "center", textAlign: "center" } : undefined}>
      <div style={center ? { marginInline: "auto" } : undefined}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 id={id} className="t-h2" style={{ marginTop: 16 }}>
          {title}
        </h2>
      </div>
      {aside ? <p className="lp-head__aside">{aside}</p> : null}
    </div>
  );
}

/* ── Slot gambar + placeholder berlabel ────────────────────────────────── */

export function ImageSlot({
  src,
  alt,
  slot,
  size,
  priority = false,
  sizes = "100vw",
  plain = false,
}: {
  src: string | null;
  alt: string;
  slot: string;
  size: string;
  priority?: boolean;
  sizes?: string;
  plain?: boolean;
}) {
  const [code, ...rest] = slot.split(" · ");
  const detail = [...rest, size].filter(Boolean).join(" · ");

  return (
    <div className={plain ? "slot slot--plain" : "slot"}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      ) : (
        <div className="slot__ph" role="img" aria-label={`Placeholder gambar: ${alt}`}>
          <span>{code}</span>
          <small>{detail}</small>
        </div>
      )}
    </div>
  );
}

/* ── Bingkai ponsel ────────────────────────────────────────────────────── */

export function PhoneFrame({
  screen,
  src,
  label,
  className = "",
  sizes = "(min-width: 1024px) 280px, 40vw",
}: {
  screen: string;
  src: string | null;
  label: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`phone ${className}`.trim()}>
      <div className="phone__screen">
        {src ? (
          <Image src={src} alt={`Layar ${label} aplikasi PilahYuk`} fill sizes={sizes} />
        ) : (
          <div className="phone__ph" role="img" aria-label={`Placeholder layar ${label}`}>
            <Smartphone size={22} strokeWidth={1.6} aria-hidden="true" />
            <strong>{screen}.png</strong>
            <span>1080 × 2400 · placeholder</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Label kepercayaan data §5.9 ───────────────────────────────────────── */

export type TrustVariant = "estimated" | "manual" | "weighed" | "verified";

export function TrustBadge({ variant, label }: { variant: TrustVariant; label: string }) {
  return (
    <span className={`badge badge--${variant}`}>
      {label}
      {variant === "verified" ? <BadgeCheck size={14} strokeWidth={2} aria-hidden="true" /> : null}
    </span>
  );
}

/* ── Stempel bulat "Catatan terverifikasi" ─────────────────────────────── */

export function Stamp({ id, width = 96 }: { id: string; width?: number }) {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="Stempel catatan terverifikasi"
    >
      <defs>
        <path
          id={id}
          d="M48,48 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
        />
      </defs>
      <circle cx="48" cy="48" r="46.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="48" cy="48" r="29" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <text fill="currentColor" fontSize="6.9" fontWeight="700" letterSpacing="0.55">
        <textPath href={`#${id}`} startOffset="0">
          CATATAN TERVERIFIKASI ✓ · PILAHYUK ·
        </textPath>
      </text>
      <path
        d="m41.5 48 4.6 4.6 9-9.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Butir cek kecil ───────────────────────────────────────────────────── */

export function CheckBullet({ children }: { children: ReactNode }) {
  return (
    <li className="bullet">
      <span className="bullet__dot" aria-hidden="true">
        <Check size={14} strokeWidth={2.4} />
      </span>
      <span>{children}</span>
    </li>
  );
}
