"use client";

import { motion } from "motion/react";

// The slash is a rigid rotation (its endpoints and the target X diagonal's
// endpoints both sit exactly on the (12,12) center, so a pure rotate+scale
// lands on the exact target coordinates — verified by hand, see PR notes).
const SLASH_D = "M10 20L14 4";
const SLASH_ROTATE = 30.9638;
const SLASH_SCALE = 0.9433;

// The two chevrons share a command sequence (M,L,C,L) with their targets, so
// framer-motion morphs the numbers directly. Each chevron becomes a straight
// half of the other X diagonal (split at the center), via C control points
// collapsed onto their own segment's anchors.
const CHEVRONS_CODE_D =
   "M18 8.00004L20.5858 10.5858C21.3668 11.3669 21.3668 12.6332 20.5858 13.4143L18 16M6 16L3.41421 13.4143C2.63316 12.6332 2.63317 11.3669 3.41421 10.5858L6 8.00004";

const CHEVRONS_CLOSE_D =
   "M12 12L13.8333 13.8333C13.8333 13.8333 15.6667 15.6667 15.6667 15.6667L17.5 17.5M6.5 6.5L8.3333 8.3333C8.3333 8.3333 10.1667 10.1667 10.1667 10.1667L12 12";

const MORPH_SPRING = { type: "spring" as const, stiffness: 320, damping: 30 };

export function CodeCloseIcon({ open }: { open: boolean }) {
   return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
         <motion.path
            d={SLASH_D}
            animate={{ rotate: open ? SLASH_ROTATE : 0, scale: open ? SLASH_SCALE : 1 }}
            transition={MORPH_SPRING}
            style={{ transformOrigin: "12px 12px" }}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
         />
         <motion.path
            animate={{ d: open ? CHEVRONS_CLOSE_D : CHEVRONS_CODE_D }}
            transition={MORPH_SPRING}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}
