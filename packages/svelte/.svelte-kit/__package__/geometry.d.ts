export declare const BASE_SWATCH = 50;
export declare const PETAL_SIZE = 54;
export declare const OUTER_RADIUS = 78;
export declare const INNER_RADIUS = 42;
export declare const ARC_CANVAS = 360;
export declare const ARC_C: number;
export declare const ARC_RADIUS = 170;
export declare const ARC_HALF_SPAN = 26;
export declare const ARC_STROKE = 20;
export interface Petal {
    key: string;
    x: number;
    y: number;
    color: string;
    order: number;
}
export declare function buildPetals(outer: string[], inner: string[]): Petal[];
export declare const ARC_PATH: string;
/**
 * Half-height of the brightness gradient, so it spans exactly the arc's vertical
 * extent: the stops run from `ARC_C - ARC_GRADIENT_DY` to `ARC_C + ARC_GRADIENT_DY`.
 */
export declare const ARC_GRADIENT_DY: number;
export declare function cx(...parts: Array<string | false | null | undefined>): string;
/** Nearest petal to a point measured from the dish centre, or null if none is within reach. */
export declare function petalAt(petals: Petal[], px: number, py: number, scale: number): string | null;
/** Position along the brightness arc for a 0–1 lightness, in SVG canvas units. */
export declare function knobPoint(lightPos: number): {
    x: number;
    y: number;
};
/** Inverse of {@link knobPoint}: the 0–1 lightness for a point in SVG canvas units. */
export declare function lightPosAt(lx: number, ly: number): number;
