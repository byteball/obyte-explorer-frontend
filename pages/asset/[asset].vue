<script setup>
import Asset from "~/components/asset/Asset.vue";

definePageMeta({
  path: "/asset/:asset(.*)",
  name: "asset",
  key: 'asset',
})
</script>

<template>
  <Asset />
</template>

<style scoped></style>
