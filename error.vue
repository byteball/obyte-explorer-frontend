<script setup lang="ts">
import {prepareLink} from "~/helpers/prepareLink";

const error = useError();
const route = useRoute();

function isUnit(path: string) {
  path = path.substring(1);
  return path.length === 44;
}

if (error.value?.statusCode === 404 && isUnit(route.path)) {
  const unit = route.path.substring(1);
  clearError({ redirect: '/' + prepareLink(unit) });
} else {
  clearError({ redirect: '/' });
}

</script>

<template>
  <div></div>
</template>
