"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { AccordionRows, type AccordionRow } from "./accordion-table";

const PROPS: AccordionRow[] = [
   {
      key: "value",
      name: "value?",
      type: "string",
      description: "Controlled hex value.",
      meta: [{ label: "Type", value: "string | undefined" }],
   },
   {
      key: "defaultValue",
      name: "defaultValue?",
      type: "string",
      description: "Initial hex value when uncontrolled.",
      meta: [
         { label: "Type", value: "string | undefined" },
         { label: "Default", value: '"#F5B81E"' },
      ],
   },
   {
      key: "onChange",
      name: "onChange?",
      type: "function",
      typeMuted: true,
      description: "Fired with the new hex on every pick or brightness drag.",
      meta: [{ label: "Type", value: "(hex: string) => void" }],
   },
   {
      key: "open",
      name: "open?",
      type: "boolean",
      description: "Controlled open state of the bloom.",
      meta: [{ label: "Type", value: "boolean | undefined" }],
   },
   {
      key: "defaultOpen",
      name: "defaultOpen?",
      type: "boolean",
      description: "Initial open state when uncontrolled.",
      meta: [
         { label: "Type", value: "boolean | undefined" },
         { label: "Default", value: "false" },
      ],
   },
   {
      key: "onOpenChange",
      name: "onOpenChange?",
      type: "function",
      typeMuted: true,
      description: "Fired on swatch click, outside click, or Escape.",
      meta: [{ label: "Type", value: "(open: boolean) => void" }],
   },
   {
      key: "palette",
      name: "palette?",
      type: "string",
      description: "Built-in petal color scheme. Ignored where outerColors/innerColors is set.",
      meta: [
         { label: "Type", value: '"warm" | "ocean" | "blossom" | "pastel"' },
         { label: "Default", value: '"warm"' },
      ],
   },
   {
      key: "outerColors",
      name: "outerColors?",
      type: "string[]",
      description: "Outer petal ring, clockwise from the top. Overrides palette.",
      meta: [
         { label: "Type", value: "string[] | undefined" },
         { label: "Default", value: "from palette" },
      ],
   },
   {
      key: "innerColors",
      name: "innerColors?",
      type: "string[]",
      description: "Inner petal ring, clockwise from the top. Overrides palette.",
      meta: [
         { label: "Type", value: "string[] | undefined" },
         { label: "Default", value: "from palette" },
      ],
   },
   {
      key: "size",
      name: "size?",
      type: "number",
      description: "Closed swatch diameter in px; the whole bloom scales with it.",
      meta: [
         { label: "Type", value: "number | undefined" },
         { label: "Default", value: "28" },
      ],
   },
   {
      key: "disabled",
      name: "disabled?",
      type: "boolean",
      description: "Prevents opening the picker.",
      meta: [
         { label: "Type", value: "boolean | undefined" },
         { label: "Default", value: "false" },
      ],
   },
   {
      key: "hexInput",
      name: "hexInput?",
      type: "boolean",
      description: "Editable hex text field beside the closed swatch. Invalid characters can't be typed.",
      meta: [
         { label: "Type", value: "boolean | undefined" },
         { label: "Default", value: "true" },
      ],
   },
   {
      key: "inputVariant",
      name: "inputVariant?",
      type: "string",
      description: 'Layout for the swatch + hex input. Ignored when hexInput is false.',
      meta: [
         { label: "Type", value: '"split" | "grouped"' },
         { label: "Default", value: '"split"' },
      ],
   },
   {
      key: "motion",
      name: "motion?",
      type: "string",
      description: "Spring intensity for open/close and pick animations.",
      meta: [
         { label: "Type", value: '"none" | "subtle" | "bouncy"' },
         { label: "Default", value: '"subtle"' },
      ],
   },
   {
      key: "className",
      name: "className?",
      type: "string",
      description: "Class applied to the root element.",
      meta: [{ label: "Type", value: "string | undefined" }],
   },
   {
      key: "classNames",
      name: "classNames?",
      type: "object",
      description: "Per-part classes. Every part also carries a data-slot attribute, so plain CSS attribute selectors work without this prop — see the Styling tab.",
      meta: [{ label: "Type", value: "Partial<Record<part, string>>" }],
   },
   {
      key: "aria-label",
      name: "aria-label?",
      type: "string",
      description: "Accessible label for the closed swatch.",
      meta: [
         { label: "Type", value: "string | undefined" },
         { label: "Default", value: '"Pick a color"' },
      ],
   },
];

const CSS_VARIABLES: AccordionRow[] = [
   {
      key: "--bcp-color-focus",
      name: "--bcp-color-focus",
      type: "Hex text field",
      description: "Focus ring color for the grouped hex input.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#4e72d6" }],
   },
   {
      key: "--bcp-swatch-ring",
      name: "--bcp-swatch-ring",
      type: "Swatch button",
      description: "Outline ring drawn around the closed swatch.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#fff" }],
   },
   {
      key: "--bcp-swatch-shadow",
      name: "--bcp-swatch-shadow",
      type: "Swatch button",
      description: "Drop shadow under the closed swatch.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "rgba(0,0,0,.08)" }],
   },
   {
      key: "--bcp-bloom-shadow",
      name: "--bcp-bloom-shadow",
      type: "Bloom circle",
      description: "Drop shadow under the open bloom circle.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "rgba(0,0,0,.12)" }],
   },
   {
      key: "--bcp-dish-bg",
      name: "--bcp-dish-bg",
      type: "Dish",
      description: "Background of the inset dish that holds the petals.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "rgba(233,234,236,.8)" }],
   },
   {
      key: "--bcp-petal-shadow",
      name: "--bcp-petal-shadow",
      type: "Petal button",
      description: "Drop shadow under each petal.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "rgba(0,0,0,.06)" }],
   },
   {
      key: "--bcp-input-bg",
      name: "--bcp-input-bg",
      type: "Hex text field",
      description: "Background of the hex input, and the grouped pill in inputVariant=\"grouped\".",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#f2f2f4" }],
   },
   {
      key: "--bcp-input-border",
      name: "--bcp-input-border",
      type: "Hex text field",
      description: "Border of the hex input, and the grouped pill in inputVariant=\"grouped\".",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#e4e4e9" }],
   },
   {
      key: "--bcp-input-color",
      name: "--bcp-input-color",
      type: "Hex text field",
      description: "Hex input text color while idle.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#8a8a92" }],
   },
   {
      key: "--bcp-input-color-focus",
      name: "--bcp-input-color-focus",
      type: "Hex text field",
      description: "Hex input text color while focused.",
      meta: [{ label: "Kind", value: "CSS Variable" }, { label: "Default", value: "#1a1a1a" }],
   },
];

const DATA_SLOTS: AccordionRow[] = [
   {
      key: "root",
      name: "bcp-root",
      type: "Root container",
      description: "The whole picker's outer container, always present, wraps everything.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "swatch",
      name: "bcp-swatch",
      type: "Swatch button",
      description: "The closed circular swatch button, shown when the picker is collapsed.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "bloom",
      name: "bcp-bloom",
      type: "Bloom circle",
      description: "The large open circle, the morphed swatch, holds the dish.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "dish",
      name: "bcp-dish",
      type: "Dish",
      description: "The inset pastel disc inside the bloom, where the petals sit.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "petal",
      name: "bcp-petal",
      type: "Petal button",
      description: "Every individual petal swatch, applied to all outer and inner ring buttons.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "arc",
      name: "bcp-arc",
      type: "Brightness arc",
      description: "The brightness gradient arc and knob, shown only while the picker is open.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "knob",
      name: "bcp-knob",
      type: "Knob",
      description: "The draggable circle on the arc (halo + core), inside the arc SVG.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
   {
      key: "input",
      name: "bcp-input",
      type: "Hex text field",
      description: "The editable hex text field beside the closed swatch, when hexInput is on.",
      meta: [{ label: "Kind", value: "Data Slot" }],
   },
];

// e.g. [data-slot="bcp-petal"] { ... } — plain CSS, no classNames prop needed.
const STYLING: AccordionRow[] = [...CSS_VARIABLES, ...DATA_SLOTS];

type Tab = "props" | "styling";

const TAB_SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

export function ApiReference() {
   const [tab, setTab] = useState<Tab>("props");

   return (
      <div className="box props-panel">
         <div className="props-panel__header">
            <span className="props-panel__label">API Reference</span>
            <div className="tabs props-panel__tabs">
               {(["props", "styling"] as const).map((t) => (
                  <button
                     key={t}
                     type="button"
                     className={`tab${tab === t ? " tab--active" : ""}`}
                     onClick={() => setTab(t)}
                  >
                     {t === "props" ? "Props" : "Styling"}
                     {tab === t && (
                        <motion.span
                           className="tab__underline"
                           layoutId="api-reference-tab-underline"
                           transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        />
                     )}
                  </button>
               ))}
            </div>
         </div>

         <div className="props-panel__list">
            <div className="props-panel__head-row">
               <span>{tab === "props" ? "Prop" : "Name"}</span>
               <span>{tab === "props" ? "Type" : "Element"}</span>
            </div>
            <div className="props-panel__viewport">
               <motion.div
                  className="props-panel__track"
                  animate={{ x: tab === "props" ? "0%" : "-50%" }}
                  transition={TAB_SPRING}
               >
                  <div className="props-panel__pane">
                     <AccordionRows rows={PROPS} />
                  </div>
                  <div className="props-panel__pane">
                     <AccordionRows rows={STYLING} namePill />
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   );
}
