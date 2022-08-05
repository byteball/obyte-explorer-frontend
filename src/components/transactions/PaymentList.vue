<script setup>
import { onMounted, ref, watch } from "vue";
import { prepareDataForTransfers } from "../../helpers/prepareDataForTransfers";
import { prepareDataForUTXO } from "../../helpers/prepareDataForUTXO";

import Collapse from "../elements/Collapse.vue";
import UTXOView from "./UTXOView.vue";
import TransfersView from "./TransfersView.vue";
import { useI18n } from "vue-i18n";

const props = defineProps(["unitAssets", "objTransactions", "address", "view"]);

const { t } = useI18n();
const transactions = ref([]);

function prepareData(unitAssets, objTransactions) {
  if (props.view === "UTXO") {
    return prepareDataForUTXO(unitAssets, objTransactions);
  }

  return prepareDataForTransfers(unitAssets, objTransactions);
}

function addNewTransactions(unitAssets, objTransactions) {
  const data = prepareData(unitAssets, objTransactions);
  transactions.value = [...transactions.value, ...data].sort((a, b) => {
    return b.timestamp - a.timestamp || b.rowid - a.rowid;
  });
}

defineExpose({
  addNewTransactions,
});

onMounted(() => {
  addNewTransactions(props.unitAssets, props.objTransactions);
});

watch(
  () => props.view,
  () => {
    transactions.value = [];
    addNewTransactions(props.unitAssets, props.objTransactions);
  }
);
</script>

<template>
  <Collapse :title="t('transactions')" class="pt-4">
    <div class="mt-2">
      <div v-show="!transactions.length" class="text-center">
        No transactions found, it may be worth changing the filter
      </div>
      <div v-show="transactions.length">
        <div v-if="view === 'UTXO'">
          <transition-group name="list" tag="div">
            <div v-for="t in transactions" :key="t.rowid">
              <UTXOView :address="address" :transactions="t" />
            </div>
          </transition-group>
        </div>
        <TransfersView v-else :address="address" :list-transactions="transactions" />
      </div>
    </div>
  </Collapse>
</template>

<style scoped></style>
