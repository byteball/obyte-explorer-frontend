<script setup>
import {
  checkNonEmptyBalances,
  clearChange,
  clearEmptyBalances,
} from "~/helpers/prepareDataForTransfers";

import Link from "~/components/elements/Link.vue";
import FormatAmount from "~/components/FormatAmount.vue";
import Collapse from "~/components/elements/Collapse.vue";

import { useRatesStore } from "~/stores/rates";

const props = defineProps(["message", "existsOtherMessages"]);

const { rates } = storeToRefs(useRatesStore());
const payments = ref([]);

function addToTempPayments(tempPayments, to, message, decimals) {
  clearEmptyBalances(to);
  if (!Object.keys(to).length) return;

  tempPayments.push({
    to: to,
    asset: message.asset,
    assetName: message.assetName,
    decimals,
    payload_hash: message.payload_hash,
  });
}

function processMessagesToPayments() {
  const tempPayments = [];
  payments.value = [];

  props.message.forEach((message) => {
    const tempIO = { from: {}, to: {} };

    let decimals = message.assetDecimals || 0;
    if (message.assetName === "bytes") {
      decimals = 9;
    }

    message.inputs.forEach((input) => {
      if (input.output_index === undefined) return;

      if (!tempIO.from[input.to_obj.address]) {
        tempIO.from[input.to_obj.address] = 0;
      }
      tempIO.from[input.to_obj.address] += input.to_obj.amount;
    });

    message.outputsUnitByAsset.forEach((output) => {
      if (!tempIO.to[output.address]) {
        tempIO.to[output.address] = 0;
      }
      tempIO.to[output.address] += output.amount;
    });
    clearChange(tempIO.from, tempIO.to);

    if (Object.keys(tempIO.from).length === 0) {
      addToTempPayments(tempPayments, tempIO.to, message, decimals);
      return;
    }

    const toAddresses = Object.keys(tempIO.to);
    if (toAddresses.length === 1 && tempIO.to[toAddresses[0]] === 0) {
      if (checkNonEmptyBalances(tempIO.from)) {
        clearEmptyBalances(tempIO.from);
      }

      for (let k in tempIO.from) {
        tempIO.to[toAddresses[0]] += tempIO.from[k];
      }

      addToTempPayments(tempPayments, tempIO.to, message, decimals);
      return;
    }

    addToTempPayments(tempPayments, tempIO.to, message, decimals);
  });

  payments.value = tempPayments;
}

processMessagesToPayments();

watch(props.message, processMessagesToPayments);
</script>

<template>
  <div v-if="payments.length">
    <Collapse title="Payments" :is-sub-collapse="true">
      <div v-for="paymentsMeta in payments" :key="paymentsMeta.payload_hash">
        <div
          v-for="(amount, address) in paymentsMeta.to"
          :key="address + '_' + paymentsMeta.payload_hash"
        >
          <div>
            <Link :type="'address'" :link="address">{{ address }}</Link>
          </div>
          <div class="flex">
            <FormatAmount
              :amount="amount"
              :is-asset="paymentsMeta.asset !== 'null'"
              :rates="rates"
              :decimals="paymentsMeta.decimals"
            />
            <span v-if="paymentsMeta.asset !== 'null'">
              <Link :type="'asset'" :link="paymentsMeta.assetName">{{
                paymentsMeta.assetName
              }}</Link>
            </span>
          </div>
        </div>
      </div>
    </Collapse>
  </div>
  <div v-if="!payments.length && !existsOtherMessages">none</div>
</template>

<style scoped></style>
