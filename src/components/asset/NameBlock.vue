<script setup>
import Link from "../elements/Link.vue";

defineProps(["assetUnit", "name", "url", "urlName"]);
</script>

<template>
  <div v-if="assetUnit === 'bytes'"><span class="font-bold">Bytes</span> - native asset</div>
  <div v-else-if="name">
    <span class="font-bold">{{ name }}</span>
    <span v-if="url">
      - view on
      <a :href="url" target="_blank" class="link link-hover text-blue-500">{{ urlName }}</a> and
      <Link :type="'unit'" :link="assetUnit">definition</Link>
    </span>
    <span v-else> - view <Link :type="'unit'" :link="assetUnit">definition</Link></span>
  </div>
  <div v-else>
    <span class="font-bold">{{ assetUnit }}</span> - view
    <Link :type="'unit'" :link="assetUnit">definition</Link>
  </div>
</template>

<style scoped></style>
