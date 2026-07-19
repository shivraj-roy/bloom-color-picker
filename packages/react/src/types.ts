export type BloomColorPickerPart = "root" | "swatch" | "bloom" | "dish" | "petal" | "arc" | "knob";

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

   /** Outer ring petal colors, clockwise from the top. Hex only. */
   outerColors?: string[];
   /** Inner ring petal colors, clockwise from the top. Hex only. */
   innerColors?: string[];

   /**
    * Diameter of the closed swatch in px; the whole bloom scales proportionally.
    * @default 50
    */
   size?: number;

   /** Disables opening the picker. @default false */
   disabled?: boolean;

   /** Class applied to the root element. */
   className?: string;
   /** Per-part class overrides for restyling. */
   classNames?: Partial<Record<BloomColorPickerPart, string>>;

   /** Accessible label for the closed swatch button. @default "Pick a color" */
   "aria-label"?: string;
}
