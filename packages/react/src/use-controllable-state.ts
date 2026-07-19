import * as React from "react";

/**
 * Controlled/uncontrolled state: when `prop` is provided the component follows it
 * and only reports changes through `onChange`; otherwise state is kept internally.
 */
export function useControllableState<T>(
   prop: T | undefined,
   defaultProp: T,
   onChange?: (value: T) => void
): [T, (next: T) => void] {
   const [internal, setInternal] = React.useState(defaultProp);
   const isControlled = prop !== undefined;
   const value = isControlled ? prop : internal;

   const onChangeRef = React.useRef(onChange);
   React.useEffect(() => {
      onChangeRef.current = onChange;
   });

   const setValue = React.useCallback(
      (next: T) => {
         if (!isControlled) setInternal(next);
         onChangeRef.current?.(next);
      },
      [isControlled]
   );

   return [value, setValue];
}
