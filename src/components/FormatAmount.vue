<script setup>
import { onMounted, ref } from "vue";
import { format, getFormattedObject } from "../helpers/amount";

const props = defineProps(["amount", "isAsset", "decimals", "rates", "showDollar"]);

const v = ref({
  value: 0,
  usd: "",
});

const formattedValue = ref("");
const view = ref("formatted");

function updValue() {
  v.value = getFormattedObject(
    props.amount,
    !props.isAsset,
    props.decimals || 0,
    props.rates || {}
  );

  formattedValue.value = format(v.value.value);
}

function showRaw() {
  view.value = "raw";
}

function out() {
  setTimeout(() => {
    view.value = "formatted";
  }, 250);
}

onMounted(() => {
  updValue();
});
</script>

<template>
  <div class="inline-block">
    <span v-if="showDollar">$</span>
    <span v-if="view === 'raw'" @mouseout="out()">{{ v.value }}</span>
    <span v-if="view === 'formatted'" @click="showRaw()">{{ formattedValue }}</span
    >&nbsp;<span>{{ v.usd }}</span>
  </div>
</template>

<style scoped></style>
