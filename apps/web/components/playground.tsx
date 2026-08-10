"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CodeIcon, XIcon } from "@phosphor-icons/react";
import { bloomPalettes, BloomColorPicker, type BloomColorPickerPalette } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import { ColorSelect } from "./color-select";
import { DisabledSelect } from "./disabled-select";
import { ElasticSlider } from "./elastic-slider";
import { MotionSelect, type MotionValue } from "./motion-select";
import { Selector } from "./selector";

const PALETTES = Object.keys(bloomPalettes) as BloomColorPickerPalette[];
const SWATCH_COLORS = ["#FFB1EE", "#F7C13F", "#EE8440"];
const CODE_SPRING = { type: "spring" as const, stiffness: 320, damping: 30 };

export function Playground() {
   const [size, setSize] = useState(32);
   const [color, setColor] = useState("#FFB1EE");
   const [palette, setPalette] = useState<BloomColorPickerPalette>("warm");
   const [disabled, setDisabled] = useState(false);
   const [motionValue, setMotionValue] = useState<MotionValue>("subtle");
   const [showCode, setShowCode] = useState(false);

   const codeSnippet = [
      'import { BloomColorPicker } from "bloom-color-picker";',
      'import "bloom-color-picker/style.css";',
      "",
      "<BloomColorPicker",
      `   size={${size}}`,
      `   palette="${palette}"`,
      `   value="${color}"`,
      `   disabled={${disabled}}`,
      `   motion="${motionValue}"`,
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
               {showCode ? <XIcon size={16} weight="bold" /> : <CodeIcon size={16} weight="bold" />}
            </motion.button>

            <AnimatePresence>
               {showCode && (
                  <motion.div
                     className="playground__code-content"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.32 }}
                  >
                     <pre className="playground__code-snippet scroll-mask-x scroll-mask-y">{codeSnippet}</pre>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>

         <div className="playground__preview">
            <BloomColorPicker
               size={size}
               palette={palette}
               value={color}
               onChange={setColor}
               disabled={disabled}
               motion={motionValue}
            />
         </div>

         <div className="playground__settings">
            <div className="playground__settings-box">
               <div className="control">
                  <ElasticSlider
                     label="Size"
                     min={20}
                     max={64}
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
                  <MotionSelect label="Motion" value={motionValue} onValueChange={setMotionValue} />
               </div>

               <div className="control">
                  <ColorSelect label="Color" value={color} colors={SWATCH_COLORS} onValueChange={setColor} />
               </div>

               <div className="control">
                  <DisabledSelect label="Disabled" value={disabled} onValueChange={setDisabled} />
               </div>
            </div>
         </div>
      </section>
   );
}
