<script setup>
import { DocumentDuplicateIcon } from "@heroicons/vue/outline";

const props = defineProps({
  text: String,
});

function write() {
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
  <DocumentDuplicateIcon class="text-blue-500 w-5 cursor-pointer" @click="write" />
</template>

<style scoped></style>
