<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useElementSize, useWindowScroll, useWindowSize } from "@vueuse/core/index";
import { prepareData } from "../../helpers/asset";
import { useHead } from "@vueuse/head";

import PaymentList from "../transactions/PaymentList.vue";
import FormatAmount from "../FormatAmount.vue";
import Spinner from "../icons/Spinner.vue";
import NameBlock from "./NameBlock.vue";
import ListHolders from "./ListHolders.vue";

import { useGlobalStateStore } from "../../stores/globalState";
import { useRatesStore } from "../../stores/rates";
import fetchAssetInfo from "../../api/fetchAssetInfo";

const router = useRouter();
const route = useRoute();

const { lastUnit, view } = storeToRefs(useGlobalStateStore());
const { rates } = storeToRefs(useRatesStore());

const isLoaded = ref(false);
const data = ref({});
const notFound = ref(false);
const lastRowids = ref({
  lastInputsROWID: 0,
  lastOutputsROWID: 0,
});
const isNewPageLoaded = ref(true);
const nextPagesEnded = ref(false);
const PL = ref(null);
const el = ref(null);
const title = ref("Obyte Explorer");

const { height: wHeigth } = useWindowSize();
const { height } = useElementSize(el);
const { y } = useWindowScroll();
useHead({ title });

function assetInfoHandler(_data) {
  isNewPageLoaded.value = true;
  nextPagesEnded.value = false;

  if (_data.notFound) {
    title.value = "Obyte Explorer";
    notFound.value = true;
    return;
  }

  data.value = prepareData(_data, rates);
  isLoaded.value = true;
  lastRowids.value = {
    lastInputsROWID: _data.transactionsData.newLastInputsROWID,
    lastOutputsROWID: _data.transactionsData.newLastOutputsROWID,
  };
  isLoaded.value = true;
  title.value = `Obyte Explorer - ${_data.name}`;
}

async function urlHandler() {
  if (!route.params.asset) return;

  isLoaded.value = false;

  const result = await fetchAssetInfo(route.params.asset);
  assetInfoHandler(result);
}

function nextPageHandler(data) {
  nextPagesEnded.value = data.end;
  lastRowids.value = {
    lastInputsROWID: data.transactionsData.newLastInputsROWID,
    lastOutputsROWID: data.transactionsData.newLastOutputsROWID,
  };

  PL.value.addNewTransactions(
    data.transactionsData.unitAssets,
    data.transactionsData.objTransactions
  );
  isNewPageLoaded.value = true;
}

async function getNextPage() {
  isNewPageLoaded.value = false;

  const result = await fetchAssetInfo(route.params.asset, {
    lastInputsROWID: lastRowids.value.lastInputsROWID,
    lastOutputsROWID: lastRowids.value.lastOutputsROWID,
  });
  nextPageHandler(result);
}

watch(y, () => {
  if (y.value + wHeigth.value + 100 >= height.value && isLoaded.value && isNewPageLoaded.value) {
    getNextPage();
  }
});

watch(height, () => {
  if (isLoaded.value && isNewPageLoaded.value && height.value < wHeigth.value) {
    getNextPage();
  }
});

watch(() => route.params.asset, urlHandler, {
  immediate: true,
});

function back() {
  if (lastUnit) {
    return router.push({ path: "/" + lastUnit.value });
  }

  return router.push({ path: "/" });
}
</script>

<template>
  <div class="w-full bg-white absolute h-full p-4" style="z-index: 1100">
    <div class="max-w-6xl mx-auto w-full text-sm md:text-base" ref="el">
      <div class="text-right">
        <a @click="back" class="link link-hover text-blue-500">Close</a>
      </div>
      <div v-if="!isLoaded" class="text-center">
        <Spinner class="w-20 h-20 inline-block" />
      </div>
      <div v-if="notFound" class="mt-14 text-center">No transactions were found for this asset</div>
      <div v-if="isLoaded">
        <div class="mt-10">
          <NameBlock
            :asset-unit="data.assetUnit"
            :name="data.name"
            :url="data.url"
            :url-name="data.urlName"
          />
        </div>
        <div class="mt-4" v-if="data.supply">
          <div>
            Total supply:
            <FormatAmount :amount="data.supply" :is-asset="true" />
            {{ data.name }}
          </div>
          <template v-if="data.dollarPrice">
            <div>
              Price:
              <FormatAmount
                :amount="Number(data.dollarPrice.toPrecision(6))"
                :is-asset="true"
                :show-dollar="true"
              />
            </div>
            <div>
              Marketcap:
              <FormatAmount
                :amount="Number(data.marketCap.toFixed(2))"
                :is-asset="true"
                :show-dollar="true"
              />
            </div>
          </template>
        </div>
        <ListHolders
          class="mt-4"
          :holders="data.holders"
          :name="data.name"
          :asset="route.params.asset"
          :decimals="data.decimals"
          :end-holders="data.endHolders"
          :offset-for-holders="data.offsetForHolders"
          :type-of-holders="data.typeOfHolders"
        />
        <PaymentList
          class="mt-12"
          ref="PL"
          :unit-assets="data.transactionsData.unitAssets"
          :obj-transactions="data.transactionsData.objTransactions"
          :address="null"
          :view="view"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
