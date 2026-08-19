"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { DarkThemeIcon } from "./icons/dark-theme-icon";
import { LightThemeIcon } from "./icons/light-theme-icon";
import { IconToggle } from "./icon-toggle";

export function ThemeButton() {
   const { resolvedTheme, setTheme } = useTheme();
   // Sidebar renders client-only (ssr: false) already, but next-themes still
   // recommends this guard — the provider's real value may not be settled
   // on the very first tick after mount.
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   const theme = mounted ? resolvedTheme : "light";
   const isLight = theme === "light";

   return (
      <IconToggle
         className="theme-btn"
         on={isLight}
         onIcon={<LightThemeIcon size={19} />}
         offIcon={<DarkThemeIcon size={19} />}
         onToggle={() => setTheme(isLight ? "dark" : "light")}
         ariaLabel={isLight ? "Switch to dark theme" : "Switch to light theme"}
      />
   );
}
