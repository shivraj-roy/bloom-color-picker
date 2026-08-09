"use client";

import type { ReactElement, SVGProps } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export type MotionValue = "none" | "subtle" | "bouncy";

export interface MotionSelectProps {
   label: string;
   value: MotionValue;
   onValueChange: (value: MotionValue) => void;
}

const UNDERLINE_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };

function NoneMotionIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M18.5 19C19.8807 19 21 17.8807 21 16.5C21 15.1193 19.8807 14 18.5 14C17.1193 14 16 15.1193 16 16.5C16 17.8807 17.1193 19 18.5 19Z"
            stroke="currentColor"
            strokeWidth="2"
         />
         <path
            d="M3.01855 18.0151C2.46627 18.0151 2.01855 18.4629 2.01855 19.0151C2.01855 19.5674 2.46627 20.0151 3.01855 20.0151V19.0151V18.0151ZM18.5675 19.0151V18.0151H3.01855V19.0151V20.0151H18.5675V19.0151Z"
            fill="currentColor"
         />
      </svg>
   );
}

function SubtleMotionIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M18.5 19C19.8807 19 21 17.8807 21 16.5C21 15.1193 19.8807 14 18.5 14C17.1193 14 16 15.1193 16 16.5C16 17.8807 17.1193 19 18.5 19Z"
            stroke="currentColor"
            strokeWidth="2"
         />
         <path
            d="M11.037 19.0002C11.037 19.0002 12.3749 14.2549 14.9999 14.2549C15.4355 14.2549 16.0492 14.5444 16.5993 14.926"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
         />
         <path
            d="M11.0369 19.0001C11.0369 19.0001 8.69886 6.04395 4.01136 6.04395C3.64236 6.04395 3.29752 6.12423 2.97534 6.27217"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
         />
      </svg>
   );
}

function BouncyMotionIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M7.51189 19.039C7.51189 19.039 6.35204 7.69827 3.01245 4.96143"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
         />
         <path
            d="M7.51184 19.0392C7.51184 19.0392 8.32434 11.0947 10.7618 11.0947C13.1993 11.0947 14.0118 19.0392 14.0118 19.0392"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
         />
         <path
            d="M14.0118 19.0393C14.0118 19.0393 14.596 15.2105 16.2596 14.0459"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
         />
         <path
            d="M18.5 15.4683C19.8807 15.4683 21 14.349 21 12.9683C21 11.5875 19.8807 10.4683 18.5 10.4683C17.1193 10.4683 16 11.5875 16 12.9683C16 14.349 17.1193 15.4683 18.5 15.4683Z"
            stroke="currentColor"
            strokeWidth="2"
         />
      </svg>
   );
}

const OPTIONS: { value: MotionValue; label: string; Icon: (props: SVGProps<SVGSVGElement>) => ReactElement }[] = [
   { value: "none", label: "No motion", Icon: NoneMotionIcon },
   { value: "subtle", label: "Subtle motion", Icon: SubtleMotionIcon },
   { value: "bouncy", label: "Bouncy motion", Icon: BouncyMotionIcon },
];

export function MotionSelect({ label, value, onValueChange }: MotionSelectProps) {
   const rowRef = useRef<HTMLDivElement>(null);
   const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
   const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);

   useLayoutEffect(() => {
      const btn = optionRefs.current[value];
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
      <div className="motion-select">
         <span className="motion-select__label">{label}</span>
         <div className="motion-select__group" ref={rowRef}>
            {OPTIONS.map(({ value: v, label: optionLabel, Icon }) => (
               <button
                  key={v}
                  ref={(el) => {
                     optionRefs.current[v] = el;
                  }}
                  type="button"
                  className="motion-select__option"
                  data-active={value === v || undefined}
                  onClick={() => onValueChange(v)}
                  aria-pressed={value === v}
                  aria-label={optionLabel}
               >
                  <Icon />
               </button>
            ))}

            {underline && (
               <motion.span
                  className="motion-select__underline"
                  initial={false}
                  animate={{ x: underline.x, width: underline.width }}
                  transition={UNDERLINE_SPRING}
               />
            )}
         </div>
      </div>
   );
}
