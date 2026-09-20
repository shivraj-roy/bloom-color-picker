export declare function hexToRgb(h: string): [number, number, number];
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function mixHex(hex: string, target: string, t: number): string;
export declare function shadeOf(base: string, pos: number): string;
export declare function hexToHsl(hex: string): [number, number, number];
export declare function hslToHex(h: number, s: number, l: number): string;
/** "#abc" | "abc" | "#AABBCC" -> "#AABBCC"; returns null when not a valid hex color. */
export declare function normalizeHex(input: string): string | null;
/**
 * Decompose a hex into the picker's internal model: the pure hue at 50% lightness
 * plus a position on the light/dark arc. shadeOf(base, lightPos) reproduces the hex.
 */
export declare function deriveFromHex(hex: string): {
    base: string;
    lightPos: number;
};
