"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";

export interface StepperProps {
   label: string;
   value: string;
   options: string[];
   onValueChange: (value: string) => void;
}

const HIGHLIGHT_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };
const ICON_SPRING = { type: "spring" as const, stiffness: 480, damping: 24 };

export function Stepper({ label, value, options, onValueChange }: StepperProps) {
   const [expanded, setExpanded] = useState(false);
   const [pending, setPending] = useState(value);
   const rootRef = useRef<HTMLDivElement>(null);

   const open = () => {
      setPending(value);
      setExpanded(true);
   };

   const confirm = () => {
      if (pending !== value) onValueChange(pending);
      setExpanded(false);
   };

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

   return (
      <div ref={rootRef} className="stepper">
         <span className="stepper__label" data-hidden={expanded || undefined}>
            {label}
         </span>

         <div className="stepper__group" data-expanded={expanded || undefined}>
            <div className="stepper__shape" data-expanded={expanded || undefined}>
               <div className="stepper__row">
                  {options.map((opt) => {
                     const isActive = opt === activeValue;
                     return (
                        <button
                           key={opt}
                           type="button"
                           className="stepper__option"
                           data-active={isActive || undefined}
                           data-hidden={!expanded && !isActive ? true : undefined}
                           onClick={() => (expanded ? setPending(opt) : open())}
                        >
                           {isActive && (
                              <motion.span
                                 layoutId="stepper-highlight"
                                 className="stepper__option-bg"
                                 transition={HIGHLIGHT_SPRING}
                              />
                           )}
                           <span className="stepper__option-label">{opt}</span>
                        </button>
                     );
                  })}
               </div>
            </div>

            <button
               type="button"
               className="stepper__icon-box"
               data-expanded={expanded || undefined}
               onClick={() => (expanded ? confirm() : open())}
               aria-label={expanded ? "Confirm" : "Choose palette"}
            >
               <AnimatePresence mode="wait" initial={false}>
                  {expanded ? (
                     <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={ICON_SPRING}
                     >
                        <CheckIcon size={14} weight="bold" />
                     </motion.span>
                  ) : (
                     <motion.span
                        key="caret"
                        className="stepper__caret-icon"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={ICON_SPRING}
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
