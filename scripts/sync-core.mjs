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

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreDir = join(root, "packages/core/src");

// every framework package that should receive a copy
const targets = ["react", "vue"];

// What the last sync wrote. Without it, a file deleted from core would leave its
// copies behind: the copies are no longer regenerated, nothing reports a change,
// and the CI guard passes while each package keeps shipping a module core no
// longer has — including into users' projects, via the registry.
const manifestPath = join(root, "scripts/.core-manifest.json");
const previous = existsSync(manifestPath)
   ? (JSON.parse(readFileSync(manifestPath, "utf8")).files ?? [])
   : [];

const files = readdirSync(coreDir).sort();
const removed = previous.filter((name) => !files.includes(name));

for (const target of targets) {
   const outDir = join(root, "packages", target, "src");
   mkdirSync(outDir, { recursive: true });

   for (const name of files) {
      writeFileSync(join(outDir, name), readFileSync(join(coreDir, name)));
   }

   for (const name of removed) {
      const stale = join(outDir, name);
      if (existsSync(stale)) {
         rmSync(stale);
         console.log(`  ${target}: removed ${name} (no longer in core)`);
      }
   }

   console.log(`  ${target}: ${files.length} file(s)`);
}

writeFileSync(manifestPath, JSON.stringify({ files }, null, 2) + "\n");

console.log(`\nSynced ${files.length} file(s) from packages/core/src`);
if (removed.length) console.log(`Removed ${removed.length} stale file(s): ${removed.join(", ")}`);
