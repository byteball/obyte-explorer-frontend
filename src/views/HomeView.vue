<script setup>
import UnitComponent from "../components/unit/Index.vue";
import UnitInfo from "../components/unit/UnitInfo.vue";
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  document.body.classList.add("overscroll-none");
});

onUnmounted(() => {
  document.body.classList.remove("overscroll-none");
});
</script>

<template>
  <UnitComponent />
  <UnitInfo />
</template>
