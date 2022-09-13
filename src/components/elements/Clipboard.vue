<script setup>
import { ref, watch } from "vue";
import { DocumentDuplicateIcon, CheckIcon } from "@heroicons/vue/outline";
import { useWindowSize } from "@vueuse/core";

const props = defineProps({
  text: String,
});

const waiting = ref(true);
const isMobile = ref(false);

const { width } = useWindowSize();

watch(
  width,
  () => {
    isMobile.value = width.value <= 500;
  },
  {
    immediate: true,
  }
);

function write() {
  waiting.value = false;
  setTimeout(() => {
    waiting.value = true;
  }, 5000);

  navigator.clipboard.writeText(props.text).then(
    function () {
      console.log("clipboard:ok");
    },
    function () {
      console.log("clipboard:!ok");
    }
  );
}
</script>

<template>
  <div
    @click="write"
    :class="{ tooltip: waiting && !isMobile }"
    class=""
    data-tip="Copy to clipboard"
  >
    <label class="swap swap-rotate" :class="{ 'swap-active': waiting, 'cursor-default': !waiting }">
      <DocumentDuplicateIcon class="swap-on text-blue-500 w-5" />
      <CheckIcon class="swap-off w-5 text-green-500" />
    </label>
  </div>
</template>

<style scoped></style>
