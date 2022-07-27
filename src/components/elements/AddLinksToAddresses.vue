<script setup>
import { onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

defineProps({
  text: String,
});

const router = useRouter();

function addLinksToAddresses(text) {
  return text.replace(/&quot;([A-Z0-9]{32})&quot;/g, function (match, p1) {
    return `&quot;<a class="addr link link-hover text-blue-500" href="/address/${p1}">${p1}</a>&quot;`;
  });
}

function click(event) {
  const { target } = event;
  if (target && target.tagName === "A" && target.className.includes("addr")) {
    event.preventDefault();
    router.push({ path: `/address/${target.innerText}` });
  }
}

onBeforeMount(() => {
  window.addEventListener("click", click, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", click, true);
});
</script>

<template><div v-html="addLinksToAddresses(text)"></div></template>

<style scoped></style>
