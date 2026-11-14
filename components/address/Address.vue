<script setup>
import { prettifyJson } from "~/helpers/text";
import { getAssetName } from "~/helpers/asset";
import { prepareDataForPieFromBalances } from "~/helpers/balances";
import { getDateOnlyFromSeconds } from "~/helpers/date";
import { findCodeBlockLine } from "~/helpers/definition";
import { prepareLink } from "~/helpers/prepareLink";
import { useElementSize, useScroll } from "@vueuse/core";

import { desc } from "~/configs/meta";

import Collapse from "~/components/elements/Collapse.vue";
import Payload from "~/components/elements/Payload.vue";
import OscriptHighlighter from "~/components/elements/OscriptHighlighter.vue";
import Link from "~/components/elements/Link.vue";
import BalancesChart from "~/components/elements/BalancesChart.vue";
import Clipboard from "~/components/elements/Clipboard.vue";
import AADescription from "~/components/address/AADescription.vue";
import PaymentList from "~/components/transactions/PaymentList.vue";
import AAResponses from "~/components/transactions/AAResponses.vue";
import Spinner from "~/components/icons/Spinner.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import UnspentOutputs from "~/components/address/UnspentOutputs.vue";
import StateVars from "~/components/address/StateVars.vue";

import { useGlobalStateStore } from "~/stores/globalState";
import { useRatesStore } from "~/stores/rates";
import fetchAddressInfo from "~/api/fetchAddressInfo";

const AA_ADDRESS_RE = /^[A-Z2-7]{32}$/;

const { lastUnit, view } = storeToRefs(useGlobalStateStore());
const { rates } = storeToRefs(useRatesStore());
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const isLoaded = ref(false);
const data = ref({});
const notFound = ref(false);
const isLoadingMore = ref(false);
const nextPagesEnded = ref(false);
const nextPageError = ref(false);

const PL = ref(null);
const scrollContainer = ref(null);
const contentEl = ref(null);
const definitionCollapse = ref(null);
const aaDoc = ref(null);

let pageCursor = null;
let addressRequest = null;
let skipScrollForLine = null;

onBeforeUnmount(() => addressRequest?.abort());

const filter = computed({
  get: () => route.query.asset || "all",
  set: (asset) => {
    if (asset !== filter.value) router.push({ query: { asset } });
  },
});

const paramsForPie = computed(() => prepareDataForPieFromBalances(data.value.objBalances, rates.value));
const showStatsLink = computed(() => !data.value.testnet && data.value.arrAaResponses !== undefined);

const definition = computed(() => {
  if (!data.value.definition) return null;
  try {
    return JSON.parse(data.value.definition);
  } catch {
    return null;
  }
});
const definitionText = computed(() => (definition.value ? prettifyJson(definition.value) : ""));

const xpath = computed(() => (typeof route.query.xpath === "string" ? route.query.xpath : ""));
const requestedLine = computed(() => {
  const n = typeof route.query.line === "string" ? Number(route.query.line) : 0;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
});
const errorMessage = computed(() => (typeof route.query.error === "string" ? route.query.error : null));

const baseAaAddress = computed(() => {
  if (!isLoaded.value || notFound.value || !xpath.value || !data.value.baseAaDefinition) return null;
  const base = definition.value?.[1]?.base_aa;
  return typeof base === "string" && AA_ADDRESS_RE.test(base) && base !== route.params.address ? base : null;
});

const highlightLine = computed(() => {
  if (!isLoaded.value || notFound.value || !definitionText.value || baseAaAddress.value) return null;
  return xpath.value
    ? findCodeBlockLine(definition.value, xpath.value, requestedLine.value)
    : requestedLine.value;
});

function handleLineClick(lineNum) {
  skipScrollForLine = lineNum;
  const { error, xpath, ...query } = route.query;
  router.replace({ query: { ...query, line: String(lineNum) } });
}

onMounted(() => {
  watch(
    [baseAaAddress, highlightLine, definitionCollapse, errorMessage, () => route.fullPath],
    async ([baseAddress, line, collapse, error], _, onCleanup) => {
      if (baseAddress) {
        const query = { xpath: xpath.value };
        if (requestedLine.value) query.line = String(requestedLine.value);
        if (error) query.error = error;
        router.replace({ path: `/address/${baseAddress}`, query });
        return;
      }
      if (!line || !collapse) return;
      if (skipScrollForLine === line && !xpath.value && !error) {
        skipScrollForLine = null;
        return;
      }
      skipScrollForLine = null;

      let active = true;
      onCleanup(() => { active = false; });
      collapse.setOpen(true);
      await nextTick();
      const container = scrollContainer.value;
      const row = container?.querySelector(`.code-row[data-line="${line}"]`);
      if (!active || !row) return;
      const target = row.getBoundingClientRect().top - container.getBoundingClientRect().top
        + container.scrollTop - (container.clientHeight - row.offsetHeight) / 2;
      container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    },
    { immediate: true, flush: "post" }
  );
});

const aaDescription = computed(() => aaDoc.value?.aaDescription || "");
const seoTitle = computed(() => {
  const suffix = aaDescription.value ? ` ${aaDescription.value}` : "";
  return (route.params.address ? `Address ${route.params.address}${suffix}, transactions and portfolio | ` : "") + desc;
});
const seoDescription = computed(() => aaDescription.value || desc);

useSeoMeta({
  title: () => seoTitle.value,
  ogTitle: () => seoTitle.value,
  twitterTitle: () => seoTitle.value,
  description: () => seoDescription.value,
  ogDescription: () => seoDescription.value,
  twitterDescription: () => seoDescription.value,
});

async function loadAddress(initial = false) {
  addressRequest?.abort();
  const address = route.params.address;
  if (!address) return;

  const controller = new AbortController();
  addressRequest = controller;
  const params = { asset: route.query.asset || undefined };

  isLoaded.value = false;
  isLoadingMore.value = false;
  nextPageError.value = false;

  const fetcher = () => fetchAddressInfo(address, params, { signal: controller.signal });
  let result;
  try {
    if (initial) {
      const { data: asyncResult } = await useAsyncData(`address:${address}:${params.asset || "null"}`, fetcher);
      result = asyncResult.value;
    } else {
      result = await fetcher();
    }
  } catch (err) {
    if (!controller.signal.aborted) console.error(err);
  }

  if (controller.signal.aborted) return;

  if (!result || result.notFound) {
    notFound.value = true;
    nextPagesEnded.value = true;
    isLoaded.value = true;
    return;
  }

  data.value = result;
  pageCursor = {
    lastInputsROWID: result.newLastInputsROWID,
    lastOutputsROWID: result.newLastOutputsROWID,
  };
  notFound.value = false;
  nextPagesEnded.value = Boolean(result.end);
  isLoaded.value = true;
}

async function getNextPage() {
  const list = PL.value;
  if (!list || !isLoaded.value || isLoadingMore.value || nextPagesEnded.value) return;

  const { signal } = addressRequest;
  const params = { ...pageCursor, asset: route.query.asset || undefined };

  nextPageError.value = false;
  isLoadingMore.value = true;
  try {
    const result = await fetchAddressInfo(route.params.address, params, { nextPage: true, signal });
    if (signal.aborted || PL.value !== list) return;
    if (!result || result.error) throw new Error("Invalid address transaction page");
    if (result.notFound) {
      nextPagesEnded.value = true;
      return;
    }

    list.addNewTransactions(result.unitAssets, result.objTransactions);
    const nextCursor = {
      lastInputsROWID: result.newLastInputsROWID,
      lastOutputsROWID: result.newLastOutputsROWID,
    };
    nextPagesEnded.value = Boolean(result.end) || (
      nextCursor.lastInputsROWID === pageCursor.lastInputsROWID &&
      nextCursor.lastOutputsROWID === pageCursor.lastOutputsROWID
    );
    pageCursor = nextCursor;
  } catch (err) {
    if (!signal.aborted && PL.value === list) {
      console.error(err);
      nextPageError.value = true;
    }
  } finally {
    await nextTick();
    if (!signal.aborted && PL.value === list) {
      isLoadingMore.value = false;
    }
  }
}

await loadAddress(true);

watch([() => route.params.address, () => route.query.asset], () => loadAddress());

const { height: containerHeight } = useElementSize(scrollContainer);
const { height: contentHeight } = useElementSize(contentEl);
const { y: scrollY } = useScroll(scrollContainer);

watch(
  [containerHeight, contentHeight, scrollY, PL, isLoadingMore],
  () => {
    if (nextPageError.value || isLoadingMore.value) return;
    const container = scrollContainer.value;
    if (container && container.scrollHeight - container.clientHeight - container.scrollTop <= 100) {
      getNextPage();
    }
  },
  { flush: "post" }
);

function back() {
  return router.push({ path: lastUnit.value ? `/${prepareLink(lastUnit.value)}` : "/" });
}
</script>

<template>
  <div class="w-full bg-white absolute h-full p-1 sm:p-4 pt-4 overflow-auto" style="z-index: 1100" ref="scrollContainer">    
    <div class="max-w-6xl mx-auto w-full text-sm md:text-base" ref="contentEl">
      <div class="text-right pr-4">
        <a @click="back" class="link link-hover text-blue-500">{{ t("closeButton") }}</a>
      </div>
      <div v-if="!isLoaded" class="text-center">
        <Spinner class="w-20 h-20 inline-block" />
      </div>
      <div v-else-if="notFound" class="mt-14 text-center">
        No transactions were found for this address
      </div>
      <div v-else>
        <div class="mt-10 font-bold flex items-center flex-wrap">
          <span>{{ data.address }}</span> <Clipboard class="h-5 ml-2" :text="data.address" />
        </div>
        <div v-if="data.definitionUnit" class="font-normal text-sm">
          <Link :type="'unit'" :link="data.definitionUnit">defined</Link>
          <span v-if="data.definitionTimestamp" data-allow-mismatch>
            on {{ getDateOnlyFromSeconds(data.definitionTimestamp) }}
          </span>
        </div>
        <div v-else class="font-normal text-sm">
          <a
            :href="'https://obyte.io/@' + data.address + '/attestations'"
            target="_blank"
            rel="noopener"
            class="link link-hover text-blue-500"
            >View attestations
          </a>
        </div>
        <div v-if="showStatsLink" class="font-normal text-sm">
          <a
            :href="'https://aa-stats.obyte.org/address/' + data.address"
            target="_blank"
            class="link link-hover text-blue-500"
            >View Autonomous Agent stats (TVL, turnover)
          </a>
        </div>
        <AADescription
          v-if="definition || data.baseAaDefinition"
          ref="aaDoc"
          :address="data.address"
          :definition="definition"
          :base-aa-definition="data.baseAaDefinition"
        />
        <div class="block lg:flex">
          <div class="flex-auto">
            <Collapse
              ref="definitionCollapse"
              class="pt-1.5"
              v-if="definitionText"
              :title="t('labelDefinition')"
              :closed="true"
            >
              <Payload>
                <OscriptHighlighter 
                  :text="definitionText"
                  :highlight-line="highlightLine"
                  :error-message="errorMessage"
                  @line-click="handleLineClick"
                />
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
            <Collapse
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
            </Collapse>
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
        <div v-if="nextPageError" class="flex justify-center pb-6 pt-4">
          <button type="button" class="link link-hover text-blue-500 py-2" @click="getNextPage">
            {{ t("retryTransactions") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
