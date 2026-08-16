import type { BloomColorPickerPalette } from "./palettes";

export type BloomColorPickerPart =
   | "root"
   | "swatch"
   | "bloom"
   | "dish"
   | "petal"
   | "arc"
   | "knob"
   | "input";

export type BloomColorPickerMotion = "none" | "subtle" | "bouncy";

export type BloomColorPickerInputVariant = "split" | "grouped";

export interface BloomColorPickerProps {
   /** Controlled hex value, e.g. "#F5B81E". */
   value?: string;
   /** Initial hex value when uncontrolled. @default "#F5B81E" */
   defaultValue?: string;
   /** Fired with the new hex (uppercase "#RRGGBB") on every petal pick or brightness drag. */
   onChange?: (hex: string) => void;

   /** Controlled open state of the bloom. */
   open?: boolean;
   /** Initial open state when uncontrolled. @default false */
   defaultOpen?: boolean;
   /** Fired when the picker requests to open/close (swatch click, outside click, Escape). */
   onOpenChange?: (open: boolean) => void;

   /**
    * A built-in petal color scheme: "warm" (default), "ocean", "blossom", "pastel".
    * Ignored for a ring where `outerColors`/`innerColors` is explicitly passed.
    */
   palette?: BloomColorPickerPalette;
   /** Outer ring petal colors, clockwise from the top. Hex only. Overrides `palette`. */
   outerColors?: string[];
   /** Inner ring petal colors, clockwise from the top. Hex only. Overrides `palette`. */
   innerColors?: string[];

   /**
    * Diameter of the closed swatch in px; the whole bloom scales proportionally.
    * @default 28
    */
   size?: number;

   /** Disables opening the picker. @default false */
   disabled?: boolean;

   /**
    * Shows an editable hex text field next to the closed swatch. Typed
    * values are validated live; invalid characters can't be typed at all.
    * Set to `false` to hide it. @default true
    */
   hexInput?: boolean;

   /**
    * Layout for the swatch + hex input: "split" keeps them as separate
    * elements (default), "grouped" wraps both in one shared box.
    * Ignored when `hexInput` is false.
    * @default "split"
    */
   inputVariant?: BloomColorPickerInputVariant;

   /**
    * Spring intensity for the open/close and pick animations.
    * "none" disables animation entirely (instant open/close, respected
    * regardless of the visitor's OS motion setting).
    * @default "subtle"
    */
   motion?: BloomColorPickerMotion;

   /** Class applied to the root element. */
   className?: string;
   /** Per-part class overrides for restyling. */
   classNames?: Partial<Record<BloomColorPickerPart, string>>;

   /** Accessible label for the closed swatch button. @default "Pick a color" */
   "aria-label"?: string;
}
