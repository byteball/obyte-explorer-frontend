/*
example:
import { vDebugDirective } from "../../debug/debugDirective";

<div v-debug-directive="'name'">
</div>
*/

export const vDebugDirective = {
  created(el, binding) {
    console.log(`debug-directive[${binding.value || "noname"}]: created`);
  },
  mounted(el, binding) {
    console.log(`debug-directive[${binding.value || "noname"}]: mounted`);
  },
  updated(el, binding) {
    console.log(`debug-directive[${binding.value || "noname"}]: updated`);
  },
  unmounted(el, binding) {
    console.log(`debug-directive[${binding.value || "noname"}]: unmounted`);
  },
};
