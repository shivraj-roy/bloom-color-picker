import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
   plugins: [svelte()],
   test: {
      // the component reaches for document, getBoundingClientRect and pointer
      // events, so it needs a DOM rather than a bare node environment
      environment: "happy-dom",
      include: ["tests/**/*.test.ts"],
   },
   resolve: {
      // testing the component itself, not the pre-compiled output
      conditions: ["browser"],
   },
});
