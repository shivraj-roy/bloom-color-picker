"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export interface ToggleSelectOption<T> {
   value: T;
   label: string;
   icon: ReactNode;
}

export interface ToggleSelectProps<T> {
   label: string;
   value: T;
   options: ToggleSelectOption<T>[];
   onValueChange: (value: T) => void;
}

const UNDERLINE_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };

// shared icon-pill toggle (sliding underline, N options) — used for input
// layout, motion, and disabled controls, which differ only in their options.
export function ToggleSelect<T>({ label, value, options, onValueChange }: ToggleSelectProps<T>) {
   const rowRef = useRef<HTMLDivElement>(null);
   const optionRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());
   const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);

   const activeIndex = options.findIndex((o) => o.value === value);

   useLayoutEffect(() => {
      const btn = optionRefs.current.get(activeIndex);
      const row = rowRef.current;
      if (!btn || !row) return;
      const btnRect = btn.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const INSET = 8;
      setUnderline({
         x: btnRect.left - rowRect.left + INSET,
         width: btnRect.width - INSET * 2,
      });
   }, [activeIndex]);

   return (
      <div className="toggle-select">
         <span className="toggle-select__label">{label}</span>
         <div className="toggle-select__group" ref={rowRef}>
            {options.map((option, i) => (
               <button
                  key={option.label}
                  ref={(el) => {
                     optionRefs.current.set(i, el);
                  }}
                  type="button"
                  className="toggle-select__option"
                  data-active={i === activeIndex || undefined}
                  onClick={() => onValueChange(option.value)}
                  aria-pressed={i === activeIndex}
                  aria-label={option.label}
               >
                  {option.icon}
               </button>
            ))}

            {underline && (
               <motion.span
                  className="toggle-select__underline"
                  initial={false}
                  animate={{ x: underline.x, width: underline.width }}
                  transition={UNDERLINE_SPRING}
               />
            )}
         </div>
      </div>
   );
}
