"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";

import { DarkThemeIcon } from "./animated-icons/dark-theme-icon";
import { LightThemeIcon } from "./animated-icons/light-theme-icon";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// same motion as Selector's caret/check swap: each icon is anchored to its
// own side (light re-enters from below, dark re-enters from above), so on
// click one slides up while the other slides down, rather than both
// sliding the same direction like CopyButton's carousel swap.
const lightVariants = {
   initial: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

const darkVariants = {
   initial: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

export function ThemeButton() {
   const { resolvedTheme, setTheme } = useTheme();
   // Sidebar renders client-only (ssr: false) already, but next-themes still
   // recommends this guard — the provider's real value may not be settled
   // on the very first tick after mount.
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   const theme = mounted ? resolvedTheme : "light";

   return (
      <button
         type="button"
         className="copy theme-btn"
         onClick={() => setTheme(theme === "light" ? "dark" : "light")}
         aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      >
         <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
               <motion.span
                  key="light"
                  className="copy__icon"
                  variants={lightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <LightThemeIcon size={19} />
               </motion.span>
            ) : (
               <motion.span
                  key="dark"
                  className="copy__icon"
                  variants={darkVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <DarkThemeIcon size={19} />
               </motion.span>
            )}
         </AnimatePresence>
      </button>
   );
}
