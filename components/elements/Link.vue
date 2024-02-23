<script setup>
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

function prepareLink(link) {
  if (link.startsWith("/")) {
    return link.replace("/", "%2F");
  }

  return link;
}
</script>

<template>
  <NuxtLink class="link link-hover text-blue-500" :to="path + prepareLink(link)">
    <slot></slot>
  </NuxtLink>
</template>

<style scoped></style>
