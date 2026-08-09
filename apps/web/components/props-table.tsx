"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDownIcon } from "@phosphor-icons/react";

interface PropRow {
   name: string;
   optional: boolean;
   type: string;
   fullType: string;
   default?: string;
   description: string;
}

const PROPS: PropRow[] = [
   {
      name: "value",
      optional: true,
      type: "string",
      fullType: "string | undefined",
      description: "Controlled hex value.",
   },
   {
      name: "swatchColor",
      optional: true,
      type: "string",
      fullType: "string | undefined",
      default: '"#F5B81E"',
      description: "Initial hex value when uncontrolled.",
   },
   {
      name: "onChange",
      optional: true,
      type: "function",
      fullType: "(hex: string) => void",
      description: "Fired with the new hex on every pick or brightness drag.",
   },
   {
      name: "open",
      optional: true,
      type: "boolean",
      fullType: "boolean | undefined",
      description: "Controlled open state of the bloom.",
   },
   {
      name: "defaultOpen",
      optional: true,
      type: "boolean",
      fullType: "boolean | undefined",
      default: "false",
      description: "Initial open state when uncontrolled.",
   },
   {
      name: "onOpenChange",
      optional: true,
      type: "function",
      fullType: "(open: boolean) => void",
      description: "Fired on swatch click, outside click, or Escape.",
   },
   {
      name: "palette",
      optional: true,
      type: "string",
      fullType: '"warm" | "ocean" | "blossom" | "pastel"',
      default: '"warm"',
      description: "Built-in petal color scheme. Ignored where outerColors/innerColors is set.",
   },
   {
      name: "outerColors",
      optional: true,
      type: "string[]",
      fullType: "string[] | undefined",
      default: "from palette",
      description: "Outer petal ring, clockwise from the top. Overrides palette.",
   },
   {
      name: "innerColors",
      optional: true,
      type: "string[]",
      fullType: "string[] | undefined",
      default: "from palette",
      description: "Inner petal ring, clockwise from the top. Overrides palette.",
   },
   {
      name: "size",
      optional: true,
      type: "number",
      fullType: "number | undefined",
      default: "32",
      description: "Closed swatch diameter in px; the whole bloom scales with it.",
   },
   {
      name: "disabled",
      optional: true,
      type: "boolean",
      fullType: "boolean | undefined",
      default: "false",
      description: "Prevents opening the picker.",
   },
   {
      name: "motion",
      optional: true,
      type: "string",
      fullType: '"none" | "subtle" | "bouncy"',
      default: '"subtle"',
      description: "Spring intensity for open/close and pick animations.",
   },
   {
      name: "className",
      optional: true,
      type: "string",
      fullType: "string | undefined",
      description: "Class applied to the root element.",
   },
   {
      name: "classNames",
      optional: true,
      type: "object",
      fullType: "Partial<Record<part, string>>",
      description: "Per-part classes: root, swatch, bloom, dish, petal, arc, knob.",
   },
   {
      name: "aria-label",
      optional: true,
      type: "string",
      fullType: "string | undefined",
      default: '"Pick a color"',
      description: "Accessible label for the closed swatch.",
   },
];

const EXPAND_SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };

export function PropsTable() {
   const [openProp, setOpenProp] = useState<string | null>(null);

   return (
      <div className="box props-panel">
         <span className="props-panel__label">Props</span>
         <div className="props-panel__scroll scroll-mask-y">
            <div className="props-panel__head-row">
               <span>Prop</span>
               <span>Type</span>
            </div>

            {PROPS.map((prop) => {
               const isOpen = openProp === prop.name;
               return (
                  <div key={prop.name} className="props-panel__row" data-open={isOpen || undefined}>
                     <button
                        type="button"
                        className="props-panel__head"
                        onClick={() => setOpenProp(isOpen ? null : prop.name)}
                        aria-expanded={isOpen}
                     >
                        <span className="props-panel__name">
                           {prop.name}
                           {prop.optional && "?"}
                        </span>
                        <span className="props-panel__type" data-fn={prop.type === "function" || undefined}>
                           {prop.type}
                        </span>
                        <motion.span
                           className="props-panel__caret"
                           animate={{ rotate: isOpen ? 180 : 0 }}
                           transition={EXPAND_SPRING}
                        >
                           <CaretDownIcon size={13} weight="bold" />
                        </motion.span>
                     </button>

                     <AnimatePresence initial={false}>
                        {isOpen && (
                           <motion.div
                              className="props-panel__detail"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={EXPAND_SPRING}
                           >
                              <div className="props-panel__detail-inner">
                                 <p className="props-panel__desc">{prop.description}</p>
                                 <div className="props-panel__meta">
                                    <span className="props-panel__meta-label">Type</span>
                                    <span className="props-panel__meta-value">{prop.fullType}</span>
                                 </div>
                                 {prop.default && (
                                    <div className="props-panel__meta">
                                       <span className="props-panel__meta-label">Default</span>
                                       <span className="props-panel__meta-value">{prop.default}</span>
                                    </div>
                                 )}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
