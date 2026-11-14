"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Apple, Check, Copy, Play } from "lucide-react";
import { download, imageSlots } from "@/content/id";
import { PillButton } from "./ui";

export type DownloadProps = {
  apkUrl: string | null;
  version: string;
  sizeMb: string;
  sha256: string;
  siteUrl: string;
  bannerSrc: string | null;
};

export function DownloadCta({ apkUrl, version, sizeMb, sha256, siteUrl, bannerSrc }: DownloadProps) {
  const [copied, setCopied] = useState(false);

  const absoluteApk =
    apkUrl && apkUrl.startsWith("http") ? apkUrl : apkUrl ? `${siteUrl}${apkUrl}` : siteUrl;

  const copyChecksum = useCallback(async () => {
    if (!sha256) return;
    try {
      await navigator.clipboard.writeText(sha256);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [sha256]);

  return (
    <section id="unduh" className="lp-section lp-section--paper" aria-labelledby="judul-unduh">
      <div className="band-wrap">
        <div className="cta__banner">
          <div className="cta__bg" aria-hidden="true">
            {bannerSrc ? (
              <Image src={bannerSrc} alt={imageSlots.B1.alt} fill sizes="100vw" />
            ) : null}
          </div>
          <div className="cta__overlay" aria-hidden="true" />

          <div className="cta__grid">
            <div className="cta__copy">
              <h2 id="judul-unduh" className="t-h2">
                {download.title}
              </h2>
              <p className="cta__lead">{download.lead}</p>

              <div className="cta__actions">
                <PillButton
                  href={apkUrl ?? undefined}
                  disabled={!apkUrl}
                  disabledReason="Tautan unduhan belum diatur"
                  tone="amber"
                >
                  {download.cta}
                </PillButton>

                <div className="store-badges">
                  <button
                    type="button"
                    className="store-badge"
                    disabled
                    aria-disabled="true"
                    title={`${download.playStore.label} ${download.playStore.state.toLowerCase()}`}
                  >
                    <Play size={20} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      <span className="store-badge__top">{download.playStore.label}</span>
                      <span className="store-badge__name">{download.playStore.state}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="store-badge"
                    disabled
                    aria-disabled="true"
                    title={`${download.appStore.label} ${download.appStore.state.toLowerCase()}`}
                  >
                    <Apple size={20} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      <span className="store-badge__top">{download.appStore.label}</span>
                      <span className="store-badge__name">{download.appStore.state}</span>
                    </span>
                  </button>
                </div>

                <p className="cta__meta">
                  <span>
                    {download.platform} · {sizeMb} MB · versi {version}
                  </span>
                  {sha256 ? (
                    <button
                      type="button"
                      className="checksum-btn"
                      onClick={copyChecksum}
                      title="Salin SHA-256"
                    >
                      SHA-256 {sha256.slice(0, 16)}…
                      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                      <span className="sr-only">
                        {copied ? "Tersalin" : "Salin checksum SHA-256"}
                      </span>
                    </button>
                  ) : null}
                </p>
              </div>
            </div>

            {apkUrl ? (
              <aside className="qr-card" aria-label="Kode QR unduhan">
                <div className="qr-card__code">
                  <QRCodeSVG
                    value={absoluteApk}
                    size={168}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#173F35"
                    marginSize={0}
                    title="QR unduhan aplikasi PilahYuk"
                  />
                </div>
                <span className="qr-card__title">{download.scan}</span>
                <span className="qr-card__caption">{download.qrCaption}</span>
                <span className="qr-card__url">{absoluteApk.replace(/^https?:\/\/[^/]+/, "")}</span>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
