"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CheckCircleIcon } from "./icons/check-circle-icon";
import { CopyIcon } from "./icons/copy-icon";

type Phase = "idle" | "loading" | "success";

const LOADING_MS = 650;
const SUCCESS_MS = 1100;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// enters sliding up from below (into the idle slot, delayed the same as the ring), exits sliding down
const copyVariants = {
   initial: { y: 12, opacity: 0, scale: 0.85 },
   animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
         y: { duration: 0.24, ease: EASE_OUT, delay: 0.14 },
         scale: { duration: 0.24, ease: EASE_OUT, delay: 0.14 },
         opacity: { duration: 0.3, ease: "linear" as const, delay: 0.14 },
      },
   },
   exit: { y: 12, opacity: 0, scale: 0.8, transition: { duration: 0.22, ease: EASE_IN } },
};

// slides in from above while scaling 0.8 -> 1, starting just after the copy icon begins its shrink.
// opacity gets its own slower, linear fade so it doesn't front-load visibility ahead of the slide.
const ringVariants = {
   initial: { y: -10, opacity: 0, scale: 0.8 },
   animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
         y: { duration: 0.24, ease: EASE_OUT, delay: 0.14 },
         scale: { duration: 0.24, ease: EASE_OUT, delay: 0.14 },
         opacity: { duration: 0.3, ease: "linear" as const, delay: 0.14 },
      },
   },
   exit: { opacity: 0, scale: 0, transition: { duration: 0.18, ease: EASE_IN } },
};

// scales in just after the ring shrinks away, then slides up and out
const checkVariants = {
   initial: { opacity: 0, scale: 0 },
   animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 480, damping: 22, delay: 0.08 },
   },
   exit: { y: -8, opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: EASE_IN } },
};

function CopyRing() {
   return (
      <svg className="copy-ring" viewBox="0 0 16 16" fill="none" aria-hidden="true">
         <circle cx="8" cy="8" r="6.5" stroke="var(--card-border)" strokeWidth="1.3" />
         <circle
            className="copy-ring__progress"
            cx="8"
            cy="8"
            r="6.5"
            stroke="var(--ink)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeDasharray="12 40.8"
         />
      </svg>
   );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
   const [phase, setPhase] = useState<Phase>("idle");
   const timers = useRef<number[]>([]);

   useEffect(() => {
      return () => timers.current.forEach(clearTimeout);
   }, []);

   const onCopy = async () => {
      if (phase !== "idle") return;
      try {
         await navigator.clipboard.writeText(text);
      } catch {
         return;
      }
      setPhase("loading");
      timers.current.push(
         window.setTimeout(() => {
            setPhase("success");
            timers.current.push(window.setTimeout(() => setPhase("idle"), SUCCESS_MS));
         }, LOADING_MS)
      );
   };

   return (
      <button
         type="button"
         className="copy"
         onClick={onCopy}
         disabled={phase !== "idle"}
         aria-label={phase === "success" ? "Copied" : label}
      >
         <AnimatePresence initial={false}>
            {phase === "idle" && (
               <motion.span
                  key="copy"
                  className="copy__icon"
                  variants={copyVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <CopyIcon size={16} />
               </motion.span>
            )}
            {phase === "loading" && (
               <motion.span
                  key="ring"
                  className="copy__icon"
                  variants={ringVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <CopyRing />
               </motion.span>
            )}
            {phase === "success" && (
               <motion.span
                  key="check"
                  className="copy__icon"
                  style={{ color: "var(--accent)" }}
                  variants={checkVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  <CheckCircleIcon size={16} />
               </motion.span>
            )}
         </AnimatePresence>
      </button>
   );
}
