"use client";

import { useState } from "react";
import { bloomPalettes, BloomColorPicker, type BloomColorPickerPalette } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import { ColorSelect } from "./color-select";
import { DisabledSelect } from "./disabled-select";
import { ElasticSlider } from "./elastic-slider";
import { MotionSelect, type MotionValue } from "./motion-select";
import { Selector } from "./selector";

const PALETTES = Object.keys(bloomPalettes) as BloomColorPickerPalette[];
const SWATCH_COLORS = ["#FFB1EE", "#F7C13F", "#EE8440"];

export function Playground() {
   const [size, setSize] = useState(32);
   const [color, setColor] = useState("#FFB1EE");
   const [palette, setPalette] = useState<BloomColorPickerPalette>("warm");
   const [disabled, setDisabled] = useState(false);
   const [motionValue, setMotionValue] = useState<MotionValue>("subtle");

   return (
      <section className="box playground">
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
