<script setup>
import { onMounted, onUnmounted } from "vue";
import UnitComponent from "../components/unit/Index.vue";
import UnitInfo from "../components/unit/UnitInfo.vue";
import ContentForLegend from "../components/elements/ContentForLegend.vue";

onMounted(() => {
  document.body.classList.add("overscroll-none", "overflow-hidden");
});

onUnmounted(() => {
  document.body.classList.remove("overscroll-none", "overflow-hidden");
});
</script>

<template>
  <ContentForLegend />
  <UnitComponent />
  <UnitInfo />
</template>
