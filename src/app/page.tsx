import type { Metadata } from "next";
import "./landing.css";
import {
  appScreens,
  faq,
  features,
  imageSlots,
  screenSlots,
  site,
  type ImageSlotName,
} from "@/content/id";
import { imageSrc, screenSrc } from "@/lib/landing/assets";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Audience } from "@/components/landing/Audience";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { AppScreens } from "@/components/landing/AppScreens";
import { OfflineSection } from "@/components/landing/OfflineSection";
import { TrustLadder } from "@/components/landing/TrustLadder";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { PromiseBand } from "@/components/landing/PromiseBand";
import { FaqSection } from "@/components/landing/FaqSection";
import { DownloadCta } from "@/components/landing/DownloadCta";
import { SiteFooter } from "@/components/landing/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pilahyuk.id";
const apkUrl = process.env.NEXT_PUBLIC_APK_URL || null;
const apkVersion = process.env.NEXT_PUBLIC_APK_VERSION || "2.0";
const apkSize = process.env.NEXT_PUBLIC_APK_SIZE_MB || "—";
const apkSha = process.env.NEXT_PUBLIC_APK_SHA256 || "";
const absoluteApk = apkUrl
  ? apkUrl.startsWith("http")
    ? apkUrl
    : `${siteUrl}${apkUrl}`
  : siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PilahYuk — Pilah dari rumah, kumpul bersama tetangga",
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: site.name,
    title: "PilahYuk — Pilah dari rumah, kumpul bersama tetangga",
    description: site.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PilahYuk — Pilah dari rumah, kumpul bersama tetangga",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PilahYuk — Pilah dari rumah, kumpul bersama tetangga",
    description: site.description,
    images: ["/og.png"],
  },
};

const featureCards = features.items.map((item) => {
  const slot = imageSlots[item.slot as ImageSlotName];
  return {
    ...item,
    src: imageSrc(item.slot as ImageSlotName),
    alt: slot.alt,
    placeholder: slot.label,
    size: slot.size,
  };
});

const rolePanels = appScreens.roles.map((role) => ({
  ...role,
  screens: role.screens.map((name) => ({
    name,
    label: screenSlots[name]?.label ?? name,
    src: screenSrc(name),
  })),
}));

const mobileAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: site.name,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Android",
  description: site.description,
  inLanguage: "id",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
  },
  downloadUrl: absoluteApk,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function LandingPage() {
  return (
    <div className="lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      <main id="konten" tabIndex={-1}>
        <Hero />
        <Audience />
        <About />
        <HowItWorks />
        <Features items={featureCards} />
        <AppScreens roles={rolePanels} />
        <OfflineSection />
        <TrustLadder />
        <CommunitySection />
        <PromiseBand />
        <FaqSection />
        <DownloadCta
          apkUrl={apkUrl}
          version={apkVersion}
          sizeMb={apkSize}
          sha256={apkSha}
          siteUrl={siteUrl}
          bannerSrc={imageSrc("B1")}
        />
      </main>

      <SiteFooter />

      <noscript>
        <style>{`.reveal{opacity:1;transform:none}`}</style>
      </noscript>
    </div>
  );
}
