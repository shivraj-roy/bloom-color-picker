/**
 * Controlled/uncontrolled state, in the two shapes a Svelte consumer expects.
 *
 * - nothing passed → the value lives here, seeded from `defaultValue`
 * - `bind:value` → the parent's binding is written through
 * - `value` passed without `bind:` → the parent's value wins, and changes are
 *   only reported via `onChange`, matching the React package's semantics
 *
 * `read` is a getter rather than a value so the decision is re-made on every
 * access: a parent that starts passing `value` later switches the component to
 * controlled without it being recreated.
 */
export function createControllableState<T>(
   read: () => T | undefined,
   write: (next: T) => void,
   defaultValue: T,
   onChange?: (value: T) => void
) {
   let internal = $state(defaultValue);

   return {
      get current(): T {
         const controlled = read();
         return controlled === undefined ? internal : controlled;
      },
      set(next: T) {
         if (read() === undefined) internal = next;
         else write(next);
         onChange?.(next);
      },
   };
}
