<script setup>
import { ref, watch, inject } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useWindowScroll, useElementSize, useWindowSize } from "@vueuse/core";
import { safePrettifyJson } from "../../helpers/text";
import { getAssetName } from "../../helpers/asset";
import { prepareParamsForAddress } from "../../helpers/address";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";

import Collapse from "../elements/Collapse.vue";
import Payload from "../elements/Payload.vue";
import AddLinksToAddresses from "../elements/AddLinksToAddresses.vue";
import Link from "../elements/Link.vue";
import PaymentList from "../transactions/PaymentList.vue";
import AAResponses from "../transactions/AAResponses.vue";
import Spinner from "../icons/Spinner.vue";
import FormatAmount from "../FormatAmount.vue";
import UnspentOutputs from "./UnspentOutputs.vue";
import StateVars from "./StateVars.vue";

import { useGlobalStateStore } from "../../stores/globalState";
import fetchAddressInfo from "../../api/fetchAddressInfo";
const { lastUnit, view } = storeToRefs(useGlobalStateStore());

const socket = inject("socket.io");
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const isLoaded = ref(false);
const data = ref({});
const notFound = ref(false);
const lastRowids = ref({
  lastInputsROWID: 0,
  lastOutputsROWID: 0,
});
const isNewPageLoaded = ref(true);
const nextPagesEnded = ref(false);
const filter = ref("all");
const PL = ref(null);
const el = ref(null);
const title = ref("Obyte Explorer");

const { height: wHeigth } = useWindowSize();
const { height } = useElementSize(el);
const { y } = useWindowScroll();
useHead({ title });

function addressInfoHandler(result) {
  console.log(result);
  isNewPageLoaded.value = true;
  nextPagesEnded.value = false;

  if (result.notFound) {
    title.value = "Obyte Explorer";
    notFound.value = true;
    isLoaded.value = true;
    return;
  }

  data.value = result;
  lastRowids.value = {
    lastInputsROWID: result.newLastInputsROWID,
    lastOutputsROWID: result.newLastOutputsROWID,
  };
  notFound.value = false;
  isLoaded.value = true;
  title.value = `Obyte Explorer - ${result.address}`;
}

function nextPageHandler(data) {
  nextPagesEnded.value = data.end;
  lastRowids.value = {
    lastInputsROWID: data.newLastInputsROWID,
    lastOutputsROWID: data.newLastOutputsROWID,
  };

  PL.value.addNewTransactions(data.unitAssets, data.objTransactions);
  isNewPageLoaded.value = true;
}

async function urlHandler() {
  if (!route.params.address) return;

  const params = prepareParamsForAddress(route);
  if (route.query.asset) {
    filter.value = route.query.asset;
  }

  isLoaded.value = false;
  const result = await fetchAddressInfo(socket, route.params.address, params);
  addressInfoHandler(result);
}

async function getNextPage() {
  if (nextPagesEnded.value) return;
  const params = prepareParamsForAddress(route, lastRowids);

  isNewPageLoaded.value = false;
  const result = await fetchAddressInfo(socket, route.params.address, params);
  if (result.notFound) return;

  nextPageHandler(result);
}

watch(() => [route.params.address, route.query.asset || "all"].join("_"), urlHandler, {
  immediate: true,
});

watch(y, () => {
  if (
    isLoaded.value &&
    isNewPageLoaded.value &&
    y.value + wHeigth.value + 100 >= height.value &&
    !notFound.value
  ) {
    getNextPage();
  }
});

watch(height, () => {
  if (isLoaded.value && isNewPageLoaded.value && height.value < wHeigth.value && !notFound.value) {
    getNextPage();
  }
});

watch(filter, () => {
  if (filter.value !== route.query.asset) {
    router.push({ query: { asset: filter.value } });
  }
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
        <a @click="back" class="link link-hover text-blue-500">{{ t("closeButton") }}</a>
      </div>
      <div v-if="!isLoaded" class="text-center">
        <Spinner class="w-20 h-20 inline-block" />
      </div>
      <div v-if="notFound" class="mt-14 text-center">
        No transactions were found for this address
      </div>
      <div v-else-if="isLoaded">
        <div class="mt-10 font-bold">{{ data.address }}</div>
        <Collapse
          class="pt-1.5"
          v-if="data.definition"
          :title="t('labelDefinition')"
          :closed="true"
        >
          <Payload>
            <AddLinksToAddresses :text="safePrettifyJson(JSON.parse(data.definition))" />
          </Payload>
        </Collapse>
        <Collapse
          class="pt-1.5"
          v-if="data.objStateVars"
          :title="t('labelStateVars')"
          :closed="true"
        >
          <StateVars :state-vars="data.objStateVars" :storage-size="data.storage_size" />
        </Collapse>
        <collapse
          class="pt-1.5"
          v-if="data.arrAasFromTemplate"
          :title="t('labelAasFromTemplate')"
          :closed="true"
        >
          <ul class="list-disc list-outside ml-10">
            <li v-for="obj in data.arrAasFromTemplate" :key="obj.address">
              <Link :type="'address'" :link="obj.address">{{ obj.address }}</Link>
            </li>
          </ul>
        </collapse>
        <Collapse
          class="pt-1.5"
          v-if="data.arrAaResponses"
          :title="t('labelAaResponses')"
          :closed="true"
        >
          <AAResponses :arr-aa-responses="data.arrAaResponses" />
        </Collapse>
        <div class="pt-4 grid gap-1">
          <div v-for="(value, asset) in data.objBalances" :key="asset" class="flex">
            <FormatAmount
              :amount="value.balance"
              :decimals="value.assetDecimals"
              :is-asset="true"
              :rates="false"
            />
            <Link :type="'asset'" :link="getAssetName(asset, value.assetName)">
              {{ getAssetName(asset, value.assetName) }}
            </Link>
          </div>
        </div>
        <div class="mt-4">
          <span>{{ t("transactionsInAssets") }}: </span>
          <select class="select select-bordered select-sm py-0" v-model="filter">
            <option value="all" :selected="filter === 'all'">{{ t("labelAll") }}</option>
            <option
              v-for="(value, asset) in data.objBalances"
              :key="asset"
              :value="asset"
              :selected="filter === asset"
            >
              {{ value.assetName || asset }}
            </option>
          </select>
        </div>
        <UnspentOutputs class="mt-4" :unspent="data.unspent" />
        <PaymentList
          class="mt-12"
          ref="PL"
          :unit-assets="data.unitAssets"
          :obj-transactions="data.objTransactions"
          :address="data.address"
          :view="view"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
