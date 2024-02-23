<script setup>
import { prepareDataForTransfers } from "~/helpers/prepareDataForTransfers";
import { prepareDataForUTXO } from "~/helpers/prepareDataForUTXO";

import Collapse from "~/components/elements/Collapse.vue";
import UTXOView from "~/components/transactions/UTXOView.vue";
import TransfersView from "~/components/transactions//TransfersView.vue";

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

addNewTransactions(props.unitAssets, props.objTransactions);

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
          <TransitionGroup name="list" tag="div">
            <div v-for="t in transactions" :key="t.rowid">
              <UTXOView :address="address" :transactions="t"/>
            </div>
          </TransitionGroup>
        </div>
        <TransfersView v-else :address="address" :list-transactions="transactions"/>
      </div>
    </div>
  </Collapse>
</template>

<style scoped></style>
