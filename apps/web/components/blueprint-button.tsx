"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

import { usePersistedState } from "../lib/use-persisted-state";
import { BlueprintOffIcon } from "./animated-icons/blueprint-off-icon";
import { BlueprintOnIcon } from "./animated-icons/blueprint-on-icon";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// same up/down swap as ThemeButton — each icon anchored to its own side.
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

export function BlueprintButton() {
   const [visible, setVisible] = usePersistedState("blueprint-visible", true);

   useEffect(() => {
      document.body.classList.toggle("blueprint-hidden", !visible);
   }, [visible]);

   return (
      <button
         type="button"
         className="copy blueprint-btn"
         onClick={() => setVisible((v) => !v)}
         aria-label={visible ? "Hide blueprint grid" : "Show blueprint grid"}
      >
         <AnimatePresence mode="wait" initial={false}>
            {visible ? (
               <motion.span
                  key="on"
                  className="copy__icon"
                  variants={onVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <BlueprintOnIcon size={19} />
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
                  <BlueprintOffIcon size={19} />
               </motion.span>
            )}
         </AnimatePresence>
      </button>
   );
}
