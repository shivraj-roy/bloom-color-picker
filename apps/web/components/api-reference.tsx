"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { AccordionTable, type AccordionRow } from "./accordion-table";

const PROPS: AccordionRow[] = [
   {
      key: "value",
      name: "value?",
      type: "string",
      description: "Controlled hex value.",
      meta: [{ label: "Type", value: "string | undefined" }],
   },
   {
      key: "swatchColor",
      name: "swatchColor?",
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
         { label: "Default", value: "32" },
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
      description: "Per-part classes, see the Styling tab for the full list of slots.",
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

const SLOTS: AccordionRow[] = [
   {
      key: "root",
      name: "root",
      type: "Root container",
      description: "The whole picker's outer container, always present, wraps everything.",
   },
   {
      key: "swatch",
      name: "swatch",
      type: "Swatch button",
      description: "The closed circular swatch button, shown when the picker is collapsed.",
   },
   {
      key: "bloom",
      name: "bloom",
      type: "Bloom circle",
      description: "The large open circle, the morphed swatch, holds the dish.",
   },
   {
      key: "dish",
      name: "dish",
      type: "Dish",
      description: "The inset pastel disc inside the bloom, where the petals sit.",
   },
   {
      key: "petal",
      name: "petal",
      type: "Petal button",
      description: "Every individual petal swatch, applied to all outer and inner ring buttons.",
   },
   {
      key: "arc",
      name: "arc",
      type: "Brightness arc",
      description: "The brightness gradient arc and knob, shown only while the picker is open.",
   },
   {
      key: "knob",
      name: "knob",
      type: "Knob",
      description: "The draggable circle on the arc (halo + core), inside the arc SVG.",
   },
];

type Tab = "props" | "styling";

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

         {tab === "props" ? (
            <AccordionTable columns={["Prop", "Type"]} rows={PROPS} />
         ) : (
            <AccordionTable columns={["Slot", "Element"]} rows={SLOTS} namePill />
         )}
      </div>
   );
}
