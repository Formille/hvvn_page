import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteDecor } from "@/components/site-decor";
import { siteAsset } from "@/lib/assets";

const ogImage = siteAsset("header_1.png");

export const metadata: Metadata = {
  title: "Debone",
  description: "from hvvn",
  openGraph: {
    title: "Debone",
    description: "from hvvn",
    type: "website",
    siteName: "Debone",
    ...(ogImage ? { images: [{ url: ogImage, alt: "Debone — from hvvn" }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Debone",
    description: "from hvvn",
    ...(ogImage ? { images: [ogImage] } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,500;1,6..72,400&family=Pirata+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteDecor />
        <div className="relative z-10">
          <SiteHeader />
          <main className="min-h-[70vh]">{children}</main>
        </div>
      </body>
    </html>
  );
}
