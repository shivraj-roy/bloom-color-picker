"use client";

import type { SVGProps } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export type InputVariant = "split" | "grouped";

export interface InputVariantSelectProps {
   label: string;
   value: InputVariant;
   onValueChange: (value: InputVariant) => void;
}

const UNDERLINE_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };

// swatch and input as separate elements
function SplitIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M9 12C9 13.6569 7.6569 15 6 15C4.3431 15 3 13.6569 3 12C3 10.3431 4.3431 9 6 9C7.6569 9 9 10.3431 9 12Z"
            stroke="currentColor"
            strokeWidth="2"
         />
         <rect x="12" y="10" width="10" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
   );
}

// swatch and input grouped in one shared box
function GroupedIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M22 12C22 15.3137 19.3137 18 16 18H8C4.6863 18 2 15.3137 2 12C2 8.6863 4.6863 6 8 6H16C19.3137 6 22 8.6863 22 12Z"
            stroke="currentColor"
            strokeWidth="2"
         />
         <path
            d="M11 12C11 13.6569 9.6569 15 8 15C6.3431 15 5 13.6569 5 12C5 10.3431 6.3431 9 8 9C9.6569 9 11 10.3431 11 12Z"
            stroke="currentColor"
            strokeWidth="2"
         />
      </svg>
   );
}

export function InputVariantSelect({ label, value, onValueChange }: InputVariantSelectProps) {
   const rowRef = useRef<HTMLDivElement>(null);
   const splitRef = useRef<HTMLButtonElement>(null);
   const groupedRef = useRef<HTMLButtonElement>(null);
   const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);

   useLayoutEffect(() => {
      const btn = value === "grouped" ? groupedRef.current : splitRef.current;
      const row = rowRef.current;
      if (!btn || !row) return;
      const btnRect = btn.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const INSET = 8;
      setUnderline({
         x: btnRect.left - rowRect.left + INSET,
         width: btnRect.width - INSET * 2,
      });
   }, [value]);

   return (
      <div className="disabled-select">
         <span className="disabled-select__label">{label}</span>
         <div className="disabled-select__group" ref={rowRef}>
            <button
               ref={splitRef}
               type="button"
               className="disabled-select__option"
               data-active={value === "split" || undefined}
               onClick={() => onValueChange("split")}
               aria-pressed={value === "split"}
               aria-label="Split swatch and input"
            >
               <SplitIcon />
            </button>
            <button
               ref={groupedRef}
               type="button"
               className="disabled-select__option"
               data-active={value === "grouped" || undefined}
               onClick={() => onValueChange("grouped")}
               aria-pressed={value === "grouped"}
               aria-label="Group swatch and input"
            >
               <GroupedIcon />
            </button>

            {underline && (
               <motion.span
                  className="disabled-select__underline"
                  initial={false}
                  animate={{ x: underline.x, width: underline.width }}
                  transition={UNDERLINE_SPRING}
               />
            )}
         </div>
      </div>
   );
}
