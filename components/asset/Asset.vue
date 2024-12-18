<script setup>
import { useElementSize, useWindowScroll, useWindowSize } from "@vueuse/core";
import { prepareData } from "~/helpers/asset";
import { prepareLink } from "~/helpers/prepareLink.js";
import { desc } from "~/configs/meta";

import PaymentList from "~/components/transactions/PaymentList.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import Spinner from "~/components/icons/Spinner.vue";
import NameBlock from "~/components/asset/NameBlock.vue";
import ListHolders from "~/components/asset/ListHolders.vue";

import { useGlobalStateStore } from "~/stores/globalState";
import { useRatesStore } from "~/stores/rates";
import fetchAssetInfo from "~/api/fetchAssetInfo";
import AADescription from "~/components/address/AADescription.vue";
import Link from "~/components/elements/Link.vue";

const { $socket } = useNuxtApp();

const router = useRouter();
const route = useRoute();

const { lastUnit, view } = storeToRefs(useGlobalStateStore());
const { rates } = storeToRefs(useRatesStore());

const { t } = useI18n();
const isLoaded = ref(false);
const rawData = ref({});
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

const { height: wHeigth } = useWindowSize();
const { height } = useElementSize(el);
const { y } = useWindowScroll();

const assetName = ref(route.params.asset);

const title = computed(() => {
  return `${
    !notFound.value && data.value.name ? `Token ${data.value.name} transactions and holders | ` : ""
  }${desc}`;
});
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

function assetInfoHandler(_data) {
  rawData.value = _data;
  isNewPageLoaded.value = true;
  nextPagesEnded.value = false;

  if (_data.notFound) {
    assetName.value = route.params.asset;
    notFound.value = true;
    isLoaded.value = true;
    return;
  }

  data.value = prepareData(_data, rates);

  isLoaded.value = true;
  isLoaded.value = true;
  assetName.value = _data.name;
  if (data.value.isPrivate) {
    isNewPageLoaded.value = false;
    return;
  }
  lastRowids.value = {
    lastInputsROWID: _data.transactionsData.newLastInputsROWID,
    lastOutputsROWID: _data.transactionsData.newLastOutputsROWID,
  };
}

async function urlHandler() {
  if (!route.params.asset) return;

  isLoaded.value = false;

  const result = await fetchAssetInfo($socket, route.params.asset);

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
  if (nextPagesEnded.value) return;
  isNewPageLoaded.value = false;

  const result = await fetchAssetInfo($socket, route.params.asset, {
    lastInputsROWID: lastRowids.value.lastInputsROWID,
    lastOutputsROWID: lastRowids.value.lastOutputsROWID,
  });
  nextPageHandler(result);
}

watch(y, () => {
  if (
    y.value + wHeigth.value + 100 >= height.value &&
    isLoaded.value &&
    isNewPageLoaded.value &&
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

watch(rates, () => {
  if (isLoaded.value) {    
    data.value = prepareData(rawData.value, rates);
  }
});

await urlHandler();

watch(() => route.params.asset, urlHandler);

function back() {
  if (lastUnit.value) {
    return router.push({ path: "/" + prepareLink(lastUnit.value) });
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
      <div v-if="notFound" class="mt-14 text-center">No transactions were found for this asset</div>
      <div v-else-if="isLoaded">
        <div class="mt-10">
          <NameBlock
            :asset-unit="data.assetUnit"
            :name="data.name"
            :url="data.url"
            :url-name="data.urlName"
          />
        </div>

        <div v-if="data.assetInfo" class="mt-1">
          <div v-if="data.assetInfo.assetDescription">
            {{ data.assetInfo.assetDescription }}
          </div>
          
          <div v-if="data.assetInfo.author" class="mt-4">
            Author:
            <span v-if="data.assetInfo.triggerAuthor"> 
              <Link :type="'address'" :link="data.assetInfo.triggerAuthor">{{ data.assetInfo.triggerAuthor }}</Link>
              via AA
              <Link :type="'address'" :link="data.assetInfo.author">{{ data.assetInfo.author }} </Link>
            </span>
            <span v-else>
              <Link :type="'address'" :link="data.assetInfo.author">{{ data.assetInfo.author }} </Link>
            </span>
          </div>

          <div v-if="data.assetInfo.authorDefinition" class="mt-1">
            <ClientOnly>
              <AADescription
                :definition="data.assetInfo.authorDefinition"
              />
            </ClientOnly>
          </div>
        </div>
        <div class="mt-4" v-if="data.supply">
          <div>
            Total supply:
            <FormatAmount :amount="data.supply" :is-asset="true" />{{ data.name }}
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
        <div v-if="data.isPrivate" class="text-center font-bold pt-8">
          {{ t("infoAboutPrivateAsset") }}
        </div>
        <template v-else>
          <ListHolders
            v-if="data.holders.length"
            class="mt-4"
            :holders="data.holders"
            :symbol="data.name"
            :asset="route.params.asset"
            :decimals="data.decimals"
            :end-holders="data.endHolders"
            :offset-for-holders="data.offsetForHolders"
            :type-of-holders="data.typeOfHolders"
            :supply="data.supply"
          />
          <PaymentList
              class="mt-12"
              ref="PL"
              :unit-assets="data.transactionsData.unitAssets"
              :obj-transactions="data.transactionsData.objTransactions"
              :address="null"
              :view="view"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
