const TAU = Math.PI * 2;

// Base geometry, defined at size = 50 (closed swatch diameter). Everything scales linearly.
export const BASE_SWATCH = 50;
export const PETAL_SIZE = 54;
export const OUTER_RADIUS = 78;
export const INNER_RADIUS = 42;

// Brightness arc (SVG canvas units — the svg element scales as a whole)
export const ARC_CANVAS = 360;
export const ARC_C = ARC_CANVAS / 2;
export const ARC_RADIUS = 170;
export const ARC_HALF_SPAN = 26; // degrees above & below 3 o'clock
export const ARC_STROKE = 20;

export interface Petal {
   key: string;
   x: number;
   y: number;
   color: string;
   order: number;
}

export function buildPetals(outer: string[], inner: string[]): Petal[] {
   const raw: Array<Omit<Petal, "order"> & { radius: number; angleNorm: number }> = [];

   // Outer ring first so inner petals overlap on top.
   outer.forEach((color, i) => {
      const angle = (i / outer.length) * TAU - Math.PI / 2;
      raw.push({
         key: `o${i}`,
         x: Math.cos(angle) * OUTER_RADIUS,
         y: Math.sin(angle) * OUTER_RADIUS,
         color,
         radius: OUTER_RADIUS,
         angleNorm: i / outer.length,
      });
   });

   inner.forEach((color, i) => {
      const angle = (i / inner.length) * TAU - Math.PI / 2;
      raw.push({
         key: `i${i}`,
         x: Math.cos(angle) * INNER_RADIUS,
         y: Math.sin(angle) * INNER_RADIUS,
         color,
         radius: INNER_RADIUS,
         angleNorm: i / inner.length,
      });
   });

   // White center on top
   raw.push({ key: "center", x: 0, y: 0, color: "#FFFFFF", radius: 0, angleNorm: 0 });

   // Spiral reveal order: radius + angle so it winds outward (rings interleave)
   const orderOf = new Map<string, number>();
   raw.map((p) => ({ key: p.key, m: p.radius / OUTER_RADIUS + p.angleNorm }))
      .sort((a, b) => a.m - b.m)
      .forEach((e, idx) => orderOf.set(e.key, idx));

   return raw.map((p) => ({
      key: p.key,
      x: p.x,
      y: p.y,
      color: p.color,
      order: orderOf.get(p.key)!,
   }));
}

function arcPath(): string {
   const a0 = (-ARC_HALF_SPAN * Math.PI) / 180;
   const a1 = (ARC_HALF_SPAN * Math.PI) / 180;
   const x0 = ARC_C + ARC_RADIUS * Math.cos(a0);
   const y0 = ARC_C + ARC_RADIUS * Math.sin(a0);
   const x1 = ARC_C + ARC_RADIUS * Math.cos(a1);
   const y1 = ARC_C + ARC_RADIUS * Math.sin(a1);
   return `M${x0} ${y0} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${x1} ${y1}`;
}

export const ARC_PATH = arcPath();

/**
 * Half-height of the brightness gradient, so it spans exactly the arc's vertical
 * extent: the stops run from `ARC_C - ARC_GRADIENT_DY` to `ARC_C + ARC_GRADIENT_DY`.
 */
export const ARC_GRADIENT_DY = ARC_RADIUS * Math.sin((ARC_HALF_SPAN * Math.PI) / 180);

export function cx(...parts: Array<string | false | null | undefined>): string {
   return parts.filter(Boolean).join(" ");
}

/** Nearest petal to a point measured from the dish centre, or null if none is within reach. */
export function petalAt(petals: Petal[], px: number, py: number, scale: number): string | null {
   let best: string | null = null;
   let bestDist = ((PETAL_SIZE * scale) / 2) ** 2;
   for (const p of petals) {
      const d = (px - p.x * scale) ** 2 + (py - p.y * scale) ** 2;
      if (d <= bestDist) {
         bestDist = d;
         best = p.key;
      }
   }
   return best;
}

/** Position along the brightness arc for a 0–1 lightness, in SVG canvas units. */
export function knobPoint(lightPos: number): { x: number; y: number } {
   const angle = ((-ARC_HALF_SPAN + lightPos * 2 * ARC_HALF_SPAN) * Math.PI) / 180;
   return { x: ARC_C + ARC_RADIUS * Math.cos(angle), y: ARC_C + ARC_RADIUS * Math.sin(angle) };
}

/** Inverse of {@link knobPoint}: the 0–1 lightness for a point in SVG canvas units. */
export function lightPosAt(lx: number, ly: number): number {
   let deg = (Math.atan2(ly - ARC_C, lx - ARC_C) * 180) / Math.PI;
   deg = Math.max(-ARC_HALF_SPAN, Math.min(ARC_HALF_SPAN, deg));
   return (deg + ARC_HALF_SPAN) / (2 * ARC_HALF_SPAN);
}
