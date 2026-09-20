import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BloomColorPicker from "../src/BloomColorPicker.vue";

// Matches the constants in the component: the swatch waits PRESS_MS before
// opening, the petals converge at CLOSE_PETALS_MS and unmount at
// CLOSE_UNMOUNT_MS. Tests drive these rather than sleeping.
const PRESS_MS = 140;
const CLOSE_UNMOUNT_MS = 480;

const open = async (wrapper: ReturnType<typeof mount>) => {
   await wrapper.find(".bcp__swatch").trigger("click");
   vi.advanceTimersByTime(PRESS_MS);
   await wrapper.vm.$nextTick();
   await wrapper.vm.$nextTick();
};

describe("BloomColorPicker", () => {
   beforeEach(() => vi.useFakeTimers());
   afterEach(() => vi.useRealTimers());

   it("starts closed, showing only the swatch", () => {
      const w = mount(BloomColorPicker, { props: { defaultValue: "#FFB1EE" } });
      expect(w.find(".bcp__swatch").exists()).toBe(true);
      expect(w.findAll(".bcp__petal")).toHaveLength(0);
      expect(w.find(".bcp").attributes("data-state")).toBe("closed");
   });

   it("scales from the size prop", () => {
      const w = mount(BloomColorPicker, { props: { size: 32 } });
      // 32 / BASE_SWATCH(50)
      expect(w.find(".bcp").attributes("style")).toContain("--bcp-scale: 0.64");
   });

   it("opens after the press delay, rendering every petal", async () => {
      const w = mount(BloomColorPicker, { props: { palette: "warm" } });
      await w.find(".bcp__swatch").trigger("click");

      // still closed until the press animation has run
      expect(w.findAll(".bcp__petal")).toHaveLength(0);

      vi.advanceTimersByTime(PRESS_MS);
      await w.vm.$nextTick();
      await w.vm.$nextTick();

      // warm palette: 12 outer + 6 inner + centre
      expect(w.findAll(".bcp__petal")).toHaveLength(19);
      expect(w.find(".bcp").attributes("data-state")).toBe("open");
   });

   it("does not open when disabled", async () => {
      const w = mount(BloomColorPicker, { props: { disabled: true } });
      await open(w);
      expect(w.findAll(".bcp__petal")).toHaveLength(0);
   });

   it("closes on Escape and unmounts the bloom after the close runs", async () => {
      const w = mount(BloomColorPicker, {});
      await open(w);
      expect(w.findAll(".bcp__petal").length).toBeGreaterThan(0);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await w.vm.$nextTick();
      vi.advanceTimersByTime(CLOSE_UNMOUNT_MS);
      await w.vm.$nextTick();

      expect(w.findAll(".bcp__petal")).toHaveLength(0);
      expect(w.find(".bcp__swatch").exists()).toBe(true);
   });

   it("picking a petal reports a normalised hex", async () => {
      const onChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { onChange } });
      await open(w);

      await w.findAll(".bcp__petal")[0].trigger("click");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toMatch(/^#[0-9A-F]{6}$/);
   });

   it("uncontrolled: the swatch follows its own state", async () => {
      const onChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { defaultValue: "#FFB1EE", onChange } });
      expect(w.find(".bcp__swatch").attributes("style")).toContain("#FFB1EE");

      await open(w);
      await w.findAll(".bcp__petal")[0].trigger("click");
      vi.advanceTimersByTime(CLOSE_UNMOUNT_MS);
      await w.vm.$nextTick();

      const hex = (onChange.mock.calls[0][0] as string).toLowerCase();
      // internal state moved to the picked colour
      expect(w.find(".bcp__bloom, .bcp__swatch").exists()).toBe(true);
      expect(hex).not.toBe("#ffb1ee");
   });

   it("controlled: the value prop wins and changes are only reported", async () => {
      const onChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { value: "#FFB1EE", onChange } });
      await open(w);
      await w.findAll(".bcp__petal")[0].trigger("click");
      await w.vm.$nextTick();

      // reported outward, through the callback and the v-model emit...
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(w.emitted("update:value")).toBeTruthy();
      // ...but the rendered colour still follows the prop
      const knobCore = w.find(".bcp__knob-core");
      expect(knobCore.attributes("fill")).toBe("#FFB1EE");
   });

   it("switches to controlled when a parent starts passing value", async () => {
      // the getter-based controllable state exists for exactly this: React
      // re-reads props every render, Vue would otherwise freeze the decision
      const w = mount(BloomColorPicker, { props: { defaultValue: "#FFB1EE" } });
      await w.setProps({ value: "#000000" });
      await w.vm.$nextTick();
      expect(w.find(".bcp__swatch").attributes("style")).toContain("#000000");
   });

   it("hex input keeps partial text while typing, and applies valid values", async () => {
      const onChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { defaultValue: "#FFB1EE", onChange } });
      const input = w.find(".bcp__input");

      await input.setValue("#AB");
      expect((input.element as HTMLInputElement).value).toBe("#AB");
      expect(onChange).not.toHaveBeenCalled();

      await input.setValue("#00FF00");
      expect(onChange).toHaveBeenCalledWith("#00FF00");
   });

   it("hex input rejects characters that are not hex digits", async () => {
      const w = mount(BloomColorPicker, {});
      const input = w.find(".bcp__input");
      await input.setValue("#zzqq");
      expect((input.element as HTMLInputElement).value).toBe("#");
   });

   it("hides the hex input when asked", () => {
      const w = mount(BloomColorPicker, { props: { hexInput: false } });
      expect(w.find(".bcp__input").exists()).toBe(false);
   });

   it("emits update:open so v-model:open works", async () => {
      const onOpenChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { onOpenChange } });
      await open(w);
      expect(w.emitted("update:open")![0]).toEqual([true]);
      expect(onOpenChange).toHaveBeenCalledWith(true);
   });

   it("passes per-part classes through", async () => {
      const w = mount(BloomColorPicker, {
         props: { className: "mine", classNames: { swatch: "my-swatch" } },
      });
      expect(w.find(".bcp").classes()).toContain("mine");
      expect(w.find(".bcp__swatch").classes()).toContain("my-swatch");
   });

   it("honours an explicit theme and omits the attribute on auto", () => {
      const dark = mount(BloomColorPicker, { props: { theme: "dark" } });
      expect(dark.find(".bcp").attributes("data-theme")).toBe("dark");

      const auto = mount(BloomColorPicker, { props: { theme: "auto" } });
      expect(auto.find(".bcp").attributes("data-theme")).toBeUndefined();
   });

   // Regression, twice over. Calling the prop *and* emitting fired every
   // handler twice; emitting alone then missed `:on-change="fn"` entirely,
   // because a template's kebab binding lands in the vnode props as
   // "on-change" and emit() only resolves the camelised "onChange". Both
   // spellings must fire, and exactly once.
   it.each(["onChange", "on-change"])("a %s binding fires exactly once", async (key) => {
      const onChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { [key]: onChange } as never });
      await open(w);
      await w.findAll(".bcp__petal")[0].trigger("click");
      expect(onChange).toHaveBeenCalledTimes(1);
   });

   it.each(["onOpenChange", "on-open-change"])("a %s binding fires exactly once", async (key) => {
      const onOpenChange = vi.fn();
      const w = mount(BloomColorPicker, { props: { [key]: onOpenChange } as never });
      await open(w);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
   });

   // Regression: the close-listener watcher was not immediate, so a picker that
   // started open had no Escape or outside-click handling until it cycled once.
   it("an initially open picker still closes on Escape", async () => {
      const w = mount(BloomColorPicker, { props: { defaultOpen: true } });
      await w.vm.$nextTick();
      expect(w.findAll(".bcp__petal").length).toBeGreaterThan(0);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await w.vm.$nextTick();
      vi.advanceTimersByTime(CLOSE_UNMOUNT_MS);
      await w.vm.$nextTick();

      expect(w.findAll(".bcp__petal")).toHaveLength(0);
   });

   // Regression: a rejected character sanitises to the string already bound, so
   // nothing re-rendered and the junk stayed on screen. React's controlled
   // input overwrites the DOM on every render, so it never shows.
   it("drops a rejected character instead of leaving it in the field", async () => {
      const w = mount(BloomColorPicker, { props: { defaultValue: "#FFB1EE" } });
      const input = w.find(".bcp__input");
      const el = input.element as HTMLInputElement;

      await input.setValue("#AB");
      expect(el.value).toBe("#AB");

      await input.setValue("#ABz");
      expect(el.value).toBe("#AB");

      await input.setValue("#AB!!");
      expect(el.value).toBe("#AB");

      await input.setValue("#ABC");
      expect(el.value).toBe("#ABC");
   });

   it("caps the field at six hex digits", async () => {
      const w = mount(BloomColorPicker, {});
      const input = w.find(".bcp__input");
      await input.setValue("#AABBCCDD");
      expect((input.element as HTMLInputElement).value).toBe("#AABBCC");
   });
});
