import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";

import "./globals.css";

const nunito = Nunito({
   subsets: ["latin"],
   weight: ["500", "600", "700", "800"],
   variable: "--font-nunito",
});

const mono = JetBrains_Mono({
   subsets: ["latin"],
   weight: ["400", "500"],
   variable: "--font-mono",
});

export const metadata: Metadata = {
   title: "bloom-color-picker",
   description:
      "A flower-inspired color picker for React. A tiny swatch blooms open into petals. Zero dependencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en" className={`${nunito.variable} ${mono.variable}`}>
         <body>{children}</body>
      </html>
   );
}
