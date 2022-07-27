<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import Collapse from "../elements/Collapse.vue";
import Link from "../elements/Link.vue";
import RawPayload from "./RawPayload.vue";
import Payment from "./Payment.vue";
import TransfersView from "../unit/TransfersView.vue";

import { useGlobalStateStore } from "../../stores/globalState";
import { useInfoStore } from "../../stores/info";
import { prettifyJson } from "../../helpers/text";
import { useRatesStore } from "../../stores/rates";

const { info } = storeToRefs(useInfoStore());
const { rates } = storeToRefs(useRatesStore());
const { view } = storeToRefs(useGlobalStateStore());

const messagesForRender = ref([]);
const transfersListForRender = ref([]);

function getTitle(app) {
  switch (app) {
    case "payment":
      return "Payment";
    case "asset":
      return "Definition of new asset";
    case "data":
      return "Data";
    case "data_feed":
      return "Data feed";
    case "profile":
      return "Profile";
    case "attestation":
      return "Attestation";
    case "poll":
      return "Poll";
    case "vote":
      return "Vote";
    case "text":
      return "Text";
    default:
      return app.substring(0, 1).toUpperCase() + app.substring(1);
  }
}

onMounted(() => {
  const msgs = [];
  let shownHiddenPayments = false;

  info.value.messages.forEach((m) => {
    if (!m.payload) {
      if (m.app === "payment" && m.payload_location === "none" && !shownHiddenPayments) {
        if (view.value === "Transfers") return;

        msgs.push({
          title: "Hidden payments",
          type: "hidden",
          asset: "",
          payload_hash: m.payload_hash,
          assetName: "",
          assetDecimals: 0,
          inputs: [],
          outputsUnitByAsset: [],
          address: "",
          rawPayload: {},
        });
        shownHiddenPayments = true;
      }
      return;
    }

    const result = {
      title: getTitle(m.app),
      type: m.app,
      asset: m.payload.asset || "null",
      payload_hash: m.payload_hash,
      assetName: m.payload.asset || "bytes",
      assetDecimals: 0,
      inputs: [],
      outputsUnitByAsset: [],
      address: "",
      rawPayload: {},
    };

    if (m.payload.assetName) {
      result.assetName = m.payload.assetName;
      result.assetDecimals = m.payload.assetDecimals || 0;
    }

    if (m.app === "payment") {
      result.inputs = m.payload.inputs.map((v) => {
        if (v.output_index !== undefined) {
          v.to_obj = info.value.transfersInfo[v.unit + "_" + v.output_index + "_" + result.asset];
        } else if (v.type === "headers_commission" || v.type === "witnessing") {
          const key = v.from_main_chain_index + "_" + v.to_main_chain_index;
          const objName =
            v.type === "headers_commission"
              ? "headers"
              : v.type === "witnessing"
              ? "witnessing"
              : false;
          if (objName) {
            v.obj_commissions = info.value.assocCommissions[objName][key];
            v.obj_commissions.obj_name = objName;
          }
        }
        return v;
      });
      result.outputsUnitByAsset = info.value.outputsUnit[result.asset];

      if (view.value === "Transfers") {
        return transfersListForRender.value.push(result);
      } else {
        return msgs.push(result);
      }
    }

    if (m.app === "text") {
      result.text = m.payload;
      return msgs.push(result);
    }

    if (m.app === "definition") {
      result.isStable = !!info.value.is_stable;
      result.address = m.payload.address;
      result.json = prettifyJson(m.payload.definition);
      return msgs.push(result);
    }

    result.rawPayload = m.payload;
    msgs.push(result);
  });

  messagesForRender.value = msgs;
});
</script>

<template>
  <div class="grid gap-y-3" :key="view + '_' + info.unit">
    <TransfersView v-if="view === 'Transfers'" :message="transfersListForRender" />
    <div v-for="message in messagesForRender" :key="message.payload_hash">
      <Payment
        v-if="message.type === 'payment'"
        :title="message.title"
        :inputs="message.inputs"
        :outputs-unit-by-asset="message.outputsUnitByAsset"
        :rates="rates"
        :asset="message.asset"
        :asset-name="message.assetName"
        :asset-decimals="message.assetDecimals"
      />
      <Collapse
        v-else-if="message.type === 'definition'"
        :title="message.title"
        :is-sub-collapse="true"
      >
        <div>
          <span class="text-gray-500">Address: </span>
          <span v-if="message.isStable">
            <Link :type="'address'" :link="message.address">{{ message.address }}</Link>
          </span>
          <span v-else>{{ message.address }}</span>
        </div>
        <div>
          <span class="text-gray-500">Definition: </span>
          <span class="whitespace-pre-wrap break-words">{{ message.json }}</span>
        </div>
      </Collapse>
      <Collapse v-else-if="message.type === 'text'" :title="message.title" :is-sub-collapse="true">
        <pre class="whitespace-pre-wrap break-words text-sm">{{ message.text }}</pre>
      </Collapse>
      <RawPayload
        v-else
        :title="message.title"
        :type="message.type"
        :raw-payload="message.rawPayload"
        :unit="info.unit"
      />
    </div>
  </div>
</template>

<style scoped></style>
