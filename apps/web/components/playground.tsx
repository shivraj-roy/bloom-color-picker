"use client";

import { useState } from "react";
import { BloomColorPicker } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import { ElasticSlider } from "./elastic-slider";

export function Playground() {
   const [size, setSize] = useState(32);
   const [color, setColor] = useState("#FFB1EE");

   return (
      <section className="box playground">
         <div className="playground__preview">
            <BloomColorPicker size={size} value={color} onChange={setColor} />
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
            </div>
         </div>
      </section>
   );
}
