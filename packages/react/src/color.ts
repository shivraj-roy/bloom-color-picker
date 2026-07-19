export function hexToRgb(h: string): [number, number, number] {
   h = h.replace("#", "");
   if (h.length === 3)
      h = h
         .split("")
         .map((c) => c + c)
         .join("");
   const n = parseInt(h, 16);
   return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
   return (
      "#" +
      [r, g, b]
         .map((v) =>
            Math.round(Math.min(255, Math.max(0, v)))
               .toString(16)
               .toUpperCase()
               .padStart(2, "0")
         )
         .join("")
   );
}

export function mixHex(hex: string, target: string, t: number): string {
   const a = hexToRgb(hex);
   const b = hexToRgb(target);
   return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

// pos 0 = lightest (white), 0.5 = pure, 1 = darkest (black)
export function shadeOf(base: string, pos: number): string {
   if (pos <= 0.5) return mixHex(base, "#ffffff", (0.5 - pos) / 0.5);
   return mixHex(base, "#000000", (pos - 0.5) / 0.5);
}

export function hexToHsl(hex: string): [number, number, number] {
   const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
   const max = Math.max(r, g, b);
   const min = Math.min(r, g, b);
   const l = (max + min) / 2;
   let h = 0;
   let s = 0;
   if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
   }
   return [h, s, l];
}

export function hslToHex(h: number, s: number, l: number): string {
   h /= 360;
   let r: number;
   let g: number;
   let b: number;
   if (s === 0) {
      r = g = b = l;
   } else {
      const hue2rgb = (p: number, q: number, t: number) => {
         if (t < 0) t += 1;
         if (t > 1) t -= 1;
         if (t < 1 / 6) return p + (q - p) * 6 * t;
         if (t < 1 / 2) return q;
         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
         return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
   }
   return rgbToHex(r * 255, g * 255, b * 255);
}

/** "#abc" | "abc" | "#AABBCC" -> "#AABBCC"; returns null when not a valid hex color. */
export function normalizeHex(input: string): string | null {
   let v = input.trim().replace(/^#/, "");
   if (/^[0-9a-fA-F]{3}$/.test(v))
      v = v
         .split("")
         .map((c) => c + c)
         .join("");
   if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
   return "#" + v.toUpperCase();
}

/**
 * Decompose a hex into the picker's internal model: the pure hue at 50% lightness
 * plus a position on the light/dark arc. shadeOf(base, lightPos) reproduces the hex.
 */
export function deriveFromHex(hex: string): { base: string; lightPos: number } {
   const [h, s, l] = hexToHsl(hex);
   return {
      base: hslToHex(h, s, 0.5),
      lightPos: Math.min(1, Math.max(0, 1 - l)),
   };
}
