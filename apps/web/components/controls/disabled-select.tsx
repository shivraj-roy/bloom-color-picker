import type { SVGProps } from "react";

import type { ToggleSelectOption } from "../toggle-select";

// won't open
function LockedFlowerIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M7.5 12C5.01472 12 3 9.98528 3 7.5C3 6.2924 3.47567 5.1959 4.24987 4.38765M7.5 12C5.01472 12 3 14.0147 3 16.5C3 18.9853 5.01472 21 7.5 21C9.98528 21 12 18.9853 12 16.5M7.5 12H9M7.5 3C9.98528 3 12 5.01472 12 7.5C12 5.01472 14.0147 3 16.5 3C18.9853 3 21 5.01472 21 7.5C21 9.98528 18.9853 12 16.5 12C18.9853 12 21 14.0147 21 16.5M12 16.5C12 18.9853 14.0147 21 16.5 21C17.7076 21 18.8041 20.5243 19.6124 19.7501M12 16.5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.72345 10.0462C9.27251 10.5711 9 11.2538 9 12.0001C9 13.657 10.3431 15.0001 12 15.0001C12.7463 15.0001 13.429 14.7276 13.9539 14.2767M13.0166 9.17676C13.8535 9.47811 14.5177 10.1409 14.821 10.9768"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.5 9.5L8 8M14.5 9.5L16 8M14.5 14.5L16 16M9.5 14.5L8 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path d="M1.98279 2.02637L22.0002 22.0438" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
   );
}

// opens (default)
function UnlockedFlowerIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M7.5 12C5.01472 12 3 9.98528 3 7.5C3 5.01472 5.01472 3 7.5 3C9.98528 3 12 5.01472 12 7.5M7.5 12C5.01472 12 3 14.0147 3 16.5C3 18.9853 5.01472 21 7.5 21C9.98528 21 12 18.9853 12 16.5M7.5 12H9M12 7.5C12 5.01472 14.0147 3 16.5 3C18.9853 3 21 5.01472 21 7.5C21 9.98528 18.9853 12 16.5 12M12 7.5V9M12 16.5C12 18.9853 14.0147 21 16.5 21C18.9853 21 21 18.9853 21 16.5C21 14.0147 18.9853 12 16.5 12M12 16.5V15M16.5 12H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.5 9.5L8 8M14.5 9.5L16 8M14.5 14.5L16 16M9.5 14.5L8 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

export const DISABLED_OPTIONS: ToggleSelectOption<boolean>[] = [
   { value: false, label: "Enable picker", icon: <UnlockedFlowerIcon /> },
   { value: true, label: "Disable picker", icon: <LockedFlowerIcon /> },
];
