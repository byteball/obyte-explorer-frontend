<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { getDateFromSeconds, getDurationFromSeconds } from "../../helpers/date";
import { prettifyJson } from "../../helpers/text";

import Collapse from "../elements/Collapse.vue";
import ListLinks from "../elements/ListLinks.vue";
import FormatAmount from "../FormatAmount.vue";
import Link from "../elements/Link.vue";
import AAResponses from "../transactions/AAResponses.vue";
import TIElement from "./TIElement.vue";
import Messages from "./Messages.vue";

import { useInfoStore } from "../../stores/info";
import { useRatesStore } from "../../stores/rates";

const { info, isReady } = storeToRefs(useInfoStore());
const { rates } = storeToRefs(useRatesStore());

const isHidden = ref(false);

watch(info, () => {
  isHidden.value = false;
});

function hide() {
  isHidden.value = true;
}
</script>

<template>
  <div
    class="p-2 w-full xl:w-[34%] xl:block top-32 sm:top-24 lg:top-16"
    id="info"
    :class="{ hidden: isHidden || !info.unit }"
  >
    <div v-if="!isReady" class="text-center">Select unit on the left</div>
    <div v-if="isReady" :key="info.unit" class="grid gap-y-3 text-sm md:text-base">
      <div class="text-right py-2 px-4 xl:hidden">
        <a class="link link-hover text-blue-500" @click="hide">Close</a>
      </div>
      <div>
        <div class="text-sm text-gray-600">Unit ID</div>
        <div>{{ info.unit }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Received</div>
        <div>{{ getDateFromSeconds(info.timestamp) }}</div>
      </div>
      <div v-if="info.full_node_confirmation_delay">
        <div class="text-sm text-gray-600">Confirmation delay (full node)</div>
        <div>
          {{ getDurationFromSeconds(info.full_node_confirmation_delay) }}
        </div>
      </div>
      <div v-if="info.light_node_confirmation_delay">
        <div class="text-sm text-gray-600">Confirmation delay (light node)</div>
        <div>
          {{ getDurationFromSeconds(info.light_node_confirmation_delay) }}
        </div>
      </div>
      <Collapse title="Authors">
        <div v-for="author in info.authors" :key="author.address">
          <Link :type="'address'" :link="author.address">{{ author.address }}</Link>
          <Collapse
            v-if="author.definition"
            title="Definition"
            :is-sub-collapse="true"
            :closed="true"
            class="whitespace-pre-wrap break-words"
            >{{ prettifyJson(JSON.parse(author.definition)) }}</Collapse
          >
        </div>
      </Collapse>
      <Collapse title="Children"><ListLinks :links="info.child" :type="'unit'" /></Collapse>
      <Collapse title="Parents"><ListLinks :links="info.parents" :type="'unit'" /></Collapse>
      <Collapse title="Messages">
        <Messages />
      </Collapse>
      <Collapse class="pt-1.5" v-if="info.arrAaResponses" :title="'AA responses'" :closed="true">
        <AAResponses :arr-aa-responses="info.arrAaResponses" />
      </Collapse>
      <Collapse title="Witnesses" :closed="true"
        ><ListLinks :links="info.witnesses" :type="'address'"
      /></Collapse>
      <Collapse title="Technical information">
        <TIElement title="Fees">
          <FormatAmount
            :amount="info.headers_commission + info.payload_commission"
            :rates="rates"
          />
          ({{ info.headers_commission }} headers, {{ info.payload_commission }} payload)
        </TIElement>
        <TIElement title="Level">
          {{ info.level }}
        </TIElement>
        <TIElement title="Witnessed level">
          {{ info.witnessed_level }}
        </TIElement>
        <TIElement v-if="info.last_ball_unit" title="Last ball unit">
          <Link :link="info.last_ball_unit" :type="'unit'">{{ info.last_ball_unit }}</Link>
        </TIElement>
        <TIElement title="Main chain index">
          {{ info.main_chain_index }}
        </TIElement>
        <TIElement title="Latest included mc index">
          {{ info.latest_included_mc_index }}
        </TIElement>
        <TIElement title="Status">
          {{ info.is_stable ? "stable/confirmed/final" : "not stable" }}
        </TIElement>
      </Collapse>
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
  z-index: 99999;
  background-color: #fff;
}
</style>
