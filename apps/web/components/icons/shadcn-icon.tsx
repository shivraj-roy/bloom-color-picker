export function ShadcnIcon({ size = 14 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 256 256"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M208 128l-80 80M192 40L40 192"
            stroke="currentColor"
            strokeWidth={25}
            strokeLinecap="round"
         />
      </svg>
   );
}
