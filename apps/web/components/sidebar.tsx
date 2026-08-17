"use client";

import { motion } from "motion/react";

import { usePersistedState } from "../lib/use-persisted-state";
import { GitHubIcon } from "./animated-icons/github-icon";
import { HeartIcon } from "./animated-icons/heart-icon";
import { CopyButton } from "./copy-button";

const INSTALL: Record<string, string> = {
   npm: "npm install bloom-color-picker",
   pnpm: "pnpm add bloom-color-picker",
   bun: "bun add bloom-color-picker",
   yarn: "yarn add bloom-color-picker",
};

const USAGE = `import { BloomColorPicker } from "bloom-color-picker";
import "bloom-color-picker/style.css";

<BloomColorPicker
   defaultValue="#FFB1EE"
   onChange={(hex) => console.log(hex)}
/>`;

export function Sidebar() {
   const [manager, setManager] = usePersistedState<keyof typeof INSTALL>("package-manager", "npm");

   return (
      <aside className="box sidebar">
         <div>
            <h1 className="sidebar__title">
               Bloom
               <br />
               Color Picker
            </h1>
            <p className="sidebar__tagline">
               A color picker that blooms. A tiny swatch opens into a dahlia of petal swatches.
               Zero dependencies.
            </p>
            <div className="badges">
               <span className="badge badge--accent">v0.1.0</span>
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
            <div className="install-box">
               <div className="tabs">
                  {Object.keys(INSTALL).map((m) => (
                     <button
                        key={m}
                        type="button"
                        className={`tab${manager === m ? " tab--active" : ""}`}
                        onClick={() => setManager(m as keyof typeof INSTALL)}
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
                  <code>{INSTALL[manager]}</code>
                  <CopyButton text={INSTALL[manager]} label="Copy install command" />
               </div>
            </div>
         </div>

         <div className="sidebar__section" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
               <span className="sidebar__label">Usage</span>
               <CopyButton text={USAGE} label="Copy usage snippet" />
            </div>
            <div className="code-block">
               <pre className="code-block__scroll scroll-mask-x">{USAGE}</pre>
            </div>
         </div>

         <a
            className="sponsor-link"
            href="https://github.com/sponsors/shivraj-roy"
            target="_blank"
            rel="noreferrer"
         >
            <span className="sponsor-btn">
               <HeartIcon size={17} />
            </span>
            <span className="sponsor-link__label">Sponsor</span>
         </a>
      </aside>
   );
}
