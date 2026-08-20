# bloom-color-picker

A flower-inspired color picker. A small swatch blooms open into a dahlia of petal swatches with a brightness arc — pick a petal, drag the arc, done.

- Zero runtime dependencies (only React as a peer).
- Spring-quality animations in pure CSS (`linear()` easings), no animation library.
- Built-in hex input beside the swatch (`hexInput`, on by default), or opt out for your own display.
- Controlled or uncontrolled `value` and `open` state.
- Custom palettes, proportional sizing, per-part class overrides.

## Installation

```bash
npm install bloom-color-picker
```

## Usage

```tsx
import { BloomColorPicker } from "bloom-color-picker";
import "bloom-color-picker/style.css";

export function Example() {
   const [color, setColor] = React.useState("#F5B81E");

   return <BloomColorPicker value={color} onChange={setColor} />;
}
```

## Props

| Prop           | Type                                         | Default          | Description                                                                                                                                                                                 |
| -------------- | -------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`        | `string`                                     | —                | Controlled hex value (`"#RRGGBB"`).                                                                                                                                                         |
| `defaultValue` | `string`                                     | `"#F5B81E"`      | Initial value when uncontrolled.                                                                                                                                                            |
| `onChange`     | `(hex: string) => void`                      | —                | Fired with the new uppercase hex on every pick or brightness drag.                                                                                                                          |
| `open`         | `boolean`                                    | —                | Controlled open state of the bloom.                                                                                                                                                         |
| `defaultOpen`  | `boolean`                                    | `false`          | Initial open state when uncontrolled.                                                                                                                                                       |
| `onOpenChange` | `(open: boolean) => void`                    | —                | Fired on swatch click, outside click, or Escape.                                                                                                                                            |
| `palette`      | `"warm" \| "ocean" \| "blossom" \| "pastel"` | `"warm"`         | Built-in petal color scheme.                                                                                                                                                                |
| `outerColors`  | `string[]`                                   | from `palette`   | Outer petal ring, clockwise from the top. Hex only. Overrides `palette`.                                                                                                                    |
| `innerColors`  | `string[]`                                   | from `palette`   | Inner petal ring, clockwise from the top. Hex only. Overrides `palette`.                                                                                                                    |
| `size`         | `number`                                     | `28`             | Closed swatch diameter in px; the whole bloom scales with it.                                                                                                                               |
| `disabled`     | `boolean`                                    | `false`          | Prevents opening the picker.                                                                                                                                                                |
| `hexInput`     | `boolean`                                    | `true`           | Shows an editable hex text field beside the closed swatch. Invalid characters can't be typed. Set `false` to hide it.                                                                       |
| `inputVariant` | `"split" \| "grouped"`                       | `"split"`        | Layout for the swatch + hex input. Ignored when `hexInput` is false.                                                                                                                        |
| `motion`       | `"none" \| "subtle" \| "bouncy"`             | `"subtle"`       | Spring intensity for open/close and pick animations. `"none"` is instant, applied explicitly regardless of the visitor's OS motion preference (which is otherwise respected automatically). |
| `theme`        | `"auto" \| "light" \| "dark"`                | `"light"`        | Pins the picker's own chrome (input field, dish, shadows — not petal colors) to a theme. `"auto"` follows the visitor's system/OS `prefers-color-scheme` setting instead.                   |
| `className`    | `string`                                     | —                | Class for the root element.                                                                                                                                                                 |
| `classNames`   | `Partial<Record<part, string>>`              | —                | Per-part classes: `root`, `swatch`, `bloom`, `dish`, `petal`, `arc`, `knob`, `input`.                                                                                                       |
| `aria-label`   | `string`                                     | `"Pick a color"` | Accessible label for the closed swatch.                                                                                                                                                     |

## Palettes

```tsx
<BloomColorPicker palette="ocean" />
```

Four built-in palettes: `warm` (default), `ocean`, `blossom`, `pastel`. Import `bloomPalettes` to inspect or remix their raw hex arrays.

## Theming

By default the picker's chrome (input field, dish, shadows) renders light regardless of the visitor's OS setting. Pass `theme="dark"` to pin it dark, or `theme="auto"` to follow `prefers-color-scheme` instead:

```tsx
<BloomColorPicker theme="dark" />
```

The hex input's font defaults to a monospace stack (matches how hex values read elsewhere — GitHub, VSCode, Figma). Override it with the `--bcp-font-input` CSS variable, which works regardless of stylesheet load order:

```css
.my-picker {
   --bcp-font-input: inherit; /* adopt your site's font instead */
}
```

```tsx
<BloomColorPicker className="my-picker" />
```

In `inputVariant="grouped"`, the focus ring around the swatch+input pill also uses a CSS variable, `--bcp-color-focus` (defaults to a neutral blue). Set it to match your brand:

```css
.my-picker {
   --bcp-color-focus: #22c55e;
}
```

## License

MIT
