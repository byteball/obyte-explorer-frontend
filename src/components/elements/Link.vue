<script setup>
import { ref } from "vue";

const props = defineProps({
  link: String,
  type: String,
});

const path = ref("/");
if (props.type === "address") {
  path.value += "address/";
}

if (props.type === "asset") {
  path.value += "asset/";
}
</script>

<template>
  <router-link class="link link-hover text-blue-500" :to="path + link">
    <slot></slot>
  </router-link>
</template>

<style scoped></style>
