export function AnnotationArrowIcon({
   width = 75,
   height = 25,
}: {
   width?: number;
   height?: number;
}) {
   return (
      <svg
         width={width}
         height={height}
         viewBox="0 0 75 25"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M15.4884 1.50032L1.7438 5.39224L4.08232 17.0394M1.7438 5.39224C28.5216 26.5422 52.8208 25.9366 72.7588 15.8793"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
         />
      </svg>
   );
}
