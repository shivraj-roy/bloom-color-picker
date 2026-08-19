// Hand-drawn bracket that stretches to fill its container's height — the
// caps stay a fixed size (top/bottom ticks), only the wobbly middle line
// scales, via preserveAspectRatio="none" + a non-scaling stroke so it
// doesn't get chunkier as it stretches. `style` carries the measured
// position (position: fixed top/left/height) — it's positioned by the
// caller rather than as a grid item so it can never affect .bento's own
// track sizing.
export function BracketAnnotation({ style }: { style?: React.CSSProperties }) {
   return (
      <div className="bracket-annotation" style={style} aria-hidden="true">
         <svg
            className="bracket-annotation__cap bracket-annotation__cap--top"
            width="20"
            height="2.25"
            viewBox="0 0 20 2.25"
            fill="none"
         >
            <path d="M1.5 1.125H16.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
         </svg>

         <svg
            className="bracket-annotation__line"
            width="20"
            viewBox="0 0 20 231"
            preserveAspectRatio="none"
            fill="none"
         >
            {/* local y=0/231 is the actual visual start/end (no baked-in
               padding), so the CSS inset on .bracket-annotation__line is
               what controls the gap to the caps — not this viewBox. Only x
               is left unscaled (width:20px matches exactly), so the
               anisotropic y-stretch never distorts the stroke thickness;
               vector-effect: non-scaling-stroke actually made it render
               thinner here since it averages the x/y scale instead of
               using x's untouched 1:1 ratio. */}
            <path
               d="M14.5 0C16.6597 90.613 16.6906 141.235 14.5 231"
               stroke="currentColor"
               strokeWidth="2.25"
               strokeLinecap="round"
            />
         </svg>

         <svg
            className="bracket-annotation__cap bracket-annotation__cap--bottom"
            width="20"
            height="2.25"
            viewBox="0 0 20 2.25"
            fill="none"
         >
            <path d="M3.5 1.125H18.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
         </svg>

         <span className="bracket-annotation__text">tweak it live</span>
      </div>
   );
}
