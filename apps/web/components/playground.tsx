"use client";

import { useState } from "react";
import { bloomPalettes, BloomColorPicker, type BloomColorPickerPalette } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import { ElasticSlider } from "./elastic-slider";
import { Stepper } from "./stepper";

const PALETTES = Object.keys(bloomPalettes) as BloomColorPickerPalette[];

export function Playground() {
   const [size, setSize] = useState(32);
   const [color, setColor] = useState("#FFB1EE");
   const [palette, setPalette] = useState<BloomColorPickerPalette>("warm");

   return (
      <section className="box playground">
         <div className="playground__preview">
            <BloomColorPicker size={size} palette={palette} value={color} onChange={setColor} />
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
                  <Stepper
                     label="Palette"
                     value={palette}
                     options={PALETTES}
                     onValueChange={(v) => setPalette(v as BloomColorPickerPalette)}
                  />
               </div>
            </div>
         </div>
      </section>
   );
}
