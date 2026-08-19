"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CaretUpDownIcon } from "../icons/caret-up-down";
import { CheckIcon } from "../icons/check-icon";

export interface ColorSelectProps {
   label: string;
   value: string;
   colors: string[];
   onValueChange: (hex: string) => void;
}

const CHECK_SPRING = { type: "spring" as const, stiffness: 500, damping: 30 };
const TAP_SPRING = { type: "spring" as const, stiffness: 500, damping: 12 };
const ROW_HEIGHT = 30;
const PAGE_SIZE = 3;

// perceived-brightness check so the checkmark stays visible on pale/near-white swatches
function checkColorFor(hex: string): string {
   const n = parseInt(hex.replace("#", ""), 16);
   const r = (n >> 16) & 255;
   const g = (n >> 8) & 255;
   const b = n & 255;
   const yiq = (r * 299 + g * 587 + b * 114) / 1000;
   return yiq > 218 ? "var(--ink)" : "#fff";
}

export function ColorSelect({ label, value, colors, onValueChange }: ColorSelectProps) {
   const [page, setPage] = useState(0);
   const pages = [colors.slice(0, PAGE_SIZE), colors.slice(PAGE_SIZE, PAGE_SIZE * 2)];

   return (
      <div className="color-select">
         <span className="color-select__label">{label}</span>
         <div className="color-select__group">
            <div className="color-select__swatches">
               <motion.div
                  className="color-select__stack"
                  animate={{ y: page === 1 ? -ROW_HEIGHT : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
               >
                  {pages.map((rowColors, rowIndex) => (
                     <div key={rowIndex} className="color-select__row" aria-hidden={page !== rowIndex || undefined}>
                        {rowColors.map((hex) => {
                           const isActive = hex.toLowerCase() === value.toLowerCase();
                           return (
                              <motion.button
                                 key={hex}
                                 type="button"
                                 className="color-select__item"
                                 onClick={() => onValueChange(hex)}
                                 aria-label={hex}
                                 aria-pressed={isActive}
                                 tabIndex={page === rowIndex ? 0 : -1}
                                 whileTap={{ scale: 0.8 }}
                                 transition={TAP_SPRING}
                              >
                                 <span className="color-select__swatch" style={{ background: hex }}>
                                    <AnimatePresence>
                                       {isActive && (
                                          <motion.span
                                             className="color-select__check"
                                             style={{ color: checkColorFor(hex) }}
                                             initial={{ opacity: 0, scale: 0.4 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             exit={{ opacity: 0, scale: 0.4 }}
                                             transition={CHECK_SPRING}
                                          >
                                             <CheckIcon size={11} />
                                          </motion.span>
                                       )}
                                    </AnimatePresence>
                                 </span>
                              </motion.button>
                           );
                        })}
                     </div>
                  ))}
               </motion.div>
            </div>

            <button
               type="button"
               className="color-select__icon-box"
               onClick={() => setPage((p) => (p === 0 ? 1 : 0))}
               aria-label={page === 0 ? "Show more colors" : "Show fewer colors"}
            >
               <CaretUpDownIcon size={14} />
            </button>
         </div>
      </div>
   );
}
