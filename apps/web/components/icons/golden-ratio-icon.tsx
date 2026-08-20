// Nested golden-rectangle squares (static grid) plus the spiral arc that
// winds through them — the classic golden ratio diagram.

// the line splitting the outer rectangle into the first golden square —
// drawn top to bottom (reversed from the source SVG's bottom-up direction)
const CENTER_LINE_D = "M562.841 19.3975V563.149";

// the bottom edge under the big (left) square — drawn right to left,
// after the center line finishes
const BOTTOM_LINE_D = "M563 563.149H18.8977";

// the big square's left edge — drawn bottom to top, continuing from where
// the bottom line ends (source direction already runs this way)
const LEFT_LINE_D = "M18.8982 563.149V18.8975";

// the big square's top edge — drawn left to right, continuing from where
// the left line ends, back to the center line's start
const TOP_LINE_D = "M18.8977 18.897H563";

// top edge, right of center — drawn left to right, continuing from the
// top line's end (source direction already runs this way)
const TOP_RIGHT_LINE_D = "M563 18.897H899.528";

// the outer rectangle's right edge — drawn top to bottom, continuing from
// where the top-right line ends (reversed from source's bottom-up direction)
const RIGHT_LINE_D = "M899.028 18.8975V562.649";

// bottom edge, right of center — drawn right to left, continuing from the
// right line's end back to the center line's start, closing the loop
const BOTTOM_RIGHT_LINE_D = "M899.528 563.149H563";

// divider for the second nested square — drawn left to right (source
// direction already runs this way)
const MID_LINE_D = "M562.841 355.275H899.219";

// divider for the third nested square — drawn bottom to top (reversed
// from the source SVG's top-down direction)
const SMALL_CENTER_LINE_D = "M691.272 563.15V355.467";

// the spiral, split into its 9 arcs so each can draw in sequence, largest
// to smallest, each continuing from where the last left off. Arcs whose
// source direction ran the wrong way for that continuation are reversed
// (control points reordered, segment order flipped) — noted per arc.
const SPIRAL_ARC_1_D =
   "M18.8982 563.149C18.8982 418.938 76.2063 280.632 178.215 178.659C280.224 76.6859 418.578 19.3979 562.841 19.3979";
// reversed
const SPIRAL_ARC_2_D =
   "M562.841 19.3975C652.003 19.3975 737.513 54.8046 800.561 117.83C863.608 180.855 899.027 266.335 899.027 355.466";
// reversed
const SPIRAL_ARC_3_D =
   "M899.028 355.466C899.028 410.547 877.139 463.372 838.178 502.32C799.216 541.268 746.372 563.149 691.272 563.149";
// reversed
const SPIRAL_ARC_4_D =
   "M691.272 563.148C657.21 563.148 624.543 549.622 600.458 525.545C576.372 501.468 562.841 468.813 562.841 434.763";
// source direction already runs this way
const SPIRAL_ARC_5_D =
   "M562.842 434.763C562.842 413.733 571.199 393.563 586.075 378.692C600.952 363.821 621.128 355.467 642.166 355.467";
// reversed
const SPIRAL_ARC_6_D =
   "M642.166 355.467C648.615 355.467 655 356.736 660.958 359.203C666.916 361.67 672.329 365.286 676.889 369.844C681.449 374.403 685.066 379.814 687.534 385.77C690.001 391.725 691.271 398.109 691.271 404.555";
// source direction already runs this way
const SPIRAL_ARC_7_D =
   "M691.272 404.554C691.272 408.521 690.49 412.449 688.971 416.114C687.453 419.779 685.227 423.109 682.421 425.914C679.615 428.72 676.284 430.945 672.617 432.463C668.951 433.981 665.022 434.762 661.053 434.762";
// reversed
const SPIRAL_ARC_8_D =
   "M661.053 434.763C658.572 434.763 656.117 434.274 653.825 433.326C651.534 432.377 649.452 430.986 647.698 429.233C645.944 427.48 644.553 425.399 643.604 423.108C642.655 420.817 642.166 418.362 642.166 415.883";
// source direction already runs this way — the spiral's eye
const SPIRAL_ARC_9_D =
   "M642.167 415.883C642.167 412.879 643.361 409.998 645.486 407.873C647.611 405.749 650.493 404.556 653.498 404.556";

export function GoldenRatioIcon() {
   return (
      <svg
         className="golden-ratio-icon"
         viewBox="0 0 915 580"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d={CENTER_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__center-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={BOTTOM_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__bottom-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={LEFT_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__left-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={TOP_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__top-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={TOP_RIGHT_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__top-right-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={RIGHT_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__right-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={BOTTOM_RIGHT_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__bottom-right-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={MID_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__mid-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SMALL_CENTER_LINE_D}
            pathLength={1}
            className="golden-ratio-icon__small-center-line"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_1_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-1"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_2_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-2"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_3_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-3"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_4_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-4"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_5_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-5"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_6_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-6"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_7_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-7"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_8_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-8"
            strokeWidth={5}
            strokeLinecap="round"
         />
         <path
            d={SPIRAL_ARC_9_D}
            pathLength={1}
            className="golden-ratio-icon__spiral-arc-9"
            strokeWidth={5}
            strokeLinecap="round"
         />
      </svg>
   );
}
