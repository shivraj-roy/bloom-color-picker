"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { usePersistedState } from "../lib/use-persisted-state";
import {
   DEFAULT_INSTALL_SOURCE,
   IMPORT_LINES,
   INSTALL_SOURCE_KEY,
   type InstallSource,
} from "../lib/install-source";
import bloomPackageJson from "../../../packages/react/package.json";
import { GitHubIcon } from "./icons/github-icon";
import { HeartIcon } from "./icons/heart-icon";
import { ShadcnIcon } from "./icons/shadcn-icon";
import { BloomLogo } from "./bloom-logo";
import { BlueprintButton } from "./blueprint-button";
import { CopyButton } from "./copy-button";
import { InstallTabs, type InstallTabOption } from "./install-tabs";
import { ThemeButton } from "./theme-button";

type Manager = "npm" | "pnpm" | "bun" | "yarn";

const SOURCES: InstallTabOption<InstallSource>[] = [
   { key: "primitives", label: "Primitives", icon: <BloomLogo size={15} /> },
   { key: "shadcn", label: "shadcn/ui", icon: <ShadcnIcon size={12} /> },
];

const HEIGHT_SPRING = { type: "spring" as const, stiffness: 380, damping: 34 };

// TODO: replace with "@shivraj-roy/bloom-color-picker" once that namespace is
// listed in shadcn's registry directory (a PR adding it to
// apps/v4/registry/directory.json in shadcn-ui/ui — it publishes on merge).
// Register it against https://www.shivrajroy.in/r/{name}.json, not this
// subdomain, so future components from other projects can share the namespace;
// point that path here with a rewrite for now. The CLI resolves the directory
// live on every install, so the host stays changeable later without breaking
// anyone — but getting it right up front avoids a second review round.
const REGISTRY_URL = "https://bloom-color-picker.shivrajroy.in/r/bloom-color-picker.json";

const INSTALL: Record<InstallSource, Record<Manager, string>> = {
   primitives: {
      npm: "npm install bloom-color-picker",
      pnpm: "pnpm add bloom-color-picker",
      bun: "bun add bloom-color-picker",
      yarn: "yarn add bloom-color-picker",
   },
   shadcn: {
      npm: `npx shadcn@latest add ${REGISTRY_URL}`,
      pnpm: `pnpm dlx shadcn@latest add ${REGISTRY_URL}`,
      bun: `bunx --bun shadcn@latest add ${REGISTRY_URL}`,
      yarn: `yarn dlx shadcn@latest add ${REGISTRY_URL}`,
   },
};

const MANAGERS = Object.keys(INSTALL.primitives) as Manager[];

const PROPS_SNIPPET = [
   "<BloomColorPicker",
   '   defaultValue="#FFB1EE"',
   "   onChange={(hex) => console.log(hex)}",
   "/>",
];

function usageSnippet(source: InstallSource) {
   return [...IMPORT_LINES[source], "", ...PROPS_SNIPPET].join("\n");
}

export function Sidebar() {
   const [manager, setManager] = usePersistedState<Manager>("package-manager", "npm");
   const [source, setSource] = usePersistedState<InstallSource>(
      INSTALL_SOURCE_KEY,
      DEFAULT_INSTALL_SOURCE
   );
   const usage = usageSnippet(source);
   const activeIdx = SOURCES.findIndex((s) => s.key === source);

   // The two usage snippets differ by a line, so the box would otherwise jump
   // on every switch. The <pre> keeps its natural height inside a clipped
   // wrapper; only that wrapper is animated, to the height just measured.
   const usageRef = useRef<HTMLPreElement>(null);
   const [usageHeight, setUsageHeight] = useState<number | "auto">("auto");

   useLayoutEffect(() => {
      const measure = () => {
         if (usageRef.current) setUsageHeight(usageRef.current.offsetHeight);
      };

      measure();
      const raf = window.requestAnimationFrame(measure); // re-check once fonts settle
      return () => window.cancelAnimationFrame(raf);
   }, [source]);

   return (
      <aside className="box sidebar">
         <div>
            <div className="sidebar__title-row">
               <BloomLogo size={56} />
               <h1 className="sidebar__title">Bloom Color Picker</h1>
            </div>
            <p className="sidebar__tagline">
               A color picker that blooms. A tiny swatch opens into a dahlia of petal swatches. Zero
               dependencies.
            </p>
            <div className="badges">
               <span className="badge badge--accent">v{bloomPackageJson.version}</span>
               <a
                  className="badge"
                  href="https://github.com/shivraj-roy/bloom-color-picker"
                  target="_blank"
                  rel="noreferrer"
               >
                  <GitHubIcon />
                  GitHub
               </a>
               <span className="badge">MIT</span>
            </div>
         </div>

         <div className="sidebar__section">
            <span className="sidebar__label">Install</span>
            <div>
               <InstallTabs options={SOURCES} value={source} onValueChange={setSource} />
               {/* squared off under the first tab so the two share one straight
                  left edge; rounded again once the tab has moved away from it */}
               <motion.div
                  className="install-box"
                  initial={false}
                  animate={{ borderTopLeftRadius: activeIdx > 0 ? 12 : 0 }}
                  transition={HEIGHT_SPRING}
               >
                  <div className="tabs">
                     {MANAGERS.map((m) => (
                        <button
                           key={m}
                           type="button"
                           className={`tab${manager === m ? " tab--active" : ""}`}
                           onClick={() => setManager(m)}
                        >
                           {m}
                           {manager === m && (
                              <motion.span
                                 className="tab__underline"
                                 layoutId="install-tab-underline"
                                 transition={{ type: "spring", stiffness: 500, damping: 34 }}
                              />
                           )}
                        </button>
                     ))}
                  </div>
                  <div className="code-row">
                     <code className="scroll-mask-x">{INSTALL[source][manager]}</code>
                     <CopyButton text={INSTALL[source][manager]} label="Copy install command" />
                  </div>
               </motion.div>
            </div>
         </div>

         <div className="sidebar__section" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
               <span className="sidebar__label">Usage</span>
               <CopyButton text={usage} label="Copy usage snippet" />
            </div>
            <div className="code-block">
               <motion.div
                  className="code-block__reveal"
                  initial={false}
                  animate={{ height: usageHeight }}
                  transition={HEIGHT_SPRING}
               >
                  <pre ref={usageRef} className="code-block__scroll scroll-mask-x">
                     {usage}
                  </pre>
               </motion.div>
            </div>
         </div>

         <motion.a
            className="sponsor-link"
            href="https://github.com/sponsors/shivraj-roy"
            target="_blank"
            rel="noreferrer"
            initial="rest"
            whileHover="hover"
            animate="rest"
         >
            <span className="sponsor-btn">
               <HeartIcon size={20} />
            </span>
            <span className="sponsor-link__label">Sponsor</span>
         </motion.a>

         <ThemeButton />
         <BlueprintButton />
      </aside>
   );
}
