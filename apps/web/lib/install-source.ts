export type InstallSource = "primitives" | "shadcn";

export const INSTALL_SOURCE_KEY = "install-source";
export const DEFAULT_INSTALL_SOURCE: InstallSource = "primitives";

// How the component is imported depends on how it was installed, so every
// snippet on the page — the sidebar's usage block and the playground's live
// one — has to open with the lines matching the selected source. The vendored
// copy imports its own stylesheet internally, so unlike the npm package it
// needs no separate style.css import beside it.
export const IMPORT_LINES: Record<InstallSource, string[]> = {
   primitives: [
      'import { BloomColorPicker } from "bloom-color-picker";',
      'import "bloom-color-picker/style.css";',
   ],
   shadcn: ['import { BloomColorPicker } from "@/components/bloom-color-picker";'],
};
