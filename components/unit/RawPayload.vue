<script setup>
import { prettifyJson } from "~/helpers/text";

import Collapse from "~/components/elements/Collapse.vue";
import Link from "~/components/elements/Link.vue";

defineProps(["title", "unit", "type", "rawPayload"]);

function isObject(obj) {
  return typeof obj === "object";
}
</script>

<template>
  <Collapse :title="title" :is-sub-collapse="true">
    <div v-for="(value, key) in rawPayload" :key="key">
      <div class="whitespace-pre-wrap">
        <span class="text-gray-500">{{ key }}: </span>
        <span v-if="isObject(value)" style="word-break: break-word">{{ prettifyJson(value) }}</span>
        <span v-else style="word-break: break-word">{{ value }}</span>
      </div>
    </div>
    <div v-if="type === 'asset'">
      <Link :type="'asset'" :link="unit">Asset info</Link>
    </div>
  </Collapse>
</template>

<style scoped></style>
