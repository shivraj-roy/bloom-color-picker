"use client";

import { motion } from "motion/react";

// the extra stroke that turns the heart into a handshake — hidden until the
// nearest motion ancestor (e.g. the sponsor link) enters its "hover" variant.
// Relies on framer-motion's variant propagation: this path has no `animate`
// of its own, so it just follows whatever variant the ancestor is in.
// pathOffset animates opposite pathLength (1→0 while length goes 0→1), so
// the visible portion grows from the path's END backward to its start,
// instead of the default start-to-end reveal.
const strokeVariants = {
   rest: { pathLength: 0, pathOffset: 1, opacity: 0 },
   hover: { pathLength: 1, pathOffset: 0, opacity: 1 },
};

export function HeartIcon({ size = 14 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M21.25 9.9375C21.25 15.8672 12.7708 20.25 12 20.25C11.2292 20.25 2.75 15.8672 2.75 9.9375C2.75 5.8125 5.31944 3.75 7.88889 3.75C10.4583 3.75 12 5.29688 12 5.29688C12 5.29688 13.5417 3.75 16.1111 3.75C18.6806 3.75 21.25 5.8125 21.25 9.9375Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
         />
         <motion.path
            d="M19.5 14.5C18.8343 13.9176 15.4172 10.3451 15.4172 10.3451C14.9006 9.77785 14.0477 9.59139 13.2475 9.93685L12.3629 10.5041C10.9328 11.421 9.03005 11.005 8.11312 9.57483C7.65463 8.85979 7.86266 7.90842 8.57774 7.44995L12.6648 4.82954"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={strokeVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
         />
      </svg>
   );
}
