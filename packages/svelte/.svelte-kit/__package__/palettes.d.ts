export interface BloomColorPickerPaletteColors {
    outer: string[];
    inner: string[];
}
export declare const bloomPalettes: {
    warm: {
        outer: string[];
        inner: string[];
    };
    ocean: {
        outer: string[];
        inner: string[];
    };
    blossom: {
        outer: string[];
        inner: string[];
    };
    pastel: {
        outer: string[];
        inner: string[];
    };
};
export type BloomColorPickerPalette = keyof typeof bloomPalettes;
export declare const defaultOuterColors: string[];
export declare const defaultInnerColors: string[];
