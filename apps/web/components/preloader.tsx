"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { AnimatedBloomLogo } from "./animated-bloom-logo";

// matches AnimatedBloomLogo's own timing: bloom-in finishes at 1.2s (outer petal,
// the last to start, 0.3s delay + 0.9s duration); once close starts, the
// inner petal (closest to center, last to close) begins scaling down at
// +0.3s — that's the moment we start fading the whole overlay out, so it's
// gone by the time the last petal actually finishes closing.
const BLOOM_DURATION_MS = 1200;
const CLOSE_START_TO_FADE_MS = 300;

export function Preloader() {
   const [phase, setPhase] = useState<"bloom" | "close">("bloom");
   const [fading, setFading] = useState(false);

   useEffect(() => {
      const toClose = setTimeout(() => setPhase("close"), BLOOM_DURATION_MS);
      const toFade = setTimeout(() => setFading(true), BLOOM_DURATION_MS + CLOSE_START_TO_FADE_MS);
      return () => {
         clearTimeout(toClose);
         clearTimeout(toFade);
      };
   }, []);

   return (
      <motion.div
         className="preloader"
         style={{ pointerEvents: fading ? "none" : "auto" }}
         animate={{ opacity: fading ? 0 : 1 }}
         transition={{ duration: 0.6, ease: "easeInOut" }}
      >
         <AnimatedBloomLogo size={64} phase={phase} />
      </motion.div>
   );
}
