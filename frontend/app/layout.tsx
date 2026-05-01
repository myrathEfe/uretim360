import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";

const bodyFont = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"]
});

const headingFont = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "MES-Lite",
  description: "Üretim izleme ve hafif MES platformu"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
        <body className={`${bodyFont.className} ${headingFont.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
