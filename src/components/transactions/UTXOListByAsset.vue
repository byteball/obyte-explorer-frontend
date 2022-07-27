<script setup>
import Link from "../elements/Link.vue";
import FormatAmount from "../FormatAmount.vue";

defineProps(["obj", "address", "isTo"]);
</script>

<template>
  <div class="mt-2.5">
    <div v-if="obj.address === address" class="text-gray-500">
      {{ obj.address }}
    </div>
    <div v-else>
      <Link :type="'address'" :link="obj.address">{{ obj.address }}</Link>
    </div>
  </div>
  <div>
    <template v-if="obj.issue">
      <div>
        Issue
        <FormatAmount
          :amount="obj.amount"
          :decimals="obj.decimals"
          :is-asset="true"
          :rates="false"
        />
        <Link :type="'asset'" :link="obj.assetName">{{ obj.assetName }}</Link>
      </div>
      <div>Serial number: {{ obj.issue.serial_number }}</div>
    </template>
    <template v-else-if="obj.commission">
      <span
        >{{ obj.commission.commissionName }} commissions from mci {{ obj.commission.from_mci }} to
        mci {{ obj.commission.to_mci }}.</span
      >
      <div>
        Sum:
        <FormatAmount :amount="obj.commission.sum" :decimals="0" :is-asset="true" :rates="false" />
        <Link :type="'asset'" link="bytes">bytes</Link>
      </div>
    </template>
    <template v-else>
      <span>(</span>
      <FormatAmount :amount="obj.amount" :decimals="obj.decimals" :is-asset="true" :rates="false" />
      <Link :type="'asset'" :link="obj.assetName"> {{ obj.assetName }} </Link>
      <template v-if="isTo">
        <span v-if="obj.spent">
          , spent in <Link :type="'unit'" :link="obj.spent">{{ obj.spent }}</Link>
        </span>
        <span v-else>, not spent</span>
      </template>
      <span>)</span>
    </template>
  </div>
</template>

<style scoped></style>
