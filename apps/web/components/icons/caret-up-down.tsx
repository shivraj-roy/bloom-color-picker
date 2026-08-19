"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import type { Transition } from "motion/react";
import { motion, useAnimation } from "motion/react";

import { cn } from "../../lib/utils";

export interface CaretUpDownIconHandle {
   startAnimation: () => void;
   stopAnimation: () => void;
}

interface CaretUpDownIconProps extends HTMLAttributes<HTMLDivElement> {
   size?: number;
}

const DEFAULT_TRANSITION: Transition = {
   type: "spring",
   stiffness: 250,
   damping: 25,
};

// shift scaled for the 256-unit viewBox (the source icon used a 2px shift on a 24-unit grid)
const SHIFT = 21;

export const CaretUpDownIcon = forwardRef<CaretUpDownIconHandle, CaretUpDownIconProps>(
   ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const controls = useAnimation();
      const isControlledRef = useRef(false);

      useImperativeHandle(ref, () => {
         isControlledRef.current = true;

         return {
            startAnimation: () => controls.start("animate"),
            stopAnimation: () => controls.start("normal"),
         };
      });

      const handleMouseEnter = useCallback(
         (e: React.MouseEvent<HTMLDivElement>) => {
            if (isControlledRef.current) {
               onMouseEnter?.(e);
            } else {
               controls.start("animate");
            }
         },
         [controls, onMouseEnter]
      );

      const handleMouseLeave = useCallback(
         (e: React.MouseEvent<HTMLDivElement>) => {
            if (isControlledRef.current) {
               onMouseLeave?.(e);
            } else {
               controls.start("normal");
            }
         },
         [controls, onMouseLeave]
      );

      return (
         <div
            className={cn("caret-up-down-icon", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
         >
            <svg
               fill="none"
               height={size}
               width={size}
               viewBox="0 0 256 256"
               xmlns="http://www.w3.org/2000/svg"
               style={{ display: "block" }}
            >
               <motion.polyline
                  points="80 176 128 224 176 176"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="26"
                  animate={controls}
                  initial="normal"
                  transition={DEFAULT_TRANSITION}
                  variants={{
                     normal: { translateY: "0%" },
                     animate: { translateY: `${SHIFT}px` },
                  }}
               />
               <motion.polyline
                  points="80 80 128 32 176 80"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="26"
                  animate={controls}
                  initial="normal"
                  transition={DEFAULT_TRANSITION}
                  variants={{
                     normal: { translateY: "0%" },
                     animate: { translateY: `${-SHIFT}px` },
                  }}
               />
            </svg>
         </div>
      );
   }
);

CaretUpDownIcon.displayName = "CaretUpDownIcon";
