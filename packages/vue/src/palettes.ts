export interface BloomColorPickerPaletteColors {
   outer: string[];
   inner: string[];
}

// "warm" — curated warm color wheel, clockwise from the top. The original palette.
const warmOuter = [
   "#F7C13F", // yellow (top)
   "#F2A23C", // amber
   "#EE8440", // orange
   "#E96544", // coral
   "#E84C3F", // red
   "#E03E66", // rose
   "#D23C92", // magenta (bottom)
   "#A24FC8", // purple
   "#7B5FD4", // violet
   "#4E72D6", // blue
   "#3DA1B8", // teal
   "#5FB95B", // green
];
const warmInner = [
   "#F6E6A4", // pale yellow (top)
   "#F4D0B0", // pale peach
   "#F1C1C4", // pale red/pink
   "#E3C4DE", // pale magenta
   "#CCC9EC", // pale violet/blue
   "#C6E0C9", // pale teal/green
];

// "ocean" — cool blues, teals, and greens.
const oceanOuter = [
   "#3D9BE0",
   "#3DB8D6",
   "#3DCBB8",
   "#4ED68B",
   "#5FB95B",
   "#8FCB4E",
   "#C9D63D",
   "#8B9BE0",
   "#7B5FD4",
   "#5F72E0",
   "#4E86E8",
   "#3DAEE0",
];
const oceanInner = ["#BBDFF5", "#B8E8E0", "#C6E8C0", "#DCEDB5", "#C9CCF0", "#B5D2F0"];

// "blossom" — warm pinks and magentas.
const blossomOuter = [
   "#F7C13F",
   "#F5A852",
   "#F28B66",
   "#EE6E7B",
   "#E85A94",
   "#E04FB0",
   "#C94FD1",
   "#A45FE0",
   "#E0559A",
   "#F06880",
   "#F5895E",
   "#F7A94A",
];
const blossomInner = ["#F8E7B5", "#F7D6BB", "#F5C6CC", "#EFC3E3", "#E0C6F0", "#F5CBBE"];

// "pastel" — soft, low-saturation tones throughout both rings.
const pastelOuter = [
   "#F5D9A8",
   "#F3C9B0",
   "#F0BCC0",
   "#E7BCDA",
   "#D4C0EC",
   "#C3C6EE",
   "#BDD6EA",
   "#BDE2DD",
   "#C4E6C4",
   "#DCE9B8",
   "#EEE3AE",
   "#F2D6A6",
];
const pastelInner = ["#FBEFD8", "#FAE4DC", "#F8DDE2", "#EFDCF0", "#E4DFF7", "#DDE8F6"];

export const bloomPalettes = {
   warm: { outer: warmOuter, inner: warmInner },
   ocean: { outer: oceanOuter, inner: oceanInner },
   blossom: { outer: blossomOuter, inner: blossomInner },
   pastel: { outer: pastelOuter, inner: pastelInner },
} satisfies Record<string, BloomColorPickerPaletteColors>;

export type BloomColorPickerPalette = keyof typeof bloomPalettes;

// Preserved for backwards compat with earlier exports.
export const defaultOuterColors = warmOuter;
export const defaultInnerColors = warmInner;
