<script setup>
import { onMounted, ref } from "vue";
import { getFormattedObject } from "../helpers/amount";

import Clipboard from "./elements/Clipboard.vue";
const props = defineProps(["amount", "isAsset", "decimals", "rates", "showDollar"]);

const v = ref({
  value: 0,
  usd: "",
});

function updValue() {
  v.value = getFormattedObject(
    props.amount,
    !props.isAsset,
    props.decimals || 0,
    props.rates || {}
  );
}

onMounted(() => {
  updValue();
});
</script>

<template>
  <div class="inline-block">
    <Clipboard class="pr-1 inline-block" style="margin-top: -2px" :text="String(v.value)" />
    <span v-if="showDollar">$</span>
    <span v-number-format>{{ v.value }}</span
    >&nbsp;<span>{{ v.usd }}</span>
  </div>
</template>

<style scoped></style>
