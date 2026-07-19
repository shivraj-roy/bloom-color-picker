import * as React from "react";

import "./style.css";

import { deriveFromHex, normalizeHex, shadeOf } from "./color";
import type { BloomColorPickerPart, BloomColorPickerProps } from "./types";
import { useControllableState } from "./use-controllable-state";

const TAU = Math.PI * 2;

// Base geometry, defined at size = 50 (closed swatch diameter). Everything scales linearly.
const BASE_SWATCH = 50;
const BLOOM_SIZE = 280;
const PETAL_SIZE = 54;
const OUTER_RADIUS = 78;
const INNER_RADIUS = 42;

// Brightness arc (SVG canvas units — the svg element scales as a whole)
const ARC_CANVAS = 360;
const ARC_C = ARC_CANVAS / 2;
const ARC_RADIUS = 170;
const ARC_HALF_SPAN = 26; // degrees above & below 3 o'clock
const ARC_STROKE = 20;

// Curated warm color wheel, clockwise from the top.
export const defaultOuterColors = [
   "#F7C13F", // yellow (top)
   "#F2A23C", // amber
   "#EE8440", // orange
   "#E96544", // coral
   "#E84C3F", // red
   "#E03E66", // rose
   "#D23C92", // magenta (bottom)
   "#A24FC8", // purple
   "#7B5FD4", // violet
   "#4E72D6", // blue
   "#3DA1B8", // teal
   "#5FB95B", // green
];

// Pastel inner ring, clockwise from the top.
export const defaultInnerColors = [
   "#F6E6A4", // pale yellow (top)
   "#F4D0B0", // pale peach
   "#F1C1C4", // pale red/pink
   "#E3C4DE", // pale magenta
   "#CCC9EC", // pale violet/blue
   "#C6E0C9", // pale teal/green
];

interface Petal {
   key: string;
   x: number;
   y: number;
   color: string;
   order: number;
}

function buildPetals(outer: string[], inner: string[]): Petal[] {
   const raw: Array<Omit<Petal, "order"> & { radius: number; angleNorm: number }> = [];

   // Outer ring first so inner petals overlap on top.
   outer.forEach((color, i) => {
      const angle = (i / outer.length) * TAU - Math.PI / 2;
      raw.push({
         key: `o${i}`,
         x: Math.cos(angle) * OUTER_RADIUS,
         y: Math.sin(angle) * OUTER_RADIUS,
         color,
         radius: OUTER_RADIUS,
         angleNorm: i / outer.length,
      });
   });

   inner.forEach((color, i) => {
      const angle = (i / inner.length) * TAU - Math.PI / 2;
      raw.push({
         key: `i${i}`,
         x: Math.cos(angle) * INNER_RADIUS,
         y: Math.sin(angle) * INNER_RADIUS,
         color,
         radius: INNER_RADIUS,
         angleNorm: i / inner.length,
      });
   });

   // White center on top
   raw.push({ key: "center", x: 0, y: 0, color: "#FFFFFF", radius: 0, angleNorm: 0 });

   // Spiral reveal order: radius + angle so it winds outward (rings interleave)
   const orderOf = new Map<string, number>();
   raw
      .map((p) => ({ key: p.key, m: p.radius / OUTER_RADIUS + p.angleNorm }))
      .sort((a, b) => a.m - b.m)
      .forEach((e, idx) => orderOf.set(e.key, idx));

   return raw.map((p) => ({ key: p.key, x: p.x, y: p.y, color: p.color, order: orderOf.get(p.key)! }));
}

function arcPath(): string {
   const a0 = (-ARC_HALF_SPAN * Math.PI) / 180;
   const a1 = (ARC_HALF_SPAN * Math.PI) / 180;
   const x0 = ARC_C + ARC_RADIUS * Math.cos(a0);
   const y0 = ARC_C + ARC_RADIUS * Math.sin(a0);
   const x1 = ARC_C + ARC_RADIUS * Math.cos(a1);
   const y1 = ARC_C + ARC_RADIUS * Math.sin(a1);
   return `M${x0} ${y0} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${x1} ${y1}`;
}

const ARC_PATH = arcPath();

function cx(...parts: Array<string | false | null | undefined>): string {
   return parts.filter(Boolean).join(" ");
}

const FALLBACK_HEX = "#F5B81E";

export function BloomColorPicker(props: BloomColorPickerProps) {
   const {
      value: valueProp,
      defaultValue = FALLBACK_HEX,
      onChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      outerColors = defaultOuterColors,
      innerColors = defaultInnerColors,
      size = BASE_SWATCH,
      disabled = false,
      className,
      classNames,
      "aria-label": ariaLabel = "Pick a color",
   } = props;

   const scale = size / BASE_SWATCH;
   const part = (name: BloomColorPickerPart) => classNames?.[name];

   const [rawValue, setValue] = useControllableState(valueProp, defaultValue, onChange);
   const hex = normalizeHex(rawValue) ?? FALLBACK_HEX;
   const { base, lightPos } = React.useMemo(() => deriveFromHex(hex), [hex]);

   const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);

   // Presentation lifecycle: the bloom stays mounted through the two-phase close
   // (circles collapse at 0ms, petals converge at 110ms, unmount at 480ms).
   const [rendered, setRendered] = React.useState(open);
   const [closing, setClosing] = React.useState(false);
   const [petalsHome, setPetalsHome] = React.useState(false);
   const [bloomed, setBloomed] = React.useState(false); // spiral entrance finished
   const [pressing, setPressing] = React.useState(false);
   const [dragging, setDragging] = React.useState(false);
   const [hovered, setHovered] = React.useState<string | null>(null);

   const renderedRef = React.useRef(rendered);
   renderedRef.current = rendered;

   const containerRef = React.useRef<HTMLDivElement>(null);
   const dishRef = React.useRef<HTMLDivElement>(null);
   const svgRef = React.useRef<SVGSVGElement>(null);

   const gradientId = React.useId();

   const petals = React.useMemo(
      () => buildPetals(outerColors, innerColors),
      [outerColors, innerColors]
   );

   React.useEffect(() => {
      const timers: number[] = [];
      if (open) {
         setRendered(true);
         setClosing(false);
         setPetalsHome(false);
         timers.push(window.setTimeout(() => setBloomed(true), 1300));
      } else {
         setBloomed(false);
         setHovered(null);
         if (renderedRef.current) {
            setClosing(true);
            timers.push(window.setTimeout(() => setPetalsHome(true), 110));
            timers.push(
               window.setTimeout(() => {
                  setRendered(false);
                  setClosing(false);
                  setPetalsHome(false);
               }, 480)
            );
         }
      }
      return () => timers.forEach(clearTimeout);
   }, [open]);

   // Close on outside click / Escape
   React.useEffect(() => {
      if (!open) return;
      const onDown = (e: PointerEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setOpen(false);
         }
      };
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("pointerdown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
         document.removeEventListener("pointerdown", onDown);
         document.removeEventListener("keydown", onKey);
      };
   }, [open, setOpen]);

   const openPicker = () => {
      if (disabled) return;
      setPressing(true);
      window.setTimeout(() => {
         setPressing(false);
         setOpen(true);
      }, 140);
   };

   // Single source of truth for hover: pick the nearest petal under the pointer.
   // Avoids missed enter/leave events between overlapping petals.
   const handleDishMove = (e: React.PointerEvent) => {
      if (!bloomed || !dishRef.current) return;
      const rect = dishRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left - rect.width / 2;
      const py = e.clientY - rect.top - rect.height / 2;
      let best: string | null = null;
      let bestDist = ((PETAL_SIZE * scale) / 2) ** 2;
      for (const p of petals) {
         const d = (px - p.x * scale) ** 2 + (py - p.y * scale) ** 2;
         if (d <= bestDist) {
            bestDist = d;
            best = p.key;
         }
      }
      setHovered(best);
   };

   const shade = hex;
   const ringColor = `color-mix(in srgb, color-mix(in srgb, ${shade}, #000 30%) 14%, transparent)`;

   // Knob position along the arc
   const knobAngle = ((-ARC_HALF_SPAN + lightPos * 2 * ARC_HALF_SPAN) * Math.PI) / 180;
   const knobX = ARC_C + ARC_RADIUS * Math.cos(knobAngle);
   const knobY = ARC_C + ARC_RADIUS * Math.sin(knobAngle);

   const onKnobDown = (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      const dragBase = base; // hue/saturation are stable for the whole drag
      const updateFromPointer = (clientX: number, clientY: number) => {
         const svg = svgRef.current;
         if (!svg) return;
         const rect = svg.getBoundingClientRect();
         const lx = (clientX - rect.left) * (ARC_CANVAS / rect.width);
         const ly = (clientY - rect.top) * (ARC_CANVAS / rect.height);
         let deg = (Math.atan2(ly - ARC_C, lx - ARC_C) * 180) / Math.PI;
         deg = Math.max(-ARC_HALF_SPAN, Math.min(ARC_HALF_SPAN, deg));
         const pos = (deg + ARC_HALF_SPAN) / (2 * ARC_HALF_SPAN);
         setValue(shadeOf(dragBase, pos));
      };
      updateFromPointer(e.clientX, e.clientY);
      const move = (ev: PointerEvent) => updateFromPointer(ev.clientX, ev.clientY);
      const up = () => {
         setDragging(false);
         window.removeEventListener("pointermove", move);
         window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
   };

   const pickPetal = (color: string) => {
      const normalized = normalizeHex(color);
      if (!normalized) return;
      // Round-trip through the internal model so the reported hex matches
      // what the knob/gradient will display for this petal.
      const { base: petalBase, lightPos: petalPos } = deriveFromHex(normalized);
      setValue(shadeOf(petalBase, petalPos));
   };

   return (
      <div
         ref={containerRef}
         className={cx("bcp", dragging && "bcp--dragging", className, part("root"))}
         style={{ "--bcp-scale": scale } as React.CSSProperties}
         data-state={open ? "open" : "closed"}
         data-disabled={disabled || undefined}
         onPointerMove={handleDishMove}
         onPointerLeave={() => setHovered(null)}
      >
         {rendered ? (
            <div className="bcp__slot">
               <svg
                  ref={svgRef}
                  className={cx("bcp__arc", closing && "bcp__arc--closing", part("arc"))}
                  width={ARC_CANVAS * scale}
                  height={ARC_CANVAS * scale}
                  viewBox={`0 0 ${ARC_CANVAS} ${ARC_CANVAS}`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <defs>
                     <linearGradient
                        id={gradientId}
                        gradientUnits="userSpaceOnUse"
                        x1={ARC_C}
                        y1={ARC_C - ARC_RADIUS * Math.sin((ARC_HALF_SPAN * Math.PI) / 180)}
                        x2={ARC_C}
                        y2={ARC_C + ARC_RADIUS * Math.sin((ARC_HALF_SPAN * Math.PI) / 180)}
                     >
                        <stop offset="0" stopColor="#ffffff" />
                        <stop offset="0.35" stopColor={base} />
                        <stop offset="0.65" stopColor={base} />
                        <stop offset="1" stopColor="#000000" />
                     </linearGradient>
                  </defs>
                  <path
                     d={ARC_PATH}
                     stroke={ringColor}
                     strokeWidth={ARC_STROKE + 4}
                     strokeLinecap="round"
                  />
                  <path
                     d={ARC_PATH}
                     stroke={`url(#${gradientId})`}
                     strokeWidth={ARC_STROKE}
                     strokeLinecap="round"
                  />

                  {/* Knob: selected shade with a white ring */}
                  <g
                     className={cx("bcp__knob", part("knob"))}
                     onPointerDown={onKnobDown}
                     style={{ cursor: dragging ? "grabbing" : "grab" }}
                  >
                     <circle className="bcp__knob-halo" cx={knobX} cy={knobY} fill="#fff" />
                     <circle className="bcp__knob-core" cx={knobX} cy={knobY} fill={shade} />
                  </g>
               </svg>

               <div
                  className={cx("bcp__bloom", closing && "bcp__bloom--closing", part("bloom"))}
                  style={{
                     background: shade,
                     outline: `2px solid ${ringColor}`,
                     outlineOffset: "-2px",
                  }}
               >
                  <div
                     ref={dishRef}
                     className={cx("bcp__dish", part("dish"))}
                     style={{ outline: `2px solid ${ringColor}`, outlineOffset: "-2px" }}
                  />
               </div>

               {/* Petals — siblings of the bloom so they outlive the circle close */}
               {petals.map((p) => (
                  <button
                     key={p.key}
                     type="button"
                     className={cx(
                        "bcp__petal",
                        hovered === p.key && !petalsHome && "bcp__petal--hovered",
                        petalsHome && "bcp__petal--home",
                        part("petal")
                     )}
                     style={
                        {
                           width: PETAL_SIZE * scale,
                           height: PETAL_SIZE * scale,
                           marginLeft: (-PETAL_SIZE / 2) * scale,
                           marginTop: (-PETAL_SIZE / 2) * scale,
                           left: `calc(50% + ${p.x * scale}px)`,
                           top: `calc(50% + ${p.y * scale}px)`,
                           background: p.color,
                           outline: `2px solid color-mix(in srgb, color-mix(in srgb, ${p.color}, #000 30%) 18%, transparent)`,
                           outlineOffset: "-2px",
                           "--bcp-from-x": `${-p.x * scale}px`,
                           "--bcp-from-y": `${-p.y * scale}px`,
                           "--bcp-petal-delay": `${0.06 + p.order * 0.022}s`,
                        } as React.CSSProperties
                     }
                     onClick={() => pickPetal(p.color)}
                     aria-label={p.color}
                  />
               ))}
            </div>
         ) : (
            <button
               type="button"
               className={cx("bcp__swatch", pressing && "bcp__swatch--pressing", part("swatch"))}
               style={{ backgroundColor: shade }}
               onClick={openPicker}
               disabled={disabled}
               aria-label={ariaLabel}
               aria-haspopup="dialog"
               aria-expanded={open}
            />
         )}
      </div>
   );
}

export default BloomColorPicker;

export type { BloomColorPickerPart, BloomColorPickerProps } from "./types";
export { deriveFromHex, hexToHsl, hslToHex, normalizeHex, shadeOf } from "./color";
