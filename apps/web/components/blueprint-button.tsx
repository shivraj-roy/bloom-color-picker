"use client";

import { useEffect } from "react";

import { usePersistedState } from "../lib/use-persisted-state";
import { BlueprintOffIcon } from "./icons/blueprint-off-icon";
import { BlueprintOnIcon } from "./icons/blueprint-on-icon";
import { IconToggle } from "./icon-toggle";

export function BlueprintButton() {
   const [visible, setVisible] = usePersistedState("blueprint-visible", false);

   useEffect(() => {
      document.body.classList.toggle("blueprint-visible", visible);
   }, [visible]);

   return (
      <IconToggle
         className="blueprint-btn"
         on={visible}
         onIcon={<BlueprintOnIcon size={19} />}
         offIcon={<BlueprintOffIcon size={19} />}
         onToggle={() => setVisible((v) => !v)}
         ariaLabel={visible ? "Hide blueprint grid" : "Show blueprint grid"}
      />
   );
}
