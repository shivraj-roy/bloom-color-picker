"use client";

import { motion } from "motion/react";

import { usePersistedState } from "../lib/use-persisted-state";
import bloomPackageJson from "../../../packages/react/package.json";
import { GitHubIcon } from "./icons/github-icon";
import { HeartIcon } from "./icons/heart-icon";
import { ShadcnIcon } from "./icons/shadcn-icon";
import { BloomLogo } from "./bloom-logo";
import { BlueprintButton } from "./blueprint-button";
import { CopyButton } from "./copy-button";
import { InstallTabs, type InstallTabOption } from "./install-tabs";
import { ThemeButton } from "./theme-button";

type Source = "primitives" | "shadcn";
type Manager = "npm" | "pnpm" | "bun" | "yarn";

const SOURCES: InstallTabOption<Source>[] = [
   { key: "primitives", label: "Primitives", icon: <BloomLogo size={15} /> },
   { key: "shadcn", label: "shadcn/ui", icon: <ShadcnIcon size={12} /> },
];

const REGISTRY_URL = "https://bloom-color-picker.shivrajroy.in/r/bloom-color-picker.json";

const INSTALL: Record<Source, Record<Manager, string>> = {
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

const PROPS_SNIPPET = `
<BloomColorPicker
   defaultValue="#FFB1EE"
   onChange={(hex) => console.log(hex)}
/>`;

// the vendored copy imports its own stylesheet internally, so — unlike the
// npm package — it needs no separate style.css import here.
const USAGE: Record<Source, string> = {
   primitives: `import { BloomColorPicker } from "bloom-color-picker";
import "bloom-color-picker/style.css";
${PROPS_SNIPPET}`,
   shadcn: `import { BloomColorPicker } from "@/components/bloom-color-picker";
${PROPS_SNIPPET}`,
};

export function Sidebar() {
   const [manager, setManager] = usePersistedState<Manager>("package-manager", "npm");
   const [source, setSource] = usePersistedState<Source>("install-source", "primitives");
   const activeIdx = SOURCES.findIndex((s) => s.key === source);

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
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
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
               <CopyButton text={USAGE[source]} label="Copy usage snippet" />
            </div>
            <div className="code-block">
               <pre className="code-block__scroll scroll-mask-x">{USAGE[source]}</pre>
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
