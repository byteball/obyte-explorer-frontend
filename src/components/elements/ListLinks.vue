<script setup>
import { ref } from "vue";
import Link from "./Link.vue";

const props = defineProps(["links", "type"]);

const path = ref("/");
if (props.type === "address") {
  path.value += "address/";
}
</script>

<template>
  <div class="grid gap-1">
    <div v-for="link in links" :key="link" :class="{ grid: type === 'unit' }">
      <Link :type="type" :link="link" :class="{ 'truncate max-w-95': type === 'unit' }">
        {{ link }}
      </Link>
    </div>
  </div>
</template>

<style scoped></style>
