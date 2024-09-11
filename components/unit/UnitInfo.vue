<script setup>
import { getDateFromSeconds, getDurationFromSeconds } from "~/helpers/date.js";
import { prettifyJson } from "~/helpers/text.js";
import { useWindowSize } from "@vueuse/core";

import Collapse from "~/components/elements/Collapse.vue";
import ListLinks from "~/components/elements/ListLinks.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import Link from "~/components/elements/Link.vue";
import Clipboard from "~/components/elements/Clipboard.vue";
import AAResponses from "~/components/transactions/AAResponses.vue";
import TIElement from "~/components/unit/TIElement.vue";
import Messages from "~/components/unit/Messages.vue";

import { useInfoStore } from "~/stores/info.js";
import { useRatesStore } from "~/stores/rates.js";

const { info, isReady } = storeToRefs(useInfoStore());
const { rates } = storeToRefs(useRatesStore());

const { t } = useI18n();
const { width } = useWindowSize();

const isHidden = ref(false);
const maxWidth = ref("auto");

watch(info, () => {
  isHidden.value = false;
});

watch(
  width,
  () => {
    maxWidth.value = width.value - 40 + "px";
  },
  {
    immediate: true,
  }
);

function hide() {
  isHidden.value = true;
}
</script>

<template>
  <div
    class="w-full xl:w-[34%] xl:block top-32 sm:top-24 lg:top-16 !border-0 sm:!border"
    id="info"
    :class="{ hidden: isHidden || !info.unit }"
  >
    <div v-if="!isReady" class="text-center">{{ t("selectUnit") }}</div>
    <div v-if="isReady" class="p-1 sm:p-2">
      <div v-if="info.deleted" class="text-center font-bold">
        {{ t("infoMessageUnitNotFound") }}
      </div>
      <div v-if="info.unit" :key="info.unit" class="grid gap-y-3 text-sm md:text-base">
        <div class="text-right py-2 px-4 xl:hidden">
          <a class="link link-hover text-blue-500" @click="hide">{{ t("closeButton") }}</a>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ t("unitID") }}</div>
          <div class="text-sm">
            <div class="flex flex-wrap">
              <div class="truncate" :style="{ maxWidth }">{{ info.unit }}</div>
              <Clipboard class="h-5 ml-1" style="padding-top: 1px" :text="info.unit" />
            </div>
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
        <Collapse :title="t('triggerUnitID')" v-if="info.trigger_unit">
          <div class="grid">
            <Link :type="'unit'" :link="info.trigger_unit" class="truncate max-w-95">{{
              info.trigger_unit
            }}</Link>
          </div>
        </Collapse>
        <Collapse :title="t('messages')" class="pt-2">
          <Messages />
        </Collapse>
        <Collapse
          class="pt-1.5"
          v-if="info.arrAaResponses"
          :title="t('aaResponses')"
          :closed="false"
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
          <TIElement v-if="info.tps_fee" :title="t('labelTpsFee')">
            <FormatAmount
              :amount="info.tps_fee"
              :rates="rates"
            />
          </TIElement>
          <TIElement v-if="info.actual_tps_fee" :title="t('labelActualTpsFee')">
            <FormatAmount
              :amount="info.actual_tps_fee"
              :rates="rates"
            />
          </TIElement>
          <TIElement v-if="info.burn_fee" :title="t('labelBurnFee')">
            <FormatAmount
              :amount="info.burn_fee"
              :rates="rates"
            />
          </TIElement>
          <TIElement v-if="info.oversize_fee" :title="t('labelOversizeFee')">
            <FormatAmount
              :amount="info.oversize_fee"
              :rates="rates"
            />
          </TIElement>
          <TIElement :title="t('labelLevel')">
            {{ info.level }}
          </TIElement>
          <TIElement :title="t('labelWitnessedLevel')">
            {{ info.witnessed_level }}
          </TIElement>
          <TIElement v-if="info.last_ball_unit" :title="t('labelLastBallUnit')">
            <div class="grid sm:inline">
              <Link :link="info.last_ball_unit" :type="'unit'" class="truncate max-w-95">{{
                info.last_ball_unit
              }}</Link>
            </div>
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
