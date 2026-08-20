import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";

import "./globals.css";

const nunito = Nunito({
   subsets: ["latin"],
   weight: ["500", "600", "700", "800"],
   variable: "--font-nunito",
});

const mono = localFont({
   src: "../public/font/Stack Sans Notch/StackSansNotch-VariableFont_wght.ttf",
   variable: "--font-mono",
});

const handwritten = localFont({
   src: "../public/font/Graphy Note/Graphy Note.otf",
   variable: "--font-handwritten",
});

export const metadata: Metadata = {
   title: "bloom-color-picker",
   description:
      "A flower-inspired color picker. A tiny swatch blooms open into petals. Zero dependencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html
         lang="en"
         className={`${nunito.variable} ${mono.variable} ${handwritten.variable}`}
         suppressHydrationWarning
      >
         <body>
            <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
               {children}
            </ThemeProvider>
         </body>
      </html>
   );
}
