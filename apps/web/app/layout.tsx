import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
   title: "Bloom Color Picker",
   description: "A flower-inspired color picker — a swatch that blooms open into petals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en">
         <body className={nunito.className}>{children}</body>
      </html>
   );
}
