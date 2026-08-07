"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { normalizeHex } from "bloom-color-picker";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";

export interface ColorSelectProps {
   label: string;
   value: string;
   colors: string[];
   onValueChange: (hex: string) => void;
}

const CHECK_SPRING = { type: "spring" as const, stiffness: 500, damping: 30 };
const TAP_SPRING = { type: "spring" as const, stiffness: 500, damping: 12 };
const ROW_HEIGHT = 30;

export function ColorSelect({ label, value, colors, onValueChange }: ColorSelectProps) {
   const [custom, setCustom] = useState(false);
   const [hexDraft, setHexDraft] = useState("");
   const inputRef = useRef<HTMLInputElement>(null);

   const normalized = normalizeHex(hexDraft);
   const isCustomActive = normalized !== null && normalized.toLowerCase() === value.toLowerCase();

   useEffect(() => {
      if (!custom) return;
      // wait for the slide to finish so focus doesn't yank the viewport mid-animation
      const t = window.setTimeout(() => inputRef.current?.focus(), 360);
      return () => clearTimeout(t);
   }, [custom]);

   return (
      <div className="color-select">
         <span className="color-select__label">{label}</span>
         <div className="color-select__group">
            <div className="color-select__swatches" data-mode={custom ? "custom" : "presets"}>
               <motion.div
                  className="color-select__stack"
                  animate={{ y: custom ? -ROW_HEIGHT : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
               >
                  {/* panel 1: presets */}
                  <div className="color-select__row" aria-hidden={custom || undefined}>
                     {colors.map((hex) => {
                        const isActive = hex.toLowerCase() === value.toLowerCase();
                        return (
                           <motion.button
                              key={hex}
                              type="button"
                              className="color-select__item"
                              onClick={() => onValueChange(hex)}
                              aria-label={hex}
                              aria-pressed={isActive}
                              tabIndex={custom ? -1 : 0}
                              whileTap={{ scale: 0.8 }}
                              transition={TAP_SPRING}
                           >
                              <span className="color-select__swatch" style={{ background: hex }}>
                                 <AnimatePresence>
                                    {isActive && (
                                       <motion.span
                                          className="color-select__check"
                                          initial={{ opacity: 0, scale: 0.4 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.4 }}
                                          transition={CHECK_SPRING}
                                       >
                                          <CheckIcon size={11} weight="bold" />
                                       </motion.span>
                                    )}
                                 </AnimatePresence>
                              </span>
                           </motion.button>
                        );
                     })}
                  </div>

                  {/* panel 2: custom hex editor */}
                  <div
                     className="color-select__row color-select__custom"
                     aria-hidden={!custom || undefined}
                  >
                     <motion.button
                        type="button"
                        className="color-select__item"
                        onClick={() => normalized && onValueChange(normalized)}
                        disabled={!normalized}
                        aria-label={normalized ? `Select ${normalized}` : "Enter a valid hex first"}
                        aria-pressed={isCustomActive}
                        tabIndex={custom ? 0 : -1}
                        whileTap={normalized ? { scale: 0.8 } : undefined}
                        transition={TAP_SPRING}
                     >
                        <span
                           className="color-select__custom-swatch"
                           data-filled={normalized ? true : undefined}
                           style={{ background: normalized ?? "transparent" }}
                        >
                           <AnimatePresence>
                              {isCustomActive && (
                                 <motion.span
                                    className="color-select__check"
                                    initial={{ opacity: 0, scale: 0.4 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.4 }}
                                    transition={CHECK_SPRING}
                                 >
                                    <CheckIcon size={10} weight="bold" />
                                 </motion.span>
                              )}
                           </AnimatePresence>
                        </span>
                     </motion.button>
                     <input
                        ref={inputRef}
                        className="color-select__custom-input"
                        value={hexDraft}
                        onChange={(e) => {
                           let next = e.target.value.toUpperCase();
                           const cap = next.startsWith("#") ? 7 : 6;
                           next = next.slice(0, cap);
                           setHexDraft(next);
                           const hex = normalizeHex(next);
                           if (hex) onValueChange(hex);
                        }}
                        onFocus={(e) => {
                           const input = e.target;
                           window.setTimeout(() => input.select(), 0);
                        }}
                        placeholder="#RRGGBB"
                        spellCheck={false}
                        tabIndex={custom ? 0 : -1}
                        aria-label="Custom hex color"
                     />
                  </div>
               </motion.div>
            </div>

            <button
               type="button"
               className="color-select__icon-box"
               onClick={() => setCustom((c) => !c)}
               aria-label={custom ? "Show presets" : "Enter custom color"}
            >
               <CaretUpDownIcon size={14} weight="bold" />
            </button>
         </div>
      </div>
   );
}
