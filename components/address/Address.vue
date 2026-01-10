<script setup>
import { prettifyJson } from "~/helpers/text";
import { getAssetName } from "~/helpers/asset";
import { prepareParamsForAddress } from "~/helpers/address";
import { prepareDataForPieFromBalances } from "~/helpers/balances";
import { findCodeBlockLine } from "~/helpers/definition";
import { useInfiniteScroll } from "~/composables/useInfiniteScroll";

import { useHead } from "@vueuse/head";
import { desc } from "~/configs/meta";

import Collapse from "~/components/elements/Collapse.vue";
import Payload from "~/components/elements/Payload.vue";
import OscriptHighlighter from "~/components/elements/OscriptHighlighter.vue";
import Link from "~/components/elements/Link.vue";
import BalancesChart from "~/components/elements/BalancesChart.vue";
import Clipboard from "~/components/elements/Clipboard.vue";
import { useAaDescription } from "~/composables/useAaDescription";
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
const scrollContainer = ref(null);
const contentEl = ref(null);
const paramsForPie = ref([]);
const showStatsLink = ref(false);
const definitionCollapse = ref(null);
const highlightLine = ref(null);
const errorMessage = ref(null);

const {
  aaDescription,
  aaHomepageUrl,
  aaSourceUrl,
  fetchAaDescription,
} = useAaDescription(
  computed(() => data.value?.definition),
  computed(() => data.value?.baseAaDefinition)
);

const seoTitle = computed(() => {
  return (
    (route.params.address ? 
    `Address ${route.params.address} ${aaDescription.value || ""}  | transactions and portfolio | ` : '') + 
    desc
  );
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

const { shouldLoadMore } = useInfiniteScroll(scrollContainer, contentEl);


function updatePieData() {
  if (data.value?.objBalances) {
    paramsForPie.value = prepareDataForPieFromBalances(data.value.objBalances, rates.value);
  }
}

async function addressInfoHandler(result) {
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
  await fetchAaDescription();
  updatePieData();
  lastRowids.value = {
    lastInputsROWID: result.newLastInputsROWID,
    lastOutputsROWID: result.newLastOutputsROWID,
  };
  notFound.value = false;
  isLoaded.value = true;

  nextTick(() => {
    handleDefinitionHighlight(result.definition, result.baseAaDefinition);
  });
}

function handleDefinitionHighlight(definition, baseAaDefinition) {
  const xpath = route.query.xpath;
  const line = route.query.line ? parseInt(route.query.line, 10) : null;
  const error = route.query.error;
  
  if (!xpath && !line) {
    highlightLine.value = null;
    errorMessage.value = null;
    return;
  }

  if (baseAaDefinition && xpath) {
    const baseAaAddress = getBaseAaAddress(definition);
    if (baseAaAddress) {
      const query = { xpath };
      if (line) query.line = line;
      if (error) query.error = error;
      router.replace({
        path: `/address/${baseAaAddress}`,
        query
      });
      return;
    }
  }

  if (!definition) {
    highlightLine.value = null;
    errorMessage.value = null;
    return;
  }

  let calculatedLine;
  if (xpath) {
    calculatedLine = findCodeBlockLine(definition, xpath, line);
  } else {
    calculatedLine = line;
  }
  
  highlightLine.value = calculatedLine;
  errorMessage.value = error || null;

  if (calculatedLine !== null) {
    openDefinitionAndScroll();
  }
}

function getBaseAaAddress(definition) {
  if (!definition) return null;
  try {
    const parsed = JSON.parse(definition);
    if (Array.isArray(parsed) && parsed[1]?.base_aa) {
      return parsed[1].base_aa;
    }
  } catch {
    return null;
  }
  return null;
}

function openDefinitionAndScroll() {
  const tryOpen = () => {
    if (definitionCollapse.value) {
      definitionCollapse.value.setOpen(true);
      setTimeout(() => {
        scrollToHighlightedLine();
      }, 1500);
    } else {
      setTimeout(tryOpen, 50);
    }
  };
  tryOpen();
}

function scrollToHighlightedLine() {
  const maxAttempts = 60;
  const attemptDelay = 100;

  const waitForHighlighted = async () => {
    for (let i = 0; i < maxAttempts; i++) {
      await nextTick();
      const el = document.querySelector('.code-row.highlighted');
      if (el) return el;
      await new Promise((resolve) => setTimeout(resolve, attemptDelay));
    }
    return null;
  };

  const scrollToEl = (el, container) => {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const target = elRect.top - containerRect.top + container.scrollTop - (container.clientHeight / 2) + (el.offsetHeight / 2);
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  };

  const scroll = async () => {
    const highlightedEl = await waitForHighlighted();
    if (!highlightedEl) return;

    const container = scrollContainer.value;
    if (!container) return;

    scrollToEl(highlightedEl, container);
  };

  if (document.hidden) {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setTimeout(scroll, 100);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  } else {
    scroll();
  }
}

function handleLineClick(lineNum, event) {
  const newQuery = { ...route.query };
  
  if (newQuery.error) {
    delete newQuery.error;
  }
  
  if (newQuery.xpath) {
    delete newQuery.xpath;
  }
  
  newQuery.line = String(lineNum);
  
  router.replace({ query: newQuery });
  
  highlightLine.value = lineNum;
  errorMessage.value = null;
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
  
  await addressInfoHandler(result.value);
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

watch(
  () => shouldLoadMore(isLoaded.value, isNewPageLoaded.value, notFound.value),
  (shouldLoad) => {
    if (shouldLoad && !nextPagesEnded.value) {
      getNextPage();
    }
  }
);

watch(filter, () => {
  if (filter.value !== route.query.asset) {
    router.push({ query: { asset: filter.value } });
  }
});

watch(rates, updatePieData);

watch(
  () => route.query.line,
  (newLine) => {
    if (newLine !== undefined && data.value?.definition) {
      const lineNum = parseInt(newLine, 10);
      if (!isNaN(lineNum) && lineNum !== highlightLine.value) {
        highlightLine.value = lineNum;
        if (!route.query.error) {
          errorMessage.value = null;
        }
      }
    }
  }
);

function back() {
  if (lastUnit.value) {
    return router.push({ path: "/" + lastUnit.value });
  }

  return router.push({ path: "/" });
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
      <div v-if="notFound" class="mt-14 text-center">
        No transactions were found for this address
      </div>
      <div v-else-if="isLoaded">
        <div class="mt-10 font-bold flex items-center flex-wrap">
          <span>{{ data.address }}</span> <Clipboard class="h-5 ml-2" :text="data.address" />
          
        </div>
        <div v-if="showStatsLink" class="font-normal text-sm">
          <a
            :href="'https://aa-stats.obyte.org/address/' + data.address"
            target="_blank"
            class="link link-hover text-blue-500"
            >View Autonomous Agent stats (TVL, turnover)
          </a>
        </div>
        <div v-if="aaDescription" class="mt-1">
          {{ aaDescription }}
        </div>
        <div v-if="aaHomepageUrl || aaSourceUrl" class="mt-1 text-sm space-x-2">
          <a
            v-if="aaHomepageUrl"
            class="link link-hover text-blue-500"
            :href="aaHomepageUrl"
            target="_blank"
            rel="noopener noreferrer"
            >Home page</a
          >
          <a
            v-if="aaSourceUrl"
            class="link link-hover text-blue-500"
            :href="aaSourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            >Source</a
          >
        </div>
        <div class="block lg:flex">
          <div class="flex-auto">
            <Collapse
              ref="definitionCollapse"
              class="pt-1.5"
              v-if="data.definition"
              :title="t('labelDefinition')"
              :closed="true"
            >
              <Payload>
                <OscriptHighlighter 
                  :text="prettifyJson(JSON.parse(data.definition))" 
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
