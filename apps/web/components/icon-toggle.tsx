"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// Same motion as Selector's caret/check swap: each icon is anchored to its
// own side (the "on" icon re-enters from below, "off" re-enters from
// above), so on click one slides up while the other slides down, rather
// than both sliding the same direction like CopyButton's carousel swap.
const onVariants = {
   initial: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

const offVariants = {
   initial: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

export function IconToggle({
   className,
   on,
   onIcon,
   offIcon,
   onToggle,
   ariaLabel,
}: {
   className: string;
   on: boolean;
   onIcon: ReactNode;
   offIcon: ReactNode;
   onToggle: () => void;
   ariaLabel: string;
}) {
   return (
      <button type="button" className={`copy ${className}`} onClick={onToggle} aria-label={ariaLabel}>
         <AnimatePresence mode="wait" initial={false}>
            {on ? (
               <motion.span
                  key="on"
                  className="copy__icon"
                  variants={onVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  {onIcon}
               </motion.span>
            ) : (
               <motion.span
                  key="off"
                  className="copy__icon"
                  variants={offVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  {offIcon}
               </motion.span>
            )}
         </AnimatePresence>
      </button>
   );
}
