<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";

import "./style.css";

import { deriveFromHex, normalizeHex, shadeOf } from "./color";
import {
   ARC_C,
   ARC_CANVAS,
   ARC_GRADIENT_DY,
   ARC_PATH,
   ARC_STROKE,
   BASE_SWATCH,
   buildPetals,
   cx,
   knobPoint,
   lightPosAt,
   petalAt,
   PETAL_SIZE,
} from "./geometry";
import { bloomPalettes } from "./palettes";
import type { BloomColorPickerPart, BloomColorPickerProps } from "./types";
import { useControllableState } from "./use-controllable-state";

const FALLBACK_HEX = "#F5B81E";

const props = withDefaults(defineProps<BloomColorPickerProps>(), {
   defaultValue: FALLBACK_HEX,
   // Vue casts an absent Boolean prop to `false`, which would make `open` read
   // as controlled-at-false and leave the picker permanently shut. Declaring the
   // default as undefined opts out of that cast, so absent stays absent and the
   // uncontrolled path works. `defaultOpen`, `disabled` and `hexInput` want the
   // cast, since they are plain booleans rather than tri-state.
   open: undefined,
   defaultOpen: false,
   palette: "warm",
   size: 28,
   disabled: false,
   hexInput: true,
   inputVariant: "split",
   motion: "subtle",
   theme: "light",
   "aria-label": "Pick a color",
});

// Emits mirror the React callbacks, and `update:` pairs let `v-model` and
// `v-model:open` work without the consumer wiring handlers by hand.
const emit = defineEmits<{
   change: [hex: string];
   openChange: [open: boolean];
   "update:value": [hex: string];
   "update:open": [open: boolean];
}>();

const paletteColors = computed(() => bloomPalettes[props.palette] ?? bloomPalettes.warm);
const resolvedOuterColors = computed(() => props.outerColors ?? paletteColors.value.outer);
const resolvedInnerColors = computed(() => props.innerColors ?? paletteColors.value.inner);

const scale = computed(() => props.size / BASE_SWATCH);
const part = (name: BloomColorPickerPart) => props.classNames?.[name];

// "none" swaps the full spring choreography for one quick uniform fade —
// these match the 160ms duration forced via [data-motion="none"] in style.css.
const FADE_MS = 160;
const instant = computed(() => props.motion === "none");
const PRESS_MS = computed(() => (instant.value ? FADE_MS : 140));
const BLOOM_DELAY_MS = computed(() => (instant.value ? FADE_MS : 1300));
const CLOSE_PETALS_MS = computed(() => (instant.value ? 0 : 110));
const CLOSE_UNMOUNT_MS = computed(() => (instant.value ? FADE_MS : 480));

// Outline rings scale with the picker so proportions match the original at any size
const ring = (color: string) => ({
   outline: `${2 * scale.value}px solid ${color}`,
   outlineOffset: `${-2 * scale.value}px`,
});

const [rawValue, setValue] = useControllableState(
   () => props.value,
   props.defaultValue,
   (next) => {
      props.onChange?.(next);
      emit("change", next);
      emit("update:value", next);
   }
);

const hex = computed(() => normalizeHex(rawValue.value) ?? FALLBACK_HEX);
const derived = computed(() => deriveFromHex(hex.value));

// Draft text for the optional hex input: lets the field hold invalid/partial
// text while typing, but stays in sync when the color changes elsewhere
// (petal pick, arc drag) without fighting an in-progress keystroke.
const hexDraft = ref(hex.value);
watch(hex, (next) => {
   if (normalizeHex(hexDraft.value) !== next) hexDraft.value = next;
});

const [open, setOpen] = useControllableState(
   () => props.open,
   props.defaultOpen,
   (next) => {
      props.onOpenChange?.(next);
      emit("openChange", next);
      emit("update:open", next);
   }
);

// Presentation lifecycle: the bloom stays mounted through the two-phase close
// (circles collapse at 0ms, petals converge at 110ms, unmount at 480ms).
const rendered = ref(open.value);
const closing = ref(false);
const petalsHome = ref(false);
const bloomed = ref(false); // spiral entrance finished
const pressing = ref(false);
const dragging = ref(false);
const hovered = ref<string | null>(null);

const containerRef = ref<HTMLDivElement | null>(null);
const dishRef = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

const gradientId = useId();

const petals = computed(() => buildPetals(resolvedOuterColors.value, resolvedInnerColors.value));

let timers: number[] = [];
const clearTimers = () => {
   timers.forEach(clearTimeout);
   timers = [];
};

watch(
   open,
   (isOpen) => {
      clearTimers();
      if (isOpen) {
         rendered.value = true;
         closing.value = false;
         petalsHome.value = false;
         timers.push(window.setTimeout(() => (bloomed.value = true), BLOOM_DELAY_MS.value));
      } else {
         bloomed.value = false;
         hovered.value = null;
         if (rendered.value) {
            closing.value = true;
            timers.push(window.setTimeout(() => (petalsHome.value = true), CLOSE_PETALS_MS.value));
            timers.push(
               window.setTimeout(() => {
                  rendered.value = false;
                  closing.value = false;
                  petalsHome.value = false;
               }, CLOSE_UNMOUNT_MS.value)
            );
         }
      }
   },
   { immediate: true }
);

// Close on outside click / Escape
const onDocumentDown = (e: PointerEvent) => {
   if (containerRef.value && !containerRef.value.contains(e.target as Node)) setOpen(false);
};
const onDocumentKey = (e: KeyboardEvent) => {
   if (e.key === "Escape") setOpen(false);
};

watch(open, (isOpen) => {
   if (isOpen) {
      document.addEventListener("pointerdown", onDocumentDown);
      document.addEventListener("keydown", onDocumentKey);
   } else {
      document.removeEventListener("pointerdown", onDocumentDown);
      document.removeEventListener("keydown", onDocumentKey);
   }
});

onBeforeUnmount(() => {
   clearTimers();
   document.removeEventListener("pointerdown", onDocumentDown);
   document.removeEventListener("keydown", onDocumentKey);
});

const openPicker = () => {
   if (props.disabled) return;
   pressing.value = true;
   timers.push(
      window.setTimeout(() => {
         pressing.value = false;
         setOpen(true);
      }, PRESS_MS.value)
   );
};

// Single source of truth for hover: pick the nearest petal under the pointer.
// Avoids missed enter/leave events between overlapping petals.
const handleDishMove = (e: PointerEvent) => {
   if (!bloomed.value || !dishRef.value) return;
   const rect = dishRef.value.getBoundingClientRect();
   hovered.value = petalAt(
      petals.value,
      e.clientX - rect.left - rect.width / 2,
      e.clientY - rect.top - rect.height / 2,
      scale.value
   );
};

const ringColor = computed(
   () => `color-mix(in srgb, color-mix(in srgb, ${hex.value}, #000 30%) 14%, transparent)`
);

const knob = computed(() => knobPoint(derived.value.lightPos));

const onKnobDown = (e: PointerEvent) => {
   e.preventDefault();
   dragging.value = true;
   const dragBase = derived.value.base; // hue/saturation are stable for the whole drag
   const updateFromPointer = (clientX: number, clientY: number) => {
      const svg = svgRef.value;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const lx = (clientX - rect.left) * (ARC_CANVAS / rect.width);
      const ly = (clientY - rect.top) * (ARC_CANVAS / rect.height);
      setValue(shadeOf(dragBase, lightPosAt(lx, ly)));
   };
   updateFromPointer(e.clientX, e.clientY);
   const move = (ev: PointerEvent) => updateFromPointer(ev.clientX, ev.clientY);
   const up = () => {
      dragging.value = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
   };
   window.addEventListener("pointermove", move);
   window.addEventListener("pointerup", up);
};

const pickPetal = (color: string) => {
   const normalized = normalizeHex(color);
   if (!normalized) return;
   // Round-trip through the internal model so the reported hex matches
   // what the knob/gradient will display for this petal.
   const { base: petalBase, lightPos: petalPos } = deriveFromHex(normalized);
   setValue(shadeOf(petalBase, petalPos));
};

const onHexInput = (e: Event) => {
   const raw = (e.target as HTMLInputElement).value.toUpperCase();
   const hasHash = raw.startsWith("#");
   const digits = raw.replace(/[^0-9A-F]/g, "").slice(0, 6);
   const next = (hasHash ? "#" : "") + digits;
   hexDraft.value = next;
   const valid = normalizeHex(next);
   if (valid) setValue(valid);
};

const petalStyle = (p: (typeof petals.value)[number]) => ({
   width: `${PETAL_SIZE * scale.value}px`,
   height: `${PETAL_SIZE * scale.value}px`,
   marginLeft: `${(-PETAL_SIZE / 2) * scale.value}px`,
   marginTop: `${(-PETAL_SIZE / 2) * scale.value}px`,
   left: `calc(50% + ${p.x * scale.value}px)`,
   top: `calc(50% + ${p.y * scale.value}px)`,
   background: p.color,
   ...ring(`color-mix(in srgb, color-mix(in srgb, ${p.color}, #000 30%) 18%, transparent)`),
   "--bcp-from-x": `${-p.x * scale.value}px`,
   "--bcp-from-y": `${-p.y * scale.value}px`,
   "--bcp-petal-delay": `${0.06 + p.order * 0.022}s`,
});
</script>

<template>
   <!-- `className` comes from the shared props type; a plain `class` from the
        consumer is merged in automatically by Vue's attribute fallthrough, so
        both idioms work. -->
   <div
      ref="containerRef"
      :class="cx('bcp', dragging && 'bcp--dragging', className, part('root'))"
      :style="{ '--bcp-scale': scale }"
      data-slot="bcp-root"
      :data-state="open ? 'open' : 'closed'"
      :data-disabled="disabled || undefined"
      :data-motion="motion"
      :data-input-variant="hexInput ? inputVariant : undefined"
      :data-theme="theme !== 'auto' ? theme : undefined"
      @pointermove="handleDishMove"
      @pointerleave="hovered = null"
   >
      <div v-if="rendered" class="bcp__slot">
         <svg
            ref="svgRef"
            :class="cx('bcp__arc', closing && 'bcp__arc--closing', part('arc'))"
            data-slot="bcp-arc"
            :width="ARC_CANVAS * scale"
            :height="ARC_CANVAS * scale"
            :viewBox="`0 0 ${ARC_CANVAS} ${ARC_CANVAS}`"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <defs>
               <linearGradient
                  :id="gradientId"
                  gradientUnits="userSpaceOnUse"
                  :x1="ARC_C"
                  :y1="ARC_C - ARC_GRADIENT_DY"
                  :x2="ARC_C"
                  :y2="ARC_C + ARC_GRADIENT_DY"
               >
                  <stop offset="0" stop-color="#ffffff" />
                  <stop offset="0.35" :stop-color="derived.base" />
                  <stop offset="0.65" :stop-color="derived.base" />
                  <stop offset="1" stop-color="#000000" />
               </linearGradient>
            </defs>
            <path
               :d="ARC_PATH"
               :stroke="ringColor"
               :stroke-width="ARC_STROKE + 4"
               stroke-linecap="round"
            />
            <path
               :d="ARC_PATH"
               :stroke="`url(#${gradientId})`"
               :stroke-width="ARC_STROKE"
               stroke-linecap="round"
            />

            <!-- Knob: selected shade with a white ring -->
            <g
               :class="cx('bcp__knob', part('knob'))"
               data-slot="bcp-knob"
               :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
               @pointerdown="onKnobDown"
            >
               <circle class="bcp__knob-halo" :cx="knob.x" :cy="knob.y" fill="#fff" />
               <circle class="bcp__knob-core" :cx="knob.x" :cy="knob.y" :fill="hex" />
            </g>
         </svg>

         <div
            :class="cx('bcp__bloom', closing && 'bcp__bloom--closing', part('bloom'))"
            data-slot="bcp-bloom"
            :style="{ background: hex, ...ring(ringColor) }"
         >
            <div
               ref="dishRef"
               :class="cx('bcp__dish', part('dish'))"
               data-slot="bcp-dish"
               :style="ring(ringColor)"
            />
         </div>

         <!-- Petals — siblings of the bloom so they outlive the circle close -->
         <button
            v-for="p in petals"
            :key="p.key"
            type="button"
            :class="
               cx(
                  'bcp__petal',
                  hovered === p.key && !petalsHome && 'bcp__petal--hovered',
                  petalsHome && 'bcp__petal--home',
                  part('petal')
               )
            "
            data-slot="bcp-petal"
            :style="petalStyle(p)"
            :aria-label="p.color"
            @click="pickPetal(p.color)"
         />
      </div>

      <button
         v-else
         type="button"
         :class="cx('bcp__swatch', pressing && 'bcp__swatch--pressing', part('swatch'))"
         data-slot="bcp-swatch"
         :style="{ backgroundColor: hex }"
         :disabled="disabled"
         :aria-label="props['aria-label']"
         aria-haspopup="dialog"
         :aria-expanded="open"
         @click="openPicker"
      />

      <div v-if="hexInput" class="bcp__input-wrap">
         <input
            type="text"
            :size="7"
            :class="cx('bcp__input', part('input'))"
            data-slot="bcp-input"
            :value="hexDraft"
            :disabled="disabled"
            :spellcheck="false"
            placeholder="#RRGGBB"
            aria-label="Hex color value"
            @input="onHexInput"
         />
      </div>
   </div>
</template>
