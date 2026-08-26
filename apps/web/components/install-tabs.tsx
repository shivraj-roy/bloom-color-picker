"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionProps } from "motion/react";

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
   const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

   // Measured geometry rather than a shared `layoutId`: the highlight owns the
   // fillets and a real 1px border, and layout projection animates by scaling —
   // which would visibly thicken the border and warp the fillets mid-flight.
   //
   // The live geometry can't be used as the target either: on switch, the new
   // tab's label is still collapsed, so aiming at what's currently on screen
   // would pull the highlight down to icon width before the label opens and
   // pushed it back out — a visible shrink-then-grow. So the target is where
   // the tab will *end up*, derived from the labels rather than waiting for
   // them: the active one gains its label's full width (scrollWidth reports it
   // even while clipped to 0), and every label before it collapses away, which
   // is exactly how far left the active tab slides.
   //
   // Both are expressed as deltas off the current layout, so they hold at any
   // point mid-flight — the numbers come out the same whether measured before
   // the transition or halfway through it, which keeps the ResizeObserver
   // below free to re-fire without ever re-aiming the spring.
   const targetX = useMotionValue(0);
   const targetWidth = useMotionValue(0);
   const x = useSpring(targetX, SLIDE_SPRING);
   const width = useSpring(targetWidth, SLIDE_SPRING);
   const hasMeasured = useRef(false);

   useEffect(() => {
      const measure = () => {
         const el = btnRefs.current[activeIdx];
         if (!el) return;

         const label = labelRefs.current[activeIdx];
         const settledWidth =
            el.offsetWidth - (label?.offsetWidth ?? 0) + (label?.scrollWidth ?? 0);

         let settledLeft = el.offsetLeft;
         for (let i = 0; i < activeIdx; i++) {
            settledLeft -= labelRefs.current[i]?.offsetWidth ?? 0;
         }

         targetX.set(settledLeft);
         targetWidth.set(settledWidth);

         // first measurement is the initial layout, not a transition — jump so
         // the highlight doesn't slide in from zero width on mount
         if (!hasMeasured.current) {
            hasMeasured.current = true;
            x.jump(settledLeft);
            width.jump(settledWidth);
         }
      };

      measure();
      // still watched so font-swap reflow and the sidebar's tablet breakpoint
      // are picked up; it no longer drives the transition itself
      const observer = new ResizeObserver(measure);
      btnRefs.current.forEach((el) => el && observer.observe(el));
      return () => observer.disconnect();
   }, [activeIdx, targetX, targetWidth, x, width]);

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
               {/* clipped to width 0 rather than unmounted, so the button keeps
                  its accessible name while collapsed to just the icon */}
               <motion.span
                  className="install-tab__label"
                  ref={(el) => {
                     labelRefs.current[i] = el;
                  }}
                  initial={false}
                  animate={{ width: option.key === value ? "auto" : 0 }}
                  transition={SLIDE_SPRING}
               >
                  {/* blurred on the text itself rather than on the wrapper —
                     the wrapper clips, and a filter there would cut the blur
                     off square at its edge */}
                  <motion.span
                     className="install-tab__label-text"
                     initial={false}
                     animate={{ filter: option.key === value ? "blur(0px)" : "blur(1.5px)" }}
                     transition={{ duration: 0.22 }}
                  >
                     {option.label}
                  </motion.span>
               </motion.span>
            </button>
         ))}

         <motion.div className="install-tabs__highlight" style={{ x, width }}>
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
