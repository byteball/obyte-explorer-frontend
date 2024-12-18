<script setup>
import { prepareLink } from "~/helpers/prepareLink.js";

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
  <NuxtLink class="link link-hover text-blue-500" :to="path + prepareLink(link)">
    <slot></slot>
  </NuxtLink>
</template>

<style scoped></style>
