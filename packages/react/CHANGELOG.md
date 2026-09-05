# bloom-color-picker

## 0.1.2

### Patch Changes

- 91ec934: Fix the bloom's entrance and exit on touch devices.

   Opening the bloom animated `blur()` across 22 layers at once — 19 petals plus the
   bloom, the dish and the 360px arc. Unlike the `transform` and `opacity` beside
   them, a blur can't be composited: every frame re-rasterises the layer and runs a
   Gaussian over it, which phone GPUs drop frames on. The radii are now CSS
   variables, and are zeroed under `(hover: none) and (pointer: coarse)` along with
   the petals' shadow and ring. Keying on pointer type rather than viewport width
   means a narrowed desktop window keeps the full effect, and the defaults are
   unchanged, so desktop renders exactly as before.

   Two motion bugs surfaced once that was legible:

   - `motion="none"` is documented as an instant open/close, but only ever flattened
     durations, easings and delays — never the keyframes. The petals and arc still
     ran their full spiral, with every one of them starting on the same frame inside
     160ms. They now fade on touch devices.
   - The dish is a child of the bloom, so its scale multiplied with the bloom's own
     `0.1786`. Starting from `0.4` put it at an effective `0.07` on the first frame
     while the petals — siblings of the bloom rather than children — animated at
     full size, so the dish appeared to arrive after them. It now starts near full
     and lets the parent's growth carry it. This applies on every device.
