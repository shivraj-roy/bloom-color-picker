// Copies the framework-agnostic sources from packages/core into each framework
// package.
//
// They are copied rather than imported because both distribution channels
// require it: each published package must stay zero-dependency, and the shadcn
// registry vendors raw source files into the user's project — an import of
// `@bloom-color-picker/core` would resolve in this repo and nowhere else. So
// every framework package holds a real copy, and `pnpm sync:core` plus the CI
// guard are what stop those copies drifting.
//
// The copies are byte-identical, deliberately: no generated-file banner. These
// same bytes are vendored into users' projects by `shadcn add`, and a comment
// telling them to edit a core copy they don't have would be worse than nothing.
// The guard against editing a copy is CI, not a comment.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreDir = join(root, "packages/core/src");

// every framework package that should receive a copy
const targets = ["react", "vue"];

const files = readdirSync(coreDir).sort();

for (const target of targets) {
   const outDir = join(root, "packages", target, "src");
   mkdirSync(outDir, { recursive: true });

   for (const name of files) {
      writeFileSync(join(outDir, name), readFileSync(join(coreDir, name)));
   }

   console.log(`  ${target}: ${files.length} file(s)`);
}

console.log(`\nSynced ${files.length} file(s) from packages/core/src`);
