<script setup>
import { useAaDescription } from "~/composables/useAaDescription";

const props = defineProps({
  address: String,
  definition: [String, Array, Object],
  baseAaDefinition: [String, Array, Object],
});

const { aaDescription, aaHomepageUrl, aaSourceUrl } = useAaDescription(
  () => props.address,
  () => props.definition,
  () => props.baseAaDefinition
);

defineExpose({ aaDescription });
</script>

<template>
  <div v-if="aaDescription" class="mt-1">
    {{ aaDescription }}
  </div>
  <div v-if="aaHomepageUrl || aaSourceUrl" class="mt-1 text-sm space-x-2">
    <a
      v-if="aaHomepageUrl"
      class="link link-hover text-blue-500"
      :href="aaHomepageUrl"
      target="_blank"
      rel="noopener noreferrer"
    >Home page</a>
    <a
      v-if="aaSourceUrl"
      class="link link-hover text-blue-500"
      :href="aaSourceUrl"
      target="_blank"
      rel="noopener noreferrer"
    >Source</a>
  </div>
</template>
