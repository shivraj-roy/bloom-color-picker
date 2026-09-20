import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BloomColorPicker from "../src/BloomColorPicker.svelte";

// Matches the constants in the component: the swatch waits PRESS_MS before
// opening, the petals converge at CLOSE_PETALS_MS and unmount at
// CLOSE_UNMOUNT_MS. Tests drive these rather than sleeping.
const PRESS_MS = 140;
const CLOSE_UNMOUNT_MS = 480;

const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

const openPicker = async () => {
   await fireEvent.click($(".bcp__swatch")!);
   await vi.advanceTimersByTimeAsync(PRESS_MS);
};

describe("BloomColorPicker", () => {
   beforeEach(() => vi.useFakeTimers());
   afterEach(() => {
      cleanup();
      vi.useRealTimers();
   });

   it("starts closed, showing only the swatch", () => {
      render(BloomColorPicker, { defaultValue: "#FFB1EE" });
      expect($(".bcp__swatch")).toBeTruthy();
      expect($$(".bcp__petal")).toHaveLength(0);
      expect($(".bcp")!.getAttribute("data-state")).toBe("closed");
   });

   it("scales from the size prop", () => {
      render(BloomColorPicker, { size: 32 });
      expect($(".bcp")!.getAttribute("style")).toContain("--bcp-scale: 0.64");
   });

   it("opens after the press delay, rendering every petal", async () => {
      render(BloomColorPicker, { palette: "warm" });
      await fireEvent.click($(".bcp__swatch")!);
      expect($$(".bcp__petal")).toHaveLength(0);

      await vi.advanceTimersByTimeAsync(PRESS_MS);

      // warm palette: 12 outer + 6 inner + centre
      expect($$(".bcp__petal")).toHaveLength(19);
      expect($(".bcp")!.getAttribute("data-state")).toBe("open");
   });

   it("does not open when disabled", async () => {
      render(BloomColorPicker, { disabled: true });
      await openPicker();
      expect($$(".bcp__petal")).toHaveLength(0);
   });

   it("closes on Escape and unmounts the bloom after the close runs", async () => {
      render(BloomColorPicker, {});
      await openPicker();
      expect($$(".bcp__petal").length).toBeGreaterThan(0);

      await fireEvent.keyDown(document, { key: "Escape" });
      await vi.advanceTimersByTimeAsync(CLOSE_UNMOUNT_MS);

      expect($$(".bcp__petal")).toHaveLength(0);
      expect($(".bcp__swatch")).toBeTruthy();
   });

   it("picking a petal reports a normalised hex", async () => {
      const onChange = vi.fn();
      render(BloomColorPicker, { onChange });
      await openPicker();

      await fireEvent.click($$(".bcp__petal")[0]!);

      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][0]).toMatch(/^#[0-9A-F]{6}$/);
   });

   it("uncontrolled: state moves to the picked colour", async () => {
      const onChange = vi.fn();
      render(BloomColorPicker, { defaultValue: "#FFB1EE", onChange });
      expect($(".bcp__swatch")!.getAttribute("style")).toContain("#FFB1EE");

      await openPicker();
      await fireEvent.click($$(".bcp__petal")[0]!);

      const hex = (onChange.mock.calls[0][0] as string).toLowerCase();
      expect(hex).not.toBe("#ffb1ee");
      expect($(".bcp__knob-core")!.getAttribute("fill")!.toLowerCase()).toBe(hex);
   });

   // Svelte semantics differ from React and Vue here, deliberately. `value` is
   // $bindable, so `bind:value` is how a Svelte consumer takes control; passing
   // it unbound seeds the picker and then lets it manage itself, which is what
   // a plain prop means in Svelte. onChange still reports every change either way.
   it("unbound value seeds the picker, and changes are reported", async () => {
      const onChange = vi.fn();
      render(BloomColorPicker, { value: "#FFB1EE", onChange });
      expect($(".bcp__swatch")!.getAttribute("style")).toContain("#FFB1EE");

      await openPicker();
      await fireEvent.click($$(".bcp__petal")[0]!);

      expect(onChange).toHaveBeenCalled();
      const hex = (onChange.mock.calls[0][0] as string).toLowerCase();
      expect($(".bcp__knob-core")!.getAttribute("fill")!.toLowerCase()).toBe(hex);
   });

   it("switches to controlled when a parent starts passing value", async () => {
      // the getter-based state helper exists for exactly this
      const { rerender } = render(BloomColorPicker, { defaultValue: "#FFB1EE" });
      await rerender({ value: "#000000" });
      expect($(".bcp__swatch")!.getAttribute("style")).toContain("#000000");
   });

   it("hex input keeps partial text while typing, and applies valid values", async () => {
      const onChange = vi.fn();
      render(BloomColorPicker, { defaultValue: "#FFB1EE", onChange });
      const input = $(".bcp__input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: "#AB" } });
      expect(input.value).toBe("#AB");
      expect(onChange).not.toHaveBeenCalled();

      await fireEvent.input(input, { target: { value: "#00FF00" } });
      expect(onChange).toHaveBeenCalledWith("#00FF00");
   });

   it("hex input rejects characters that are not hex digits", async () => {
      render(BloomColorPicker, {});
      const input = $(".bcp__input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "#zzqq" } });
      expect(input.value).toBe("#");
   });

   it("hides the hex input when asked", () => {
      render(BloomColorPicker, { hexInput: false });
      expect($(".bcp__input")).toBeNull();
   });

   it("reports opening through onOpenChange", async () => {
      const onOpenChange = vi.fn();
      render(BloomColorPicker, { onOpenChange });
      await openPicker();
      expect(onOpenChange).toHaveBeenCalledWith(true);
   });

   it("passes per-part classes through", () => {
      render(BloomColorPicker, { class: "mine", classNames: { swatch: "my-swatch" } });
      expect($(".bcp")!.classList.contains("mine")).toBe(true);
      expect($(".bcp__swatch")!.classList.contains("my-swatch")).toBe(true);
   });

   it("honours an explicit theme and omits the attribute on auto", () => {
      render(BloomColorPicker, { theme: "dark" });
      expect($(".bcp")!.getAttribute("data-theme")).toBe("dark");
      cleanup();

      render(BloomColorPicker, { theme: "auto" });
      expect($(".bcp")!.getAttribute("data-theme")).toBeNull();
   });

   // The Vue port fired consumer callbacks twice, because Vue routes an
   // onChange prop to the same listener emit() reaches. Svelte has no emit
   // layer so it cannot, but the guarantee is worth pinning in both.
   it("calls an onChange prop exactly once per change", async () => {
      const onChange = vi.fn();
      render(BloomColorPicker, { onChange });
      await openPicker();
      await fireEvent.click($$(".bcp__petal")[0]!);
      expect(onChange).toHaveBeenCalledTimes(1);
   });

   it("an initially open picker still closes on Escape", async () => {
      render(BloomColorPicker, { defaultOpen: true });
      await vi.advanceTimersByTimeAsync(0);
      expect($$(".bcp__petal").length).toBeGreaterThan(0);

      await fireEvent.keyDown(document, { key: "Escape" });
      await vi.advanceTimersByTimeAsync(CLOSE_UNMOUNT_MS);
      expect($$(".bcp__petal")).toHaveLength(0);
   });

   it("gives the gradient a stable id, not a random one", () => {
      render(BloomColorPicker, { defaultOpen: true });
      const grad = $("linearGradient");
      const id = grad?.getAttribute("id");
      expect(id).toBeTruthy();
      // the arc must reference the very same id
      expect($("path[stroke^='url(']")?.getAttribute("stroke")).toBe(`url(#${id})`);
   });

   // Regression: a rejected character sanitises to the string already bound, so
   // nothing re-rendered and the junk stayed on screen. React's controlled
   // input overwrites the DOM on every render, so it never shows.
   it("drops a rejected character instead of leaving it in the field", async () => {
      render(BloomColorPicker, { defaultValue: "#FFB1EE" });
      const input = $(".bcp__input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: "#AB" } });
      expect(input.value).toBe("#AB");

      await fireEvent.input(input, { target: { value: "#ABz" } });
      expect(input.value).toBe("#AB");

      await fireEvent.input(input, { target: { value: "#AB!!" } });
      expect(input.value).toBe("#AB");

      await fireEvent.input(input, { target: { value: "#ABC" } });
      expect(input.value).toBe("#ABC");
   });

   it("caps the field at six hex digits", async () => {
      render(BloomColorPicker, {});
      const input = $(".bcp__input") as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "#AABBCCDD" } });
      expect(input.value).toBe("#AABBCC");
   });

   // Regression: the caret was adjusted by the total characters removed, which
   // also counted ones removed *after* it. Typing D into "#AA|BBCC" truncates
   // the trailing C, but that is past the caret and must not drag it back.
   it("puts the caret after a character typed mid-string", async () => {
      render(BloomColorPicker, { defaultValue: "#AABBCC" });
      const el = $(".bcp__input") as HTMLInputElement;

      el.value = "#AADBBCC";
      el.setSelectionRange(4, 4);
      await fireEvent.input(el);

      expect(el.value).toBe("#AADBBC");
      expect(el.selectionStart).toBe(4);
   });
});
