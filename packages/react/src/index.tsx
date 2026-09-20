"use client";

import * as React from "react";

import "./style.css";

import { deriveFromHex, normalizeHex, sanitizeHexEntry, shadeOf } from "./color";
import { bloomPalettes } from "./palettes";
import type { BloomColorPickerPart, BloomColorPickerProps } from "./types";
import {
   ARC_C,
   ARC_CANVAS,
   ARC_GRADIENT_DY,
   ARC_HALF_SPAN,
   ARC_PATH,
   ARC_STROKE,
   BASE_SWATCH,
   buildPetals,
   cx,
   knobPoint,
   lightPosAt,
   petalAt,
   PETAL_SIZE,
} from "./geometry";
import { useControllableState } from "./use-controllable-state";

const FALLBACK_HEX = "#F5B81E";

export function BloomColorPicker(props: BloomColorPickerProps) {
   const {
      value: valueProp,
      defaultValue = FALLBACK_HEX,
      onChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      palette = "warm",
      outerColors,
      innerColors,
      size = 28,
      disabled = false,
      hexInput = true,
      inputVariant = "split",
      motion = "subtle",
      theme = "light",
      className,
      classNames,
      "aria-label": ariaLabel = "Pick a color",
   } = props;

   const paletteColors = bloomPalettes[palette] ?? bloomPalettes.warm;
   const resolvedOuterColors = outerColors ?? paletteColors.outer;
   const resolvedInnerColors = innerColors ?? paletteColors.inner;

   const scale = size / BASE_SWATCH;
   const part = (name: BloomColorPickerPart) => classNames?.[name];

   // "none" swaps the full spring choreography for one quick uniform fade —
   // these match the 160ms duration forced via [data-motion="none"] in style.css.
   const instant = motion === "none";
   const FADE_MS = 160;
   const PRESS_MS = instant ? FADE_MS : 140;
   const BLOOM_DELAY_MS = instant ? FADE_MS : 1300;
   const CLOSE_PETALS_MS = instant ? 0 : 110;
   const CLOSE_UNMOUNT_MS = instant ? FADE_MS : 480;

   // Outline rings scale with the picker so proportions match the original at any size
   const ring = (color: string): React.CSSProperties => ({
      outline: `${2 * scale}px solid ${color}`,
      outlineOffset: `${-2 * scale}px`,
   });

   const [rawValue, setValue] = useControllableState(valueProp, defaultValue, onChange);
   const hex = normalizeHex(rawValue) ?? FALLBACK_HEX;
   const { base, lightPos } = React.useMemo(() => deriveFromHex(hex), [hex]);

   // Draft text for the optional hex input: lets the field hold invalid/partial
   // text while typing, but stays in sync when the color changes elsewhere
   // (petal pick, arc drag) without fighting an in-progress keystroke.
   const [hexDraft, setHexDraft] = React.useState(hex);
   React.useEffect(() => {
      if (normalizeHex(hexDraft) !== hex) setHexDraft(hex);
   }, [hex]);

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
      () => buildPetals(resolvedOuterColors, resolvedInnerColors),
      [resolvedOuterColors, resolvedInnerColors]
   );

   React.useEffect(() => {
      const timers: number[] = [];
      if (open) {
         setRendered(true);
         setClosing(false);
         setPetalsHome(false);
         timers.push(window.setTimeout(() => setBloomed(true), BLOOM_DELAY_MS));
      } else {
         setBloomed(false);
         setHovered(null);
         if (renderedRef.current) {
            setClosing(true);
            timers.push(window.setTimeout(() => setPetalsHome(true), CLOSE_PETALS_MS));
            timers.push(
               window.setTimeout(() => {
                  setRendered(false);
                  setClosing(false);
                  setPetalsHome(false);
               }, CLOSE_UNMOUNT_MS)
            );
         }
      }
      return () => timers.forEach(clearTimeout);
   }, [open, BLOOM_DELAY_MS, CLOSE_PETALS_MS, CLOSE_UNMOUNT_MS]);

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
      }, PRESS_MS);
   };

   // Single source of truth for hover: pick the nearest petal under the pointer.
   // Avoids missed enter/leave events between overlapping petals.
   const handleDishMove = (e: React.PointerEvent) => {
      if (!bloomed || !dishRef.current) return;
      const rect = dishRef.current.getBoundingClientRect();
      setHovered(
         petalAt(
            petals,
            e.clientX - rect.left - rect.width / 2,
            e.clientY - rect.top - rect.height / 2,
            scale
         )
      );
   };

   const shade = hex;
   const ringColor = `color-mix(in srgb, color-mix(in srgb, ${shade}, #000 30%) 14%, transparent)`;

   // Knob position along the arc
   const { x: knobX, y: knobY } = knobPoint(lightPos);

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
         setValue(shadeOf(dragBase, lightPosAt(lx, ly)));
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
         data-slot="bcp-root"
         data-state={open ? "open" : "closed"}
         data-disabled={disabled || undefined}
         data-motion={motion}
         data-input-variant={hexInput ? inputVariant : undefined}
         data-theme={theme !== "auto" ? theme : undefined}
         onPointerMove={handleDishMove}
         onPointerLeave={() => setHovered(null)}
      >
         {rendered ? (
            <div className="bcp__slot">
               <svg
                  ref={svgRef}
                  className={cx("bcp__arc", closing && "bcp__arc--closing", part("arc"))}
                  data-slot="bcp-arc"
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
                        y1={ARC_C - ARC_GRADIENT_DY}
                        x2={ARC_C}
                        y2={ARC_C + ARC_GRADIENT_DY}
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
                     data-slot="bcp-knob"
                     onPointerDown={onKnobDown}
                     style={{ cursor: dragging ? "grabbing" : "grab" }}
                  >
                     <circle className="bcp__knob-halo" cx={knobX} cy={knobY} fill="#fff" />
                     <circle className="bcp__knob-core" cx={knobX} cy={knobY} fill={shade} />
                  </g>
               </svg>

               <div
                  className={cx("bcp__bloom", closing && "bcp__bloom--closing", part("bloom"))}
                  data-slot="bcp-bloom"
                  style={{ background: shade, ...ring(ringColor) }}
               >
                  <div
                     ref={dishRef}
                     className={cx("bcp__dish", part("dish"))}
                     data-slot="bcp-dish"
                     style={ring(ringColor)}
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
                     data-slot="bcp-petal"
                     style={
                        {
                           width: PETAL_SIZE * scale,
                           height: PETAL_SIZE * scale,
                           marginLeft: (-PETAL_SIZE / 2) * scale,
                           marginTop: (-PETAL_SIZE / 2) * scale,
                           left: `calc(50% + ${p.x * scale}px)`,
                           top: `calc(50% + ${p.y * scale}px)`,
                           background: p.color,
                           ...ring(
                              `color-mix(in srgb, color-mix(in srgb, ${p.color}, #000 30%) 18%, transparent)`
                           ),
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
               data-slot="bcp-swatch"
               style={{ backgroundColor: shade }}
               onClick={openPicker}
               disabled={disabled}
               aria-label={ariaLabel}
               aria-haspopup="dialog"
               aria-expanded={open}
            />
         )}

         {hexInput && (
            <div className="bcp__input-wrap">
               <input
                  type="text"
                  size={7}
                  className={cx("bcp__input", part("input"))}
                  data-slot="bcp-input"
                  value={hexDraft}
                  onChange={(e) => {
                     const { value: next } = sanitizeHexEntry(
                        e.target.value,
                        e.target.selectionStart ?? e.target.value.length
                     );
                     setHexDraft(next);
                     const valid = normalizeHex(next);
                     if (valid) setValue(valid);
                  }}
                  disabled={disabled}
                  spellCheck={false}
                  placeholder="#RRGGBB"
                  aria-label="Hex color value"
               />
            </div>
         )}
      </div>
   );
}

export default BloomColorPicker;

export type {
   BloomColorPickerInputVariant,
   BloomColorPickerMotion,
   BloomColorPickerPart,
   BloomColorPickerProps,
   BloomColorPickerTheme,
} from "./types";
export { deriveFromHex, hexToHsl, hslToHex, normalizeHex, shadeOf } from "./color";
export {
   bloomPalettes,
   defaultInnerColors,
   defaultOuterColors,
   type BloomColorPickerPalette,
   type BloomColorPickerPaletteColors,
} from "./palettes";
