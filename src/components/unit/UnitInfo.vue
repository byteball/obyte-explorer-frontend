<script setup>
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { getDateFromSeconds, getDurationFromSeconds } from "../../helpers/date";
import { prettifyJson } from "../../helpers/text";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";

import Collapse from "../elements/Collapse.vue";
import ListLinks from "../elements/ListLinks.vue";
import FormatAmount from "../FormatAmount.vue";
import Link from "../elements/Link.vue";
import Clipboard from "../elements/Clipboard.vue";
import AAResponses from "../transactions/AAResponses.vue";
import TIElement from "./TIElement.vue";
import Messages from "./Messages.vue";

import { useInfoStore } from "../../stores/info";
import { useRatesStore } from "../../stores/rates";

const { info, isReady } = storeToRefs(useInfoStore());
const { rates } = storeToRefs(useRatesStore());

const { t } = useI18n();

const isHidden = ref(false);
const title = ref("Obyte Explorer");
useHead({ title });

watch(info, () => {
  isHidden.value = false;
});

watch(isReady, () => {
  let t = "Obyte Explorer";
  if (isReady.value) {
    t += ` - ${info.value.unit}`;
  }
  title.value = t;
});

onMounted(() => {
  if (isReady.value) {
    title.value = `Obyte Explorer - ${info.value.unit}`;
  }
});

function hide() {
  isHidden.value = true;
}
</script>

<template>
  <div
    class="p-2 w-full xl:w-[34%] xl:block top-32 sm:top-24 lg:top-16 overscroll-x-none"
    id="info"
    :class="{ hidden: isHidden || !info.unit }"
  >
    <div v-if="!isReady" class="text-center">{{ t("selectUnit") }}</div>
    <div v-if="isReady">
      <div v-if="info.deleted" class="text-center font-bold">
        {{ t("infoMessageUnitNotFound") }}
      </div>
      <div v-if="info.unit" :key="info.unit" class="grid gap-y-3 text-sm md:text-base">
        <div class="text-right py-2 px-4 xl:hidden">
          <a class="link link-hover text-blue-500" @click="hide">{{ t("closeButton") }}</a>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ t("unitID") }}</div>
          <div class="flex items-center">
            {{ info.unit }}
            <Clipboard class="h-5 ml-1" :text="info.unit" />
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ t("received") }}</div>
          <div>{{ getDateFromSeconds(info.timestamp) }}</div>
        </div>
        <div v-if="info.full_node_confirmation_delay">
          <div class="text-sm text-gray-600">{{ t("confDelayFull") }}</div>
          <div>
            {{ getDurationFromSeconds(info.full_node_confirmation_delay) }}
          </div>
        </div>
        <div v-if="info.light_node_confirmation_delay">
          <div class="text-sm text-gray-600">{{ t("confDelayLight") }}</div>
          <div>
            {{ getDurationFromSeconds(info.light_node_confirmation_delay) }}
          </div>
        </div>
        <Collapse :title="t('authors')">
          <div v-for="author in info.authors" :key="author.address">
            <Link :type="'address'" :link="author.address">{{ author.address }}</Link>
            <Collapse
              v-if="author.definition"
              :title="t('labelDefinition')"
              :is-sub-collapse="true"
              :closed="true"
              class="whitespace-pre-wrap break-words"
              >{{ prettifyJson(JSON.parse(author.definition)) }}</Collapse
            >
          </div>
        </Collapse>
        <Collapse :title="t('children')"><ListLinks :links="info.child" :type="'unit'" /></Collapse>
        <Collapse :title="t('parents')"
          ><ListLinks :links="info.parents" :type="'unit'"
        /></Collapse>
        <Collapse :title="t('messages')">
          <Messages />
        </Collapse>
        <Collapse
          class="pt-1.5"
          v-if="info.arrAaResponses"
          :title="t('aaResponses')"
          :closed="true"
        >
          <AAResponses :arr-aa-responses="info.arrAaResponses" />
        </Collapse>
        <Collapse :title="t('witnesses')" :closed="true"
          ><ListLinks :links="info.witnesses" :type="'address'"
        /></Collapse>
        <Collapse :title="t('techInfo')">
          <TIElement :title="t('labelFees')">
            <FormatAmount
              :amount="info.headers_commission + info.payload_commission"
              :rates="rates"
            />
            ({{ info.headers_commission }} {{ t("labelHeaders") }}, {{ info.payload_commission }}
            {{ t("labelPayload") }})
          </TIElement>
          <TIElement :title="t('labelLevel')">
            {{ info.level }}
          </TIElement>
          <TIElement :title="t('labelWitnessedLevel')">
            {{ info.witnessed_level }}
          </TIElement>
          <TIElement v-if="info.last_ball_unit" :title="t('labelLastBallUnit')">
            <Link :link="info.last_ball_unit" class="block sm:inline-block" :type="'unit'">{{
              info.last_ball_unit
            }}</Link>
          </TIElement>
          <TIElement :title="t('labelMci')">
            {{ info.main_chain_index }}
          </TIElement>
          <TIElement :title="t('labelLatestMci')">
            {{ info.latest_included_mc_index }}
          </TIElement>
          <TIElement :title="t('labelIsStable')">
            {{ info.is_stable ? t("statusFinal") : t("statusNotStable") }}
          </TIElement>
        </Collapse>
      </div>
    </div>
  </div>
</template>

<style scoped>
#info {
  position: absolute;
  right: 0;
  bottom: 0;
  border-left: 1px solid #ccc;
  overflow: auto;
  z-index: 1500;
  background-color: #fff;
}
</style>
