<script setup>
defineProps({ title: String });
</script>

<template>
  <div>
    <span class="pr-1 text-gray-600">{{ title }}:</span>
    <span><slot></slot></span>
  </div>
</template>

<style scoped></style>
