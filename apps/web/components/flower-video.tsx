"use client";

import { useEffect, useRef } from "react";

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
const DITHER_SIZE = 400;
// luminance above this renders solid white, skipping the dither entirely —
// keeps the background clean while darker areas still dither normally
const HIGHLIGHT_CLIP = 0.72;

export function FlowerVideo() {
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

      let width = DITHER_SIZE;
      let height = DITHER_SIZE;
      let raf = 0;

      const setup = () => {
         const aspect = video.videoWidth / video.videoHeight || 1;
         if (aspect >= 1) {
            width = DITHER_SIZE;
            height = Math.round(DITHER_SIZE / aspect);
         } else {
            height = DITHER_SIZE;
            width = Math.round(DITHER_SIZE * aspect);
         }
         sample.width = width;
         sample.height = height;
         canvas.width = width;
         canvas.height = height;
      };

      const draw = () => {
         if (video.readyState >= 2) {
            sampleCtx.drawImage(video, 0, 0, width, height);
            const frame = sampleCtx.getImageData(0, 0, width, height);
            const data = frame.data;
            const out = drawCtx.createImageData(width, height);
            const outData = out.data;

            for (let y = 0; y < height; y++) {
               for (let x = 0; x < width; x++) {
                  const i = (y * width + x) * 4;
                  const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
                  let value: number;
                  if (luminance > HIGHLIGHT_CLIP) {
                     value = 255;
                  } else {
                     const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16;
                     value = luminance > threshold ? 20 : 255;
                  }
                  outData[i] = value;
                  outData[i + 1] = value;
                  outData[i + 2] = value;
                  outData[i + 3] = 255;
               }
            }
            drawCtx.putImageData(out, 0, 0);
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
   }, []);

   return (
      <div className="box flower-video">
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
            <canvas ref={canvasRef} className="flower-video__canvas" />
         </div>
      </div>
   );
}
