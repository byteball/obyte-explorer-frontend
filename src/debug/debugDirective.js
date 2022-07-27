/*
example:
import { vDebugDirective } from "../../debug/debugDirective";

<div v-debug-directive>
</div>
*/

export const vDebugDirective = {
  created() {
    console.log("debug-directive:", "created");
  },
  mounted() {
    console.log("debug-directive:", "mounted");
  },
  updated() {
    console.log("debug-directive:", "updated");
  },
  unmounted() {
    console.log("debug-directive:", "unmounted");
  },
};
