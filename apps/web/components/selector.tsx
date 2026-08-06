"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";

export interface SelectorProps {
   label: string;
   value: string;
   options: string[];
   onValueChange: (value: string) => void;
}

const HIGHLIGHT_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

// caret is anchored "below": re-enters sliding up (on collapse), exits sliding down (on expand) —
// mirrors the copy button's idle icon.
const caretVariants = {
   initial: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: 8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

// check is anchored "above": enters sliding down (on expand, continuing the caret's downward
// exit), exits sliding up (on collapse, leading into the caret's upward re-entrance).
const checkVariants = {
   initial: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.22, ease: EASE_OUT } },
   animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: EASE_OUT } },
   exit: { y: -8, opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: EASE_IN } },
};

// matches the .selector__option max-width/padding reveal duration — the highlight only
// mounts once the row has finished opening, so it never measures a mid-transition layout.
const REVEAL_MS = 460;

export function Selector({ label, value, options, onValueChange }: SelectorProps) {
   const [expanded, setExpanded] = useState(false);
   const [pending, setPending] = useState(value);
   const [showHighlight, setShowHighlight] = useState(false);
   const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);
   const rootRef = useRef<HTMLDivElement>(null);
   const rowRef = useRef<HTMLDivElement>(null);
   const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

   const open = () => {
      setPending(value);
      setExpanded(true);
   };

   const confirm = () => {
      if (pending !== value) onValueChange(pending);
      setExpanded(false);
   };

   useEffect(() => {
      if (!expanded) {
         setShowHighlight(false);
         return;
      }
      const t = window.setTimeout(() => setShowHighlight(true), REVEAL_MS);
      return () => clearTimeout(t);
   }, [expanded]);

   useEffect(() => {
      if (!expanded) return;
      const onDown = (e: PointerEvent) => {
         if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
            setExpanded(false);
         }
      };
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") setExpanded(false);
      };
      document.addEventListener("pointerdown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
         document.removeEventListener("pointerdown", onDown);
         document.removeEventListener("keydown", onKey);
      };
   }, [expanded]);

   const activeValue = expanded ? pending : value;

   useLayoutEffect(() => {
      if (!showHighlight) return;
      const btn = optionRefs.current[activeValue];
      const row = rowRef.current;
      if (!btn || !row) return;
      const btnRect = btn.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const INSET = 6;
      setUnderline({
         x: btnRect.left - rowRect.left + INSET,
         width: btnRect.width - INSET * 2,
      });
   }, [showHighlight, activeValue]);

   return (
      <div ref={rootRef} className="selector">
         <span className="selector__label" data-hidden={expanded || undefined}>
            {label}
         </span>

         <div className="selector__group" data-expanded={expanded || undefined}>
            <div className="selector__shape" data-expanded={expanded || undefined}>
               <div className="selector__row" ref={rowRef}>
                  {options.map((opt) => {
                     const isActive = opt === activeValue;
                     return (
                        <button
                           key={opt}
                           ref={(el) => {
                              optionRefs.current[opt] = el;
                           }}
                           type="button"
                           className="selector__option"
                           data-active={isActive || undefined}
                           data-hidden={!expanded && !isActive ? true : undefined}
                           onClick={() => (expanded ? setPending(opt) : open())}
                        >
                           <span className="selector__option-label">{opt}</span>
                        </button>
                     );
                  })}

                  {showHighlight && underline && (
                     <motion.span
                        className="selector__option-underline"
                        initial={{ opacity: 0, x: underline.x, width: underline.width }}
                        animate={{ opacity: 1, x: underline.x, width: underline.width }}
                        transition={{ ...HIGHLIGHT_SPRING, opacity: { duration: 0.15 } }}
                     />
                  )}
               </div>
            </div>

            <button
               type="button"
               className="selector__icon-box"
               data-expanded={expanded || undefined}
               onClick={() => (expanded ? confirm() : open())}
               aria-label={expanded ? "Confirm" : "Choose palette"}
            >
               <AnimatePresence mode="wait" initial={false}>
                  {expanded ? (
                     <motion.span
                        key="check"
                        variants={checkVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                     >
                        <CheckIcon size={14} weight="bold" />
                     </motion.span>
                  ) : (
                     <motion.span
                        key="caret"
                        className="selector__caret-icon"
                        variants={caretVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                     >
                        <CaretUpDownIcon size={14} weight="bold" />
                     </motion.span>
                  )}
               </AnimatePresence>
            </button>
         </div>
      </div>
   );
}
