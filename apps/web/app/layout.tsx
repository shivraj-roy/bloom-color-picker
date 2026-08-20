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

const TITLE = "Bloom Color Picker";
const DESCRIPTION =
   "A flower-inspired color picker. A tiny swatch blooms open into petals. Zero dependencies.";

export const metadata: Metadata = {
   metadataBase: new URL("https://bloom-color-picker.shivrajroy.in"),
   title: TITLE,
   description: DESCRIPTION,
   keywords: ["color picker", "color", "picker", "bloom", "flower", "react"],
   authors: [{ name: "Shivraj Roy", url: "https://www.shivrajroy.in" }],
   creator: "Shivraj Roy",
   openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      images: [{ url: "/bloom-og.png", width: 1200, height: 630, alt: TITLE }],
   },
   twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      creator: "@shivraj_roy10",
      images: ["/bloom-og.png"],
   },
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
