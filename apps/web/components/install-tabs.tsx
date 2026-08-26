"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type MotionProps } from "motion/react";

const SLIDE_SPRING = { type: "spring" as const, stiffness: 380, damping: 34 };

// Radius of the concave fillets that blend the active tab's bottom corners into
// the box below it.
const R = 8;
// The fill deliberately overruns the arc on two sides rather than stopping at
// it: IN px back into the tab (painting over the last stretch of the tab's own
// straight side border, which would otherwise cut across the curve) and DOWN px
// past the box's top border (erasing the segment of it the curve replaces).
// Overrunning means the joins can't leave a hairline gap if anything lands a
// subpixel off — everything it covers is the same colour as what it paints.
const IN = 3;
const DOWN = 3;

// Each arc is tangent to the tab's vertical border where it starts and to the
// box's horizontal top border where it ends, so the 1px outline reads as one
// continuous line turning the corner. y = R is the border line; the extra DOWN
// below it is fill only.
const RIGHT_ARC = `M0,0 A${R},${R} 0 0 0 ${R},${R}`;
const RIGHT_FILL = `${RIGHT_ARC} L${R},${R + DOWN} L${-IN},${R + DOWN} L${-IN},0 Z`;
const LEFT_ARC = `M${R},0 A${R},${R} 0 0 1 0,${R}`;
const LEFT_FILL = `${LEFT_ARC} L0,${R + DOWN} L${R + IN},${R + DOWN} L${R + IN},0 Z`;

function Fillet({ side, ...motionProps }: { side: "left" | "right" } & MotionProps) {
   const isLeft = side === "left";
   return (
      <motion.svg
         className={`install-tabs__fillet install-tabs__fillet--${side}`}
         width={R + IN}
         height={R + DOWN}
         viewBox={`${isLeft ? 0 : -IN} 0 ${R + IN} ${R + DOWN}`}
         overflow="visible"
         aria-hidden="true"
         {...motionProps}
      >
         <path d={isLeft ? LEFT_FILL : RIGHT_FILL} className="install-tabs__fillet-fill" />
         <path d={isLeft ? LEFT_ARC : RIGHT_ARC} className="install-tabs__fillet-edge" />
      </motion.svg>
   );
}

export interface InstallTabOption<T extends string> {
   key: T;
   label: string;
   icon: React.ReactNode;
}

export function InstallTabs<T extends string>({
   options,
   value,
   onValueChange,
}: {
   options: InstallTabOption<T>[];
   value: T;
   onValueChange: (next: T) => void;
}) {
   const activeIdx = options.findIndex((o) => o.key === value);
   const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
   const [highlight, setHighlight] = useState({ left: 0, width: 0 });

   // Measured offsetLeft/offsetWidth rather than a shared `layoutId`: the
   // highlight owns the fillets and a real border, and layout projection
   // distorts both while it interpolates. Re-measured on resize because the
   // sidebar narrows at the tablet breakpoint.
   useEffect(() => {
      const measure = () => {
         const el = btnRefs.current[activeIdx];
         if (el) setHighlight({ left: el.offsetLeft, width: el.offsetWidth });
      };

      measure();
      const raf = window.requestAnimationFrame(measure); // re-check once fonts settle
      window.addEventListener("resize", measure);
      return () => {
         window.cancelAnimationFrame(raf);
         window.removeEventListener("resize", measure);
      };
   }, [activeIdx]);

   return (
      <div className="install-tabs">
         {options.map((option, i) => (
            <button
               key={option.key}
               type="button"
               ref={(el) => {
                  btnRefs.current[i] = el;
               }}
               className={`install-tab${option.key === value ? " install-tab--active" : ""}`}
               onClick={() => onValueChange(option.key)}
               aria-pressed={option.key === value}
            >
               {option.icon}
               {option.label}
            </button>
         ))}

         <motion.div
            className="install-tabs__highlight"
            initial={false}
            animate={{ x: highlight.left, width: highlight.width }}
            transition={SLIDE_SPRING}
         >
            {/* no fillet left of the first tab — nothing there to blend into */}
            <AnimatePresence>
               {activeIdx > 0 && (
                  <Fillet
                     key="left-fillet"
                     side="left"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.15 }}
                  />
               )}
            </AnimatePresence>
            <Fillet side="right" />
         </motion.div>
      </div>
   );
}
