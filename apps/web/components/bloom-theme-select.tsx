import type { SVGProps } from "react";

import type { ToggleSelectOption } from "./toggle-select";

export type BloomTheme = "auto" | "light" | "dark";

function AutoThemeIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M11.9989 2.75C7.99438 2.75 4.74805 5.99633 4.74805 10.0009C4.74805 12.3433 5.85882 14.4264 7.58239 15.7519C7.62065 15.7814 7.65921 15.8104 7.69807 15.8391C8.30648 16.2881 8.74775 16.961 8.74775 17.7171V18.9988C8.74775 20.7944 10.2034 22.25 11.9989 22.25C13.7945 22.25 15.2501 20.7944 15.2501 18.9988V17.7171C15.2501 16.961 15.6914 16.2881 16.2998 15.8391C16.3387 15.8104 16.3772 15.7814 16.4155 15.7519C18.139 14.4264 19.2498 12.3433 19.2498 10.0009C19.2498 5.99633 16.0035 2.75 11.9989 2.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M8.74805 17.75H15.2504"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M13.2405 8.18518L12.5436 6.37334C12.4571 6.14842 12.241 6 12 6C11.759 6 11.5429 6.14842 11.4564 6.37334L10.7595 8.18518C10.658 8.44927 10.4493 8.65797 10.1852 8.75955L8.37334 9.45641C8.14842 9.54292 8 9.75901 8 10C8 10.241 8.14842 10.4571 8.37334 10.5436L10.1852 11.2405C10.4493 11.342 10.658 11.5507 10.7595 11.8148L11.4564 13.6267C11.5429 13.8516 11.759 14 12 14C12.241 14 12.4571 13.8516 12.5436 13.6267L13.2405 11.8148C13.342 11.5507 13.5507 11.342 13.8148 11.2405L15.6267 10.5436C15.8516 10.4571 16 10.241 16 10C16 9.75901 15.8516 9.54292 15.6267 9.45641L13.8148 8.75955C13.5507 8.65797 13.342 8.44927 13.2405 8.18518Z"
            fill="currentColor"
         />
      </svg>
   );
}

function LightThemePropIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M2.49012 13.0894L1.53906 13.3984M22.4623 6.60006L21.5112 6.90908M2.49012 6.90863L1.53906 6.59961M22.4623 13.398L21.5112 13.089"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M11.9991 2.75C7.99456 2.75 4.74823 5.99633 4.74823 10.0009C4.74823 12.3433 5.85901 14.4264 7.58257 15.7519C7.62083 15.7814 7.6594 15.8104 7.69826 15.8391C8.30666 16.2881 8.74793 16.961 8.74793 17.7171V18.9988C8.74793 20.7944 10.2035 22.25 11.9991 22.25C13.7947 22.25 15.2503 20.7944 15.2503 18.9988V17.7171C15.2503 16.961 15.6916 16.2881 16.3 15.8391C16.3388 15.8104 16.3774 15.7814 16.4157 15.7519C18.1392 14.4264 19.25 12.3433 19.25 10.0009C19.25 5.99633 16.0037 2.75 11.9991 2.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M8.74792 17.75H15.2503"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

function DarkThemePropIcon(props: SVGProps<SVGSVGElement>) {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path
            d="M11.9991 2.75C7.99456 2.75 4.74823 5.99633 4.74823 10.0009C4.74823 12.3433 5.85901 14.4264 7.58257 15.7519C7.62083 15.7814 7.6594 15.8104 7.69826 15.8391C8.30666 16.2881 8.74793 16.961 8.74793 17.7171V18.9988C8.74793 20.7944 10.2035 22.25 11.9991 22.25C13.7947 22.25 15.2503 20.7944 15.2503 18.9988V17.7171C15.2503 16.961 15.6916 16.2881 16.3 15.8391C16.3388 15.8104 16.3774 15.7814 16.4157 15.7519C18.1392 14.4264 19.25 12.3433 19.25 10.0009C19.25 5.99633 16.0037 2.75 11.9991 2.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M8.74792 17.75H15.2503"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

export const BLOOM_THEME_OPTIONS: ToggleSelectOption<BloomTheme>[] = [
   { value: "auto", label: "Auto theme", icon: <AutoThemeIcon /> },
   { value: "light", label: "Light theme", icon: <LightThemePropIcon /> },
   { value: "dark", label: "Dark theme", icon: <DarkThemePropIcon /> },
];
