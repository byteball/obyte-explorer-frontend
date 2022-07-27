<script setup>
import { ArrowRightIcon } from "@heroicons/vue/solid";
import { getDateFromSeconds } from "../../helpers/date";

import UTXOListByAsset from "./UTXOListByAsset.vue";
import Link from "../elements/Link.vue";

defineProps(["transactions", "address"]);
</script>
<template>
  <div
    v-for="(transactionList, unit) in transactions.transactionList"
    :key="transactions.rowid + '_' + unit"
  >
    <div class="flex bg-gray-100 p-2 mt-3">
      <div class="flex-1 font-bold">
        Unit ID:
        <Link :type="'unit'" :link="unit">{{ unit }}</Link>
      </div>
      <div>{{ getDateFromSeconds(transactions.timestamp) }}</div>
    </div>
    <template v-for="transaction in transactionList" :key="transaction.rowid + '_' + unit">
      <div class="flex items-center flex-row p-2">
        <div class="basis-6/12">
          <div
            v-for="from in transaction.from"
            :key="transaction.unit + '_' + from.address + '_' + transactions.timestamp"
          >
            <UTXOListByAsset :address="address" :obj="from" />
          </div>
        </div>
        <div class="basis-1/12">
          <ArrowRightIcon v-show="!transaction.spent" class="w-8 text-green-500" />
          <ArrowRightIcon v-show="transaction.spent" class="w-8 text-red-500" />
        </div>
        <div class="basis-5/12">
          <div
            v-for="to in transaction.to"
            :key="transaction.unit + '_' + to.address + '_' + transactions.timestamp"
          >
            <UTXOListByAsset :address="address" :obj="to" :isTo="true" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
