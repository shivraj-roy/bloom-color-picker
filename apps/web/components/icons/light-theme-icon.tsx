export function LightThemeIcon({ size = 16 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3V8ZM12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16V8Z"
            fill="currentColor"
         />
         <path
            d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z"
            stroke="currentColor"
            strokeWidth="1.5"
         />
      </svg>
   );
}
