"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ChevronDownIcon } from "./icons/chevron-down-icon";

export interface AccordionRow {
   key: string;
   name: string;
   type: string;
   typeMuted?: boolean;
   description: string;
   meta?: { label: string; value: string }[];
}

const EXPAND_SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };
const DETAIL_SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };
const REGROUP_SPRING = { type: "spring" as const, stiffness: 380, damping: 24 };

export function AccordionRows({
   rows,
   namePill,
}: {
   rows: AccordionRow[];
   namePill?: boolean;
}) {
   const [openKey, setOpenKey] = useState<string | null>(null);

   return (
      <div className="props-panel__scroll scroll-mask-y">
         {rows.map((row, index) => {
            const isOpen = openKey === row.key;
            const prevIsOpen = index > 0 && openKey === rows[index - 1].key;
            const nextIsOpen = index < rows.length - 1 && openKey === rows[index + 1].key;
            const isGroupStart = index === 0 || prevIsOpen || isOpen;
            const isGroupEnd = index === rows.length - 1 || nextIsOpen || isOpen;

            return (
               <motion.div
                  key={row.key}
                  layout="position"
                  className="props-panel__row"
                  data-open={isOpen || undefined}
                  data-group-start={isGroupStart || undefined}
                  data-group-end={isGroupEnd || undefined}
                  transition={REGROUP_SPRING}
               >
                  <button
                     type="button"
                     className="props-panel__head"
                     onClick={() => setOpenKey(isOpen ? null : row.key)}
                     aria-expanded={isOpen}
                  >
                     <span className="props-panel__name" data-pill={namePill || undefined}>
                        {row.name}
                     </span>
                     <span className="props-panel__type" data-fn={row.typeMuted || undefined}>
                        {row.type}
                     </span>
                     <motion.span
                        className="props-panel__caret"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={EXPAND_SPRING}
                     >
                        <ChevronDownIcon size={18} />
                     </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                     {isOpen && (
                        <motion.div
                           className="props-panel__detail"
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={DETAIL_SPRING}
                        >
                           <div className="props-panel__detail-inner">
                              <p className="props-panel__desc">{row.description}</p>
                              {row.meta?.map((m) => (
                                 <div key={m.label} className="props-panel__meta">
                                    <span className="props-panel__meta-label">{m.label}</span>
                                    <span className="props-panel__meta-value">{m.value}</span>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            );
         })}
      </div>
   );
}
