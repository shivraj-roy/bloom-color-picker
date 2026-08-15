"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// classic 4x4 ordered (Bayer) dither matrix — cheap per-pixel threshold, no
// error diffusion needed, so it stays fast enough for real-time video.
const BAYER_4X4 = [
   [0, 8, 2, 10],
   [12, 4, 14, 6],
   [3, 11, 1, 9],
   [15, 7, 13, 5],
];

// low-res sampling grid — the canvas is CSS-scaled up with pixelated
// rendering, so this is what actually controls the dither "block" size.
const DITHER_SIZE = 440;
// contrast curve around mid-gray, applied before thresholding (dither) or
// before sizing dots (halftone): >1 pulls more values toward the noisy
// mid-tone zone, <1 pushes them toward the extremes (cleaner, less texture).
const GAMMA = 0.8;

// halftone: grid for sampling average brightness per dot — denser grid,
// tighter spacing, more dots visible overall...
const HALFTONE_GRID_COLS = 70;
// ...rendered onto a separate, smooth (non-pixelated) canvas so the dots
// stay round instead of blocky. Scaled up along with the grid so each dot
// still gets enough pixels to render crisply instead of a soft AA blob.
const HALFTONE_OUTPUT_SIZE = 1200;
const HALFTONE_MAX_RADIUS = 0.2; // fraction of one cell's size

type Style = "dither" | "halftone";

export function FlowerVideo() {
   const [style, setStyle] = useState<Style>("dither");
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const sample = document.createElement("canvas");
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      const drawCtx = canvas.getContext("2d");
      if (!sampleCtx || !drawCtx) return;

      let sampleWidth = DITHER_SIZE;
      let sampleHeight = DITHER_SIZE;
      let outWidth = DITHER_SIZE;
      let outHeight = DITHER_SIZE;
      let raf = 0;

      const setup = () => {
         const aspect = video.videoWidth / video.videoHeight || 1;

         if (style === "dither") {
            if (aspect >= 1) {
               outWidth = DITHER_SIZE;
               outHeight = Math.round(DITHER_SIZE / aspect);
            } else {
               outHeight = DITHER_SIZE;
               outWidth = Math.round(DITHER_SIZE * aspect);
            }
            sampleWidth = outWidth;
            sampleHeight = outHeight;
         } else {
            if (aspect >= 1) {
               outWidth = HALFTONE_OUTPUT_SIZE;
               outHeight = Math.round(HALFTONE_OUTPUT_SIZE / aspect);
               sampleWidth = HALFTONE_GRID_COLS;
               sampleHeight = Math.round(HALFTONE_GRID_COLS / aspect);
            } else {
               outHeight = HALFTONE_OUTPUT_SIZE;
               outWidth = Math.round(HALFTONE_OUTPUT_SIZE * aspect);
               sampleHeight = HALFTONE_GRID_COLS;
               sampleWidth = Math.round(HALFTONE_GRID_COLS * aspect);
            }
         }

         sample.width = sampleWidth;
         sample.height = sampleHeight;
         canvas.width = outWidth;
         canvas.height = outHeight;
      };

      const drawDither = () => {
         sampleCtx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
         const frame = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
         const data = frame.data;
         const out = drawCtx.createImageData(sampleWidth, sampleHeight);
         const outData = out.data;

         for (let y = 0; y < sampleHeight; y++) {
            for (let x = 0; x < sampleWidth; x++) {
               const i = (y * sampleWidth + x) * 4;
               const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
               const adjusted = Math.min(1, Math.max(0, 0.5 + (luminance - 0.5) / GAMMA));
               const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16;
               const value = adjusted > threshold ? 20 : 255;
               outData[i] = value;
               outData[i + 1] = value;
               outData[i + 2] = value;
               outData[i + 3] = 255;
            }
         }
         drawCtx.putImageData(out, 0, 0);
      };

      const drawHalftone = () => {
         sampleCtx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
         const frame = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
         const data = frame.data;

         drawCtx.fillStyle = "#fff";
         drawCtx.fillRect(0, 0, outWidth, outHeight);
         drawCtx.fillStyle = "#141414";

         const cellW = outWidth / sampleWidth;
         const cellH = outHeight / sampleHeight;
         const cellSize = Math.min(cellW, cellH);

         for (let y = 0; y < sampleHeight; y++) {
            for (let x = 0; x < sampleWidth; x++) {
               const i = (y * sampleWidth + x) * 4;
               const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
               const adjusted = Math.min(1, Math.max(0, 0.5 + (luminance - 0.5) / GAMMA));
               const radius = adjusted * cellSize * HALFTONE_MAX_RADIUS;
               if (radius < 0.15) continue;
               const cx = (x + 0.5) * cellW;
               const cy = (y + 0.5) * cellH;
               drawCtx.beginPath();
               drawCtx.arc(cx, cy, radius, 0, Math.PI * 2);
               drawCtx.fill();
            }
         }
      };

      const draw = () => {
         if (video.readyState >= 2) {
            if (style === "dither") drawDither();
            else drawHalftone();
         }
         raf = requestAnimationFrame(draw);
      };

      video.addEventListener("loadedmetadata", setup);
      if (video.readyState >= 1) setup();
      raf = requestAnimationFrame(draw);

      return () => {
         cancelAnimationFrame(raf);
         video.removeEventListener("loadedmetadata", setup);
      };
   }, [style]);

   return (
      <div className="box flower-video">
         <div className="flower-video__header">
            <span className="sidebar__label">Flower</span>
            <div className="tabs flower-video__tabs">
               {(["dither", "halftone"] as const).map((s) => (
                  <button
                     key={s}
                     type="button"
                     className={`tab${style === s ? " tab--active" : ""}`}
                     onClick={() => setStyle(s)}
                  >
                     {s === "dither" ? "Dither" : "Halftone"}
                     {style === s && (
                        <motion.span
                           className="tab__underline"
                           layoutId="flower-video-tab-underline"
                           transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        />
                     )}
                  </button>
               ))}
            </div>
         </div>

         <div className="flower-video__inner">
            <video
               ref={videoRef}
               className="flower-video__source"
               src="/flower-and-butterfly.mp4"
               autoPlay
               loop
               muted
               playsInline
            />
            <canvas
               ref={canvasRef}
               className="flower-video__canvas"
               data-style={style}
            />
         </div>
      </div>
   );
}
