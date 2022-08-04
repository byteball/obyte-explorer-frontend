<script setup>
import { ref } from "vue";
import { ChevronUpIcon, ChevronRightIcon } from "@heroicons/vue/solid";

const props = defineProps({
  title: String,
  closed: Boolean,
  isSubCollapse: Boolean,
});

const open = ref(!props.closed);

function toggle() {
  open.value = !open.value;
}
</script>

<template>
  <div>
    <div
      class="cursor-pointer text-gray-600 hover:text-gray-900 inline-flex align-middle"
      @click="toggle"
      :class="{ 'bg-gray-100 w-full p-1': isSubCollapse, 'text-gray-900': open }"
    >
      <slot name="title">
        <span class="text-sm">{{ title }}</span>
      </slot>
      <label class="swap swap-rotate" :class="open ? 'swap-active' : ''">
        <ChevronUpIcon class="swap-on w-5" />
        <ChevronRightIcon class="swap-off w-5" />
      </label>
    </div>
    <div v-show="open" class="pt-1.5" :class="isSubCollapse ? 'pl-1.5' : ''">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped></style>
