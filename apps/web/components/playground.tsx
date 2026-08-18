"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { bloomPalettes, BloomColorPicker, type BloomColorPickerPalette } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import { usePersistedState } from "../lib/use-persisted-state";
import { CodeCloseIcon } from "./animated-icons/code-close-icon";
import { BLOOM_THEME_OPTIONS, type BloomTheme } from "./bloom-theme-select";
import { ColorSelect } from "./color-select";
import { CopyButton } from "./copy-button";
import { DISABLED_OPTIONS } from "./disabled-select";
import { ElasticSlider } from "./elastic-slider";
import { INPUT_VARIANT_OPTIONS, type InputVariant } from "./input-variant-select";
import { MOTION_OPTIONS, type MotionValue } from "./motion-select";
import { Selector } from "./selector";
import { ToggleSelect } from "./toggle-select";

const PALETTES = Object.keys(bloomPalettes) as BloomColorPickerPalette[];
const SWATCH_COLORS = ["#FFB1EE", "#F7C13F", "#EE8440", "#B5D2F0", "#D4C0EC", "#F5C6CC"];
const CODE_SPRING = { type: "spring" as const, stiffness: 320, damping: 30 };

export function Playground() {
   const [size, setSize] = usePersistedState("size", 28);
   const [color, setColor] = usePersistedState("color", "#FFB1EE");
   const [palette, setPalette] = usePersistedState<BloomColorPickerPalette>("palette", "warm");
   const [disabled, setDisabled] = usePersistedState("disabled", false);
   const [motionValue, setMotionValue] = usePersistedState<MotionValue>("motion", "subtle");
   const [inputVariant, setInputVariant] = usePersistedState<InputVariant>("input-variant", "split");
   // control only for now — the picker doesn't have a theme prop yet
   const [bloomTheme, setBloomTheme] = usePersistedState<BloomTheme>("bloom-theme", "auto");
   const [showCode, setShowCode] = useState(false);
   const previewRef = useRef<HTMLDivElement>(null);
   const [centerOffset, setCenterOffset] = useState(0);

   // The picker's swatch sits at its own true center, but the hex input hangs
   // off to the right (positioned outside the swatch's box so the bloom still
   // opens from the swatch, not the group). To center the whole visible group
   // in this column, measure the actual rendered gap past the swatch and
   // shift left by half of it — recomputed whenever size/layout could change it.
   useLayoutEffect(() => {
      const container = previewRef.current;
      if (!container) return;

      const measure = () => {
         const bcp = container.querySelector<HTMLElement>(".bcp");
         const inputWrap = container.querySelector<HTMLElement>(".bcp__input-wrap");
         if (!bcp) return;
         const bcpRect = bcp.getBoundingClientRect();
         const rightEdge = inputWrap ? inputWrap.getBoundingClientRect().right : bcpRect.right;
         setCenterOffset((rightEdge - bcpRect.right) / 2);
      };

      measure();
      const raf = window.requestAnimationFrame(measure); // re-check after fonts/layout settle
      window.addEventListener("resize", measure);
      return () => {
         window.cancelAnimationFrame(raf);
         window.removeEventListener("resize", measure);
      };
   }, [size, inputVariant]);

   const codeSnippet = [
      'import { BloomColorPicker } from "bloom-color-picker";',
      'import "bloom-color-picker/style.css";',
      "",
      "<BloomColorPicker",
      `   size={${size}}`,
      `   palette="${palette}"`,
      `   value="${color}"`,
      `   disabled={${disabled}}`,
      `   inputVariant="${inputVariant}"`,
      `   motion="${motionValue}"`,
      `   theme="${bloomTheme}"`,
      "/>",
   ].join("\n");

   return (
      <section className="box playground">
         <motion.div
            className="playground__code-panel"
            initial={false}
            animate={{
               top: 20,
               left: 20,
               width: showCode ? "calc(50% - 40px)" : 32,
               height: showCode ? "calc(100% - 40px)" : 32,
               borderRadius: showCode ? 12 : 10,
            }}
            transition={CODE_SPRING}
         >
            <motion.button
               type="button"
               className="playground__code-btn"
               onClick={() => setShowCode((v) => !v)}
               aria-label={showCode ? "Close code" : "View code"}
               initial={false}
               animate={{
                  top: showCode ? 8 : 0,
                  left: showCode ? 8 : 0,
               }}
               transition={CODE_SPRING}
            >
               <CodeCloseIcon open={showCode} />
            </motion.button>

            <AnimatePresence>
               {showCode && (
                  <motion.div
                     key="copy"
                     className="playground__code-copy"
                     initial={{ opacity: 0, filter: "blur(6px)" }}
                     animate={{ opacity: 1, filter: "blur(0px)" }}
                     exit={{ opacity: 0, filter: "blur(6px)" }}
                     transition={{ duration: 0.32 }}
                  >
                     <CopyButton text={codeSnippet} label="Copy code" />
                  </motion.div>
               )}
               {showCode && (
                  <motion.div
                     key="content"
                     className="playground__code-content"
                     initial={{ opacity: 0, filter: "blur(3px)" }}
                     animate={{ opacity: 1, filter: "blur(0px)" }}
                     exit={{ opacity: 0, filter: "blur(3px)" }}
                     transition={{ duration: 0.32 }}
                  >
                     <pre className="playground__code-snippet scroll-mask-x scroll-mask-y">{codeSnippet}</pre>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>

         <motion.div
            className="playground__content"
            initial={false}
            animate={{ x: showCode ? "50%" : "0%" }}
            transition={CODE_SPRING}
         >
            <div className="playground__preview" ref={previewRef}>
               <div style={{ transform: `translateX(${-centerOffset}px)` }}>
                  <BloomColorPicker
                     size={size}
                     palette={palette}
                     value={color}
                     onChange={setColor}
                     disabled={disabled}
                     inputVariant={inputVariant}
                     motion={motionValue}
                     theme={bloomTheme}
                  />
               </div>
            </div>

            <div className="playground__settings">
               <div className="playground__settings-box">
                  <div className="playground__settings-scroll scroll-mask-y">
                     <div className="control">
                        <ElasticSlider
                           label="Size"
                           min={20}
                           max={40}
                           step={1}
                           value={size}
                           onValueChange={setSize}
                           formatValue={(v) => `${Math.round(v)}px`}
                        />
                     </div>

                     <div className="control">
                        <Selector
                           label="Palette"
                           value={palette}
                           options={PALETTES}
                           onValueChange={(v) => setPalette(v as BloomColorPickerPalette)}
                        />
                     </div>

                     <div className="control">
                        <ToggleSelect
                           label="Input layout"
                           value={inputVariant}
                           onValueChange={setInputVariant}
                           options={INPUT_VARIANT_OPTIONS}
                        />
                     </div>

                     <div className="control">
                        <ToggleSelect
                           label="Motion"
                           value={motionValue}
                           onValueChange={setMotionValue}
                           options={MOTION_OPTIONS}
                        />
                     </div>

                     <div className="control">
                        <ColorSelect label="Color" value={color} colors={SWATCH_COLORS} onValueChange={setColor} />
                     </div>

                     <div className="control">
                        <ToggleSelect
                           label="Theme"
                           value={bloomTheme}
                           onValueChange={setBloomTheme}
                           options={BLOOM_THEME_OPTIONS}
                        />
                     </div>

                     <div className="control">
                        <ToggleSelect
                           label="Disabled"
                           value={disabled}
                           onValueChange={setDisabled}
                           options={DISABLED_OPTIONS}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </section>
   );
}
