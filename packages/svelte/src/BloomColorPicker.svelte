<script lang="ts">
   import { untrack } from "svelte";

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
   import { createControllableState } from "./use-controllable-state.svelte";

   const FALLBACK_HEX = "#F5B81E";

   // `value` and `open` are $bindable, which is how a Svelte consumer takes
   // control: `bind:value` writes changes back. Passing either unbound seeds the
   // picker and then lets it manage itself — a plain prop in Svelte is one-way,
   // and there is no way to distinguish bound from unbound to enforce React's
   // stricter "the prop always wins". onChange/onOpenChange report either way.
   // This is the one place the three packages differ; the README says so.
   let {
      value = $bindable(),
      defaultValue = FALLBACK_HEX,
      onChange,
      open = $bindable(),
      defaultOpen = false,
      onOpenChange,
      palette = "warm",
      outerColors,
      innerColors,
      size = 28,
      disabled = false,
      hexInput = true,
      inputVariant = "split",
      motion = "subtle",
      theme = "light",
      class: className,
      classNames,
      "aria-label": ariaLabel = "Pick a color",
   }: BloomColorPickerProps & { class?: string } = $props();

   const paletteColors = $derived(bloomPalettes[palette] ?? bloomPalettes.warm);
   const resolvedOuterColors = $derived(outerColors ?? paletteColors.outer);
   const resolvedInnerColors = $derived(innerColors ?? paletteColors.inner);

   const scale = $derived(size / BASE_SWATCH);
   const part = (name: BloomColorPickerPart) => classNames?.[name];

   // "none" swaps the full spring choreography for one quick uniform fade —
   // these match the 160ms duration forced via [data-motion="none"] in style.css.
   const FADE_MS = 160;
   const instant = $derived(motion === "none");
   const PRESS_MS = $derived(instant ? FADE_MS : 140);
   const BLOOM_DELAY_MS = $derived(instant ? FADE_MS : 1300);
   const CLOSE_PETALS_MS = $derived(instant ? 0 : 110);
   const CLOSE_UNMOUNT_MS = $derived(instant ? FADE_MS : 480);

   // Outline rings scale with the picker so proportions match the original at any size
   const ring = (color: string) =>
      `outline: ${2 * scale}px solid ${color}; outline-offset: ${-2 * scale}px;`;

   // untrack: the defaults seed the initial state and are deliberately not
   // reactive afterwards, matching React's useState(defaultProp). Reading them
   // tracked would let a changed default silently reset a user's selection.
   const valueState = createControllableState<string>(
      () => value,
      (next) => (value = next),
      untrack(() => defaultValue),
      (next) => onChange?.(next)
   );

   const hex = $derived(normalizeHex(valueState.current) ?? FALLBACK_HEX);
   const derived_ = $derived(deriveFromHex(hex));

   const openState = createControllableState<boolean>(
      () => open,
      (next) => (open = next),
      untrack(() => defaultOpen),
      (next) => onOpenChange?.(next)
   );

   // Draft text for the optional hex input: lets the field hold invalid/partial
   // text while typing, but stays in sync when the color changes elsewhere
   // (petal pick, arc drag) without fighting an in-progress keystroke.
   let hexDraft = $state(untrack(() => normalizeHex(value ?? defaultValue) ?? FALLBACK_HEX));
   $effect(() => {
      // Only `hex` is a dependency, matching React's [hex]. Reading hexDraft
      // tracked would re-run this on every keystroke and immediately overwrite
      // a partial entry like "#AB" — which is the draft's whole purpose.
      const next = hex;
      if (normalizeHex(untrack(() => hexDraft)) !== next) hexDraft = next;
   });

   // Presentation lifecycle: the bloom stays mounted through the two-phase close
   // (circles collapse at 0ms, petals converge at 110ms, unmount at 480ms).
   let rendered = $state(openState.current);
   let closing = $state(false);
   let petalsHome = $state(false);
   let bloomed = $state(false); // spiral entrance finished
   let pressing = $state(false);
   let dragging = $state(false);
   let hovered = $state<string | null>(null);

   let containerEl = $state<HTMLDivElement | null>(null);
   let dishEl = $state<HTMLDivElement | null>(null);
   let svgEl = $state<SVGSVGElement | null>(null);

   // $props.id() rather than a random string: the id is rendered into both an
   // attribute and a url(#…) reference, so a value that differs between server
   // and client would be a hydration mismatch. Requires Svelte 5.20.
   const gradientId = $props.id();

   const petals = $derived(buildPetals(resolvedOuterColors, resolvedInnerColors));

   let timers: number[] = [];
   const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
   };

   $effect(() => {
      const isOpen = openState.current;
      clearTimers();

      if (isOpen) {
         rendered = true;
         closing = false;
         petalsHome = false;
         timers.push(window.setTimeout(() => (bloomed = true), BLOOM_DELAY_MS));
      } else {
         bloomed = false;
         hovered = null;
         if (rendered) {
            closing = true;
            timers.push(window.setTimeout(() => (petalsHome = true), CLOSE_PETALS_MS));
            timers.push(
               window.setTimeout(() => {
                  rendered = false;
                  closing = false;
                  petalsHome = false;
               }, CLOSE_UNMOUNT_MS)
            );
         }
      }

      return clearTimers;
   });

   // Close on outside click / Escape
   $effect(() => {
      if (!openState.current) return;

      const onDown = (e: PointerEvent) => {
         if (containerEl && !containerEl.contains(e.target as Node)) openState.set(false);
      };
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") openState.set(false);
      };

      document.addEventListener("pointerdown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
         document.removeEventListener("pointerdown", onDown);
         document.removeEventListener("keydown", onKey);
      };
   });

   const openPicker = () => {
      if (disabled) return;
      pressing = true;
      timers.push(
         window.setTimeout(() => {
            pressing = false;
            openState.set(true);
         }, PRESS_MS)
      );
   };

   // Single source of truth for hover: pick the nearest petal under the pointer.
   // Avoids missed enter/leave events between overlapping petals.
   const handleDishMove = (e: PointerEvent) => {
      if (!bloomed || !dishEl) return;
      const rect = dishEl.getBoundingClientRect();
      hovered = petalAt(
         petals,
         e.clientX - rect.left - rect.width / 2,
         e.clientY - rect.top - rect.height / 2,
         scale
      );
   };

   const ringColor = $derived(
      `color-mix(in srgb, color-mix(in srgb, ${hex}, #000 30%) 14%, transparent)`
   );

   const knob = $derived(knobPoint(derived_.lightPos));

   const onKnobDown = (e: PointerEvent) => {
      e.preventDefault();
      dragging = true;
      const dragBase = derived_.base; // hue/saturation are stable for the whole drag
      const updateFromPointer = (clientX: number, clientY: number) => {
         if (!svgEl) return;
         const rect = svgEl.getBoundingClientRect();
         const lx = (clientX - rect.left) * (ARC_CANVAS / rect.width);
         const ly = (clientY - rect.top) * (ARC_CANVAS / rect.height);
         valueState.set(shadeOf(dragBase, lightPosAt(lx, ly)));
      };
      updateFromPointer(e.clientX, e.clientY);
      const move = (ev: PointerEvent) => updateFromPointer(ev.clientX, ev.clientY);
      const up = () => {
         dragging = false;
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
      valueState.set(shadeOf(petalBase, petalPos));
   };

   const onHexInput = (e: Event) => {
      const el = e.currentTarget as HTMLInputElement;
      const raw = el.value.toUpperCase();
      const hasHash = raw.startsWith("#");
      const digits = raw.replace(/[^0-9A-F]/g, "").slice(0, 6);
      const next = (hasHash ? "#" : "") + digits;
      hexDraft = next;

      // Svelte only writes to the DOM when the bound value changes, and a
      // rejected character sanitises to the string already there — so it would
      // stay on screen. React's controlled input overwrites on every render
      // instead, which is why it silently drops junk. Do the same explicitly,
      // and pull the caret back by however many characters were dropped so
      // typing mid-string doesn't send it to the end.
      if (el.value !== next) {
         const caret = (el.selectionStart ?? raw.length) + (next.length - raw.length);
         el.value = next;
         el.setSelectionRange(caret, caret);
      }

      const valid = normalizeHex(next);
      if (valid) valueState.set(valid);
   };

   const petalStyle = (p: (typeof petals)[number]) =>
      [
         `width: ${PETAL_SIZE * scale}px`,
         `height: ${PETAL_SIZE * scale}px`,
         `margin-left: ${(-PETAL_SIZE / 2) * scale}px`,
         `margin-top: ${(-PETAL_SIZE / 2) * scale}px`,
         `left: calc(50% + ${p.x * scale}px)`,
         `top: calc(50% + ${p.y * scale}px)`,
         `background: ${p.color}`,
         `--bcp-from-x: ${-p.x * scale}px`,
         `--bcp-from-y: ${-p.y * scale}px`,
         `--bcp-petal-delay: ${0.06 + p.order * 0.022}s`,
      ].join("; ") +
      "; " +
      ring(`color-mix(in srgb, color-mix(in srgb, ${p.color}, #000 30%) 18%, transparent)`);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
   bind:this={containerEl}
   class={cx("bcp", dragging && "bcp--dragging", className, part("root"))}
   style="--bcp-scale: {scale};"
   data-slot="bcp-root"
   data-state={openState.current ? "open" : "closed"}
   data-disabled={disabled || undefined}
   data-motion={motion}
   data-input-variant={hexInput ? inputVariant : undefined}
   data-theme={theme !== "auto" ? theme : undefined}
   onpointermove={handleDishMove}
   onpointerleave={() => (hovered = null)}
>
   {#if rendered}
      <div class="bcp__slot">
         <svg
            bind:this={svgEl}
            class={cx("bcp__arc", closing && "bcp__arc--closing", part("arc"))}
            data-slot="bcp-arc"
            width={ARC_CANVAS * scale}
            height={ARC_CANVAS * scale}
            viewBox="0 0 {ARC_CANVAS} {ARC_CANVAS}"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <defs>
               <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1={ARC_C}
                  y1={ARC_C - ARC_GRADIENT_DY}
                  x2={ARC_C}
                  y2={ARC_C + ARC_GRADIENT_DY}
               >
                  <stop offset="0" stop-color="#ffffff" />
                  <stop offset="0.35" stop-color={derived_.base} />
                  <stop offset="0.65" stop-color={derived_.base} />
                  <stop offset="1" stop-color="#000000" />
               </linearGradient>
            </defs>
            <path d={ARC_PATH} stroke={ringColor} stroke-width={ARC_STROKE + 4} stroke-linecap="round" />
            <path
               d={ARC_PATH}
               stroke="url(#{gradientId})"
               stroke-width={ARC_STROKE}
               stroke-linecap="round"
            />

            <!-- Knob: selected shade with a white ring -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <g
               class={cx("bcp__knob", part("knob"))}
               data-slot="bcp-knob"
               style="cursor: {dragging ? 'grabbing' : 'grab'};"
               onpointerdown={onKnobDown}
            >
               <circle class="bcp__knob-halo" cx={knob.x} cy={knob.y} fill="#fff" />
               <circle class="bcp__knob-core" cx={knob.x} cy={knob.y} fill={hex} />
            </g>
         </svg>

         <div
            class={cx("bcp__bloom", closing && "bcp__bloom--closing", part("bloom"))}
            data-slot="bcp-bloom"
            style="background: {hex}; {ring(ringColor)}"
         >
            <div
               bind:this={dishEl}
               class={cx("bcp__dish", part("dish"))}
               data-slot="bcp-dish"
               style={ring(ringColor)}
            ></div>
         </div>

         <!-- Petals — siblings of the bloom so they outlive the circle close -->
         {#each petals as p (p.key)}
            <button
               type="button"
               class={cx(
                  "bcp__petal",
                  hovered === p.key && !petalsHome && "bcp__petal--hovered",
                  petalsHome && "bcp__petal--home",
                  part("petal")
               )}
               data-slot="bcp-petal"
               style={petalStyle(p)}
               aria-label={p.color}
               onclick={() => pickPetal(p.color)}
            ></button>
         {/each}
      </div>
   {:else}
      <button
         type="button"
         class={cx("bcp__swatch", pressing && "bcp__swatch--pressing", part("swatch"))}
         data-slot="bcp-swatch"
         style="background-color: {hex};"
         {disabled}
         aria-label={ariaLabel}
         aria-haspopup="dialog"
         aria-expanded={openState.current}
         onclick={openPicker}
      ></button>
   {/if}

   {#if hexInput}
      <div class="bcp__input-wrap">
         <input
            type="text"
            size="7"
            class={cx("bcp__input", part("input"))}
            data-slot="bcp-input"
            value={hexDraft}
            {disabled}
            spellcheck="false"
            placeholder="#RRGGBB"
            aria-label="Hex color value"
            oninput={onHexInput}
         />
      </div>
   {/if}
</div>
