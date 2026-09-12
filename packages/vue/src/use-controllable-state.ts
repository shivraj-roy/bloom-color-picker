import { computed, ref, type Ref } from "vue";

/**
 * Controlled/uncontrolled state: when `prop` reads as defined the component
 * follows it and only reports changes through `onChange`; otherwise state is
 * kept internally.
 *
 * `prop` is taken as a getter rather than a value so control can be handed over
 * at any point — a parent that starts passing `value` later switches the
 * component to controlled without it being remounted.
 */
export function useControllableState<T>(
   prop: () => T | undefined,
   defaultProp: T,
   onChange?: (value: T) => void
): [Ref<T>, (next: T) => void] {
   const internal = ref(defaultProp) as Ref<T>;

   const value = computed({
      get: () => {
         const controlled = prop();
         return controlled === undefined ? internal.value : controlled;
      },
      set: (next: T) => {
         if (prop() === undefined) internal.value = next;
         onChange?.(next);
      },
   }) as Ref<T>;

   return [value, (next: T) => (value.value = next)];
}
