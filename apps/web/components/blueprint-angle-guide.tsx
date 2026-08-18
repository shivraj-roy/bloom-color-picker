// Decorative protractor-style angle guide, anchored to the viewport's
// bottom-left corner — radiating lines + a ticked quarter-circle arc, like
// the angle guide printed on a cutting mat. Origin sits at (0, CANVAS).
// The rays stretch across a canvas much larger than any real viewport so
// they always reach the screen edges; the arc/ticks/labels stay compact.
const CANVAS = 3000;
const ORIGIN = { x: 0, y: CANVAS };
const ARC_R = 224;

function pointAt(angleDeg: number, r: number) {
   const rad = (angleDeg * Math.PI) / 180;
   return { x: ORIGIN.x + r * Math.cos(rad), y: ORIGIN.y - r * Math.sin(rad) };
}

const RAYS = [
   { angle: 15, bold: false },
   { angle: 30, bold: false },
   { angle: 45, bold: true },
   { angle: 60, bold: false },
   { angle: 75, bold: false },
];

const TICKS = [0, 15, 30, 45, 60, 75, 90];
const LABELS = [30, 45, 60];

export function BlueprintAngleGuide() {
   const arcStart = pointAt(0, ARC_R);
   const arcEnd = pointAt(90, ARC_R);

   return (
      <svg
         className="blueprint-angle-guide"
         width={CANVAS}
         height={CANVAS}
         viewBox={`0 0 ${CANVAS} ${CANVAS}`}
         fill="none"
         aria-hidden="true"
      >
         {RAYS.map(({ angle, bold }) => {
            const p = pointAt(angle, CANVAS);
            return (
               <line
                  key={angle}
                  x1={ORIGIN.x}
                  y1={ORIGIN.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray={bold ? undefined : "1 4"}
                  opacity={bold ? 0.5 : 0.3}
               />
            );
         })}

         <path
            d={`M ${arcStart.x} ${arcStart.y} A ${ARC_R} ${ARC_R} 0 0 0 ${arcEnd.x} ${arcEnd.y}`}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.5}
         />

         {TICKS.map((angle) => {
            const inner = pointAt(angle, ARC_R - 5);
            const outer = pointAt(angle, ARC_R + 5);
            return (
               <line
                  key={angle}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="currentColor"
                  strokeWidth={1}
                  opacity={0.5}
               />
            );
         })}

         {LABELS.map((angle) => {
            const p = pointAt(angle, ARC_R + 16);
            return (
               <text
                  key={angle}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fill="currentColor"
                  opacity={0.55}
               >
                  {angle}
               </text>
            );
         })}
      </svg>
   );
}
