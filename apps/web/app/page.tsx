"use client";

import { useState } from "react";
import { BloomColorPicker } from "bloom-color-picker";
import "bloom-color-picker/style.css";

import OriginalBloomPicker from "../original/BloomPicker";

export default function Home() {
   const [color, setColor] = useState("#F5B81E");

   return (
      <main className="compare">
         <section className="compare__panel">
            <span className="compare__label">Original · motion</span>
            <div className="compare__stage">
               <OriginalBloomPicker />
            </div>
         </section>

         <section className="compare__panel">
            <span className="compare__label">Package · zero-dep</span>
            <div className="compare__stage">
               <BloomColorPicker value={color} onChange={setColor} />
            </div>
            <code className="compare__value">{color}</code>
            <div className="sizes">
               <span className="compare__label">size: 28 / 32 / 40</span>
               <div className="sizes__row">
                  <BloomColorPicker defaultValue="#E96544" size={28} />
                  <BloomColorPicker defaultValue="#5FB95B" size={32} />
                  <BloomColorPicker defaultValue="#4E72D6" size={40} />
               </div>
            </div>
         </section>
      </main>
   );
}
