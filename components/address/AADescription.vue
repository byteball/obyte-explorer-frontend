<script setup>
import { computed } from "vue";
import { useAaDescription } from "~/composables/useAaDescription";

const props = defineProps({
  definition: {
    type: String,
    default: '',
  },
  baseAaDefinition: {
    type: String,
    default: '',
  },
});

const { aaDescription, aaHomepageUrl, aaSourceUrl } = useAaDescription(
  computed(() => props.definition),
  computed(() => props.baseAaDefinition)
);
</script>

<template>
  <div v-if="aaDescription" class="mt-1">
    {{ aaDescription }}
  </div>
  <div class="mt-1">
    <div v-if="aaHomepageUrl" class="inline-block">
      <NuxtLink class="link link-hover text-blue-500" :to="aaHomepageUrl" target="_blank"> Home page </NuxtLink>
    </div>
    <div v-if="aaSourceUrl" class="ml-2 inline-block">
      <NuxtLink class="link link-hover text-blue-500" :to="aaSourceUrl" target="_blank"> Source </NuxtLink>
    </div>
  </div>
</template>
