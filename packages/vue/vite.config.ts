import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
   plugins: [vue()],
   build: {
      lib: {
         entry: resolve(__dirname, "src/index.ts"),
         formats: ["es"],
         fileName: () => "index.js",
      },
      // vue stays external so the published package keeps zero runtime
      // dependencies, matching the React build
      rollupOptions: { external: ["vue"] },
   },
   test: {
      // the component reaches for document, getBoundingClientRect and pointer
      // events, so it needs a DOM rather than a bare node environment
      environment: "happy-dom",
      include: ["tests/**/*.test.ts"],
   },
});
