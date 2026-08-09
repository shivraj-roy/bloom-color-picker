"use client";

import type { SVGProps } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export interface DisabledSelectProps {
   label: string;
   value: boolean;
   onValueChange: (value: boolean) => void;
}

const UNDERLINE_SPRING = { type: "spring" as const, stiffness: 500, damping: 34 };

// won't open
function LockedFlowerIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg
         width="18"
         height="18"
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M7.5 12C5.01472 12 3 9.98528 3 7.5C3 6.2924 3.47567 5.1959 4.24987 4.38765M7.5 12C5.01472 12 3 14.0147 3 16.5C3 18.9853 5.01472 21 7.5 21C9.98528 21 12 18.9853 12 16.5M7.5 12H9M7.5 3C9.98528 3 12 5.01472 12 7.5C12 5.01472 14.0147 3 16.5 3C18.9853 3 21 5.01472 21 7.5C21 9.98528 18.9853 12 16.5 12C18.9853 12 21 14.0147 21 16.5M12 16.5C12 18.9853 14.0147 21 16.5 21C17.7076 21 18.8041 20.5243 19.6124 19.7501M12 16.5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.72345 10.0462C9.27251 10.5711 9 11.2538 9 12.0001C9 13.657 10.3431 15.0001 12 15.0001C12.7463 15.0001 13.429 14.7276 13.9539 14.2767M13.0166 9.17676C13.8535 9.47811 14.5177 10.1409 14.821 10.9768"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.5 9.5L8 8M14.5 9.5L16 8M14.5 14.5L16 16M9.5 14.5L8 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path d="M1.98279 2.02637L22.0002 22.0438" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
   );
}

// opens (default)
function UnlockedFlowerIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg
         width="18"
         height="18"
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M7.5 12C5.01472 12 3 9.98528 3 7.5C3 5.01472 5.01472 3 7.5 3C9.98528 3 12 5.01472 12 7.5M7.5 12C5.01472 12 3 14.0147 3 16.5C3 18.9853 5.01472 21 7.5 21C9.98528 21 12 18.9853 12 16.5M7.5 12H9M12 7.5C12 5.01472 14.0147 3 16.5 3C18.9853 3 21 5.01472 21 7.5C21 9.98528 18.9853 12 16.5 12M12 7.5V9M12 16.5C12 18.9853 14.0147 21 16.5 21C18.9853 21 21 18.9853 21 16.5C21 14.0147 18.9853 12 16.5 12M12 16.5V15M16.5 12H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.5 9.5L8 8M14.5 9.5L16 8M14.5 14.5L16 16M9.5 14.5L8 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

export function DisabledSelect({ label, value, onValueChange }: DisabledSelectProps) {
   const rowRef = useRef<HTMLDivElement>(null);
   const unlockedRef = useRef<HTMLButtonElement>(null);
   const lockedRef = useRef<HTMLButtonElement>(null);
   const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);

   useLayoutEffect(() => {
      const btn = value ? lockedRef.current : unlockedRef.current;
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
               ref={unlockedRef}
               type="button"
               className="disabled-select__option"
               data-active={!value || undefined}
               onClick={() => onValueChange(false)}
               aria-pressed={!value}
               aria-label="Enable picker"
            >
               <UnlockedFlowerIcon />
            </button>
            <button
               ref={lockedRef}
               type="button"
               className="disabled-select__option"
               data-active={value || undefined}
               onClick={() => onValueChange(true)}
               aria-pressed={value}
               aria-label="Disable picker"
            >
               <LockedFlowerIcon />
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
