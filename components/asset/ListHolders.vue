<script setup>
import { useElementSize } from "@vueuse/core";

import Collapse from "~/components/elements/Collapse.vue";
import Link from "~/components/elements/Link.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import HoldersChart from "~/components/elements/HoldersChart.vue";

import fetchNextHolders from "~/api/fetchNextHolders";

const props = defineProps([
  "holders",
  "symbol",
  "asset",
  "decimals",
  "endHolders",
  "offsetForHolders",
  "typeOfHolders",
  "supply",
]);

const { t } = useI18n();
const listHolders = ref([]);
const lEndHolders = ref(false);
const lOffsetForHolders = ref(0);
const paramsForPie = ref([]);
const chart = ref();

const { width } = useElementSize(chart);

function prepareDataForPieFromHolders(holders) {
  const data = [];
  let sum = 0;
  let isSlicedList = false;
  const decimals = props.decimals || 0;

  if (holders.length > 20) {
    holders = holders.slice(0, 20);
    isSlicedList = true;
  }

  holders.forEach((v) => {
    const value = v.balance / 10 ** decimals;
    sum += value;
    data.push({ value, name: v.address });
  });

  if (isSlicedList) {
    data.push({ value: props.supply - sum, name: "Others" });
  }

  return data;
}

function initHoldersData() {
  paramsForPie.value = [];
  lEndHolders.value = props.endHolders;
  lOffsetForHolders.value = props.offsetForHolders;
  listHolders.value = [...props.holders];
  paramsForPie.value = prepareDataForPieFromHolders(props.holders);
}

initHoldersData();

watch(width, () => {
  if (!chart.value) return;
  chart.value.resize();
});

function moreHoldersHandler(data) {
  lEndHolders.value = data.end;
  lOffsetForHolders.value += data.holders.length;
  listHolders.value = [...listHolders.value, ...data.holders];
}

async function getMoreHolders() {
  const result = await fetchNextHolders(props.asset, {
    type: props.typeOfHolders,
    offset: lOffsetForHolders.value,
  });
  moreHoldersHandler(result);
}
</script>

<template>
  <div>
    <HoldersChart
      ref="chart"
      class="h-96 w-full py-8"
      :data="paramsForPie"
      name="Holders"
      :symbol="symbol"
    />
    <Collapse :title="t('holders')" :closed="true">
      <div class="grid gap-1" v-memo="[listHolders]">
        <ul class="list-decimal list-inside">
          <li v-for="holder in listHolders" :key="holder.address">
            <Link :type="'address'" :link="holder.address">{{ holder.address }}</Link>
            &nbsp;(<FormatAmount :amount="holder.balance" :decimals="decimals" :is-asset="true" />
            {{ symbol }})
          </li>
        </ul>
        <a v-if="!lEndHolders" class="link link-hover text-blue-500 mt-2" @click="getMoreHolders">
          {{ t("showMoreHolders") }}
        </a>
      </div>
    </Collapse>
  </div>
</template>

<style scoped></style>
