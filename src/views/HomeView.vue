<script setup>
import UnitComponent from "../components/unit/Index.vue";
import UnitInfo from "../components/unit/UnitInfo.vue";
</script>

<template>
  <UnitComponent />
  <div id="info">
    <UnitInfo />
  </div>
</template>

<style scoped>
#info {
  position: absolute;
  right: 0;
  top: 4rem;
  bottom: 0;
  width: 34%;
  border-left: 1px solid #ccc;
  overflow: auto;
}
</style>
