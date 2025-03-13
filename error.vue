<script setup lang="ts">
import type {NuxtError} from '#app'
import {prepareLink} from "~/helpers/prepareLink.js";

const props = defineProps({
  error: Object as () => NuxtError
})

const route = useRoute();

function isUnit(path: string) {
  path = path.substring(1);
  return path.length === 44;
}

if (props.error?.statusCode === 404 && isUnit(route.path)) {
  const unit = route.path.substring(1);
  clearError({redirect: '/' + prepareLink(unit)});
}

console.error({
  message: props.error?.message,
  stack: props.error?.stack,
  statusCode: props.error?.statusCode,
});
</script>

<template>
  <div style="height: 100vh; display: flex; align-items: center; justify-content: center">
    <div style="font-size: 18px; text-align: center">
      <span>An unexpected error has occurred, try to reload the page.</span> <span v-if="error">({{
        error.statusCode
      }})</span>
    </div>
  </div>
</template>
