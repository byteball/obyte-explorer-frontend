<script setup>
import { useWindowScroll, useElementSize, useWindowSize } from "@vueuse/core";

import { safePrettifyJson } from "~/helpers/text";
import { getAssetName } from "~/helpers/asset";
import { prepareParamsForAddress } from "~/helpers/address";

import { useHead } from "@vueuse/head";
import { desc } from "~/configs/meta";

import Collapse from "~/components/elements/Collapse.vue";
import Payload from "~/components/elements/Payload.vue";
import AddLinksToAddresses from "~/components/elements/AddLinksToAddresses.vue";
import Link from "~/components/elements/Link.vue";
import BalancesChart from "~/components/elements/BalancesChart.vue";
import PaymentList from "~/components/transactions/PaymentList.vue";
import AAResponses from "~/components/transactions/AAResponses.vue";
import Spinner from "~/components/icons/Spinner.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import UnspentOutputs from "~/components/address/UnspentOutputs.vue";
import StateVars from "~/components/address/StateVars.vue";

import { useGlobalStateStore } from "~/stores/globalState";
import { useRatesStore } from "~/stores/rates";
const { lastUnit, view } = storeToRefs(useGlobalStateStore());
const { rates } = storeToRefs(useRatesStore());

import fetchAddressInfo from "~/api/fetchAddressInfo";
import AADescription from "~/components/address/AADescription.vue";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const title = (route.params.address ? 
    `Address ${route.params.address} transactions and portfolio | ` : '') + 
    desc;

useHead({
  title: title,
  meta: [
    { name: "description", content: title },
    { name: "og:title", content: title },
    { name: "og:description", content: title },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: title },
  ],
})

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
const paramsForPie = ref([]);
const showStatsLink = ref(false);

const { height: wHeigth } = useWindowSize();
const { height } = useElementSize(el);
const { y } = useWindowScroll();


function prepareDataForPieFromBalances(balances) {
  let data = [];
  let bytes = null;

  if (!Object.keys(rates.value).length) return [];

  for (let asset in balances) {
    const balance = balances[asset].balance;
    let decimals = balances[asset].assetDecimals || 0;
    const assetName = balances[asset].assetName || "GBYTE";
    if (asset === "bytes") {
      asset = "GBYTE";
      decimals = 9;
    }
    if (!rates.value[`${asset}_USD`]) continue;

    let value = balance / 10 ** decimals;
    value = Number((rates.value[`${asset}_USD`] * value).toFixed(2));

    if (asset === "GBYTE") {
      bytes = { value, name: "GBYTE" };
      continue;
    }
    data.push({ value, name: assetName });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  if (!bytes && data.length) {
    bytes = { value: 0, assetName: "GBYTE" };
  }

  if (bytes) {
    data = [bytes, ...data];
  }

  return data;
}

function addressInfoHandler(result) {
  isNewPageLoaded.value = true;
  nextPagesEnded.value = false;
  paramsForPie.value = [];

  if (!result) {
    const err = `For address: ${route.params.address}. Result:${result}`;
    report(new Error(err));
  }
  
  if (result?.notFound) {
    notFound.value = true;
    isLoaded.value = true;
    return;
  }

  data.value = result;
  showStatsLink.value = !result.testnet && result.arrAaResponses !== undefined;
  paramsForPie.value = prepareDataForPieFromBalances(result.objBalances);
  lastRowids.value = {
    lastInputsROWID: result.newLastInputsROWID,
    lastOutputsROWID: result.newLastOutputsROWID,
  };
  notFound.value = false;
  isLoaded.value = true;
}

function nextPageHandler(data) {
  if(!data) {
    const err = `For next page in address: ${route.params.address}. Result:${data}`;
    report(new Error(err));
  }
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
  
  const key = `address:${route.params.address}:${route.query.asset || 'null'}`;
  const { data: result } = await useAsyncData(key, () => fetchAddressInfo(route.params.address, params));
  
  addressInfoHandler(result.value);
}

async function getNextPage() {
  if (nextPagesEnded.value) return;
  const params = prepareParamsForAddress(route, lastRowids);

  isNewPageLoaded.value = false;
  const result = await fetchAddressInfo(route.params.address, params);
  if (result.notFound) return;

  nextPageHandler(result);
}

await urlHandler();

watch(() => [route.params.address, route.query.asset || "all"].join("_"), () => {
  urlHandler();
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

watch(rates, () => {
  if (data.value) {
    paramsForPie.value = prepareDataForPieFromBalances(data.value.objBalances);
  }
});

function back() {
  if (lastUnit.value) {
    return router.push({ path: "/" + lastUnit.value });
  }

  return router.push({ path: "/" });
}
</script>

<template>
  <div class="w-full bg-white absolute h-full p-1 sm:p-4 pt-4" style="z-index: 1100">    
    <div class="max-w-6xl mx-auto w-full text-sm md:text-base" ref="el">
      <div class="text-right pr-4">
        <a @click="back" class="link link-hover text-blue-500">{{ t("closeButton") }}</a>
      </div>
      <div v-if="!isLoaded" class="text-center">
        <Spinner class="w-20 h-20 inline-block" />
      </div>
      <div v-if="notFound" class="mt-14 text-center">
        No transactions were found for this address
      </div>
      <div v-else-if="isLoaded">
        <div class="mt-10 font-bold">
          {{ data.address }}
        </div>
        <div v-if="showStatsLink" class="font-normal text-sm">
          <a
            :href="'https://aa-stats.obyte.org/address/' + data.address"
            target="_blank"
            class="link link-hover text-blue-500"
            >View Autonomous Agent stats (TVL, turnover)
          </a>
        </div>
        <ClientOnly>
          <AADescription
            :definition="data.definition"
            :baseAaDefinition="data.baseAaDefinition"
          />
        </ClientOnly>
        <div class="block lg:flex">
          <div class="flex-auto">
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
            <div class="pt-4" v-if="data.tpsFeesBalance !== null">
              <span>{{ t("labelTpsFeesBalance") }}: </span>
              <FormatAmount
                :amount="data.tpsFeesBalance"
                :rates="rates"
              />
            </div>
            <div class="mt-4">
              <span>{{ t("transactionsInAssets") }}: </span>
              <select class="select select-bordered select-sm py-0" v-model="filter">
                <option value="all" :selected="filter === 'all'">{{ t("labelAll") }}</option>
                <option
                  v-for="(value, asset) in data.objAddressAssets"
                  :key="asset"
                  :value="asset"
                  :selected="filter === asset"
                >
                  {{ value.assetName || asset }}
                </option>
              </select>
            </div>
            <UnspentOutputs v-if="view === 'UTXO'" class="mt-4" :unspent="data.unspent"/>
          </div>
          <div class="flex justify-center">
            <BalancesChart
              v-if="paramsForPie.length"
              class="h-80 w-80"
              :data="paramsForPie"
              name="Balances"
            />
          </div>
        </div>
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
