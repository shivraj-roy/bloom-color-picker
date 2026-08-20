export function DarkThemeIcon({ size = 16 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M12 16C14.2091 16 16 14.2091 16 12C16 9.7909 14.2091 8 12 8V3C16.9706 3 21 7.0294 21 12C21 16.9706 16.9706 21 12 21V16ZM12 16C9.7909 16 8 14.2091 8 12C8 9.7909 9.7909 8 12 8V16Z"
            fill="currentColor"
         />
         <path
            d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
         />
      </svg>
   );
}
