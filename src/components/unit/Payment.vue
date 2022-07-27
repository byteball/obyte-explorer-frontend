<script setup>
import Collapse from "../elements/Collapse.vue";
import Link from "../elements/Link.vue";
import FormatAmount from "../FormatAmount.vue";

defineProps([
  "title",
  "inputs",
  "rates",
  "outputsUnitByAsset",
  "asset",
  "assetName",
  "assetDecimals",
]);
</script>

<template>
  <Collapse :is-sub-collapse="true">
    <template #title>
      <div class="text-sm">
        <span>Payment (</span>
        <Link v-if="assetName !== 'bytes'" :type="'asset'" :link="assetName">{{ assetName }}</Link>
        <span v-else>bytes</span>
        <span>)</span>
      </div>
    </template>
    <div class="font-bold">Inputs</div>
    <div v-for="(input, index) in inputs" :key="index">
      <div v-if="input.type && input.type === 'issue'">
        <div>Type: Issue</div>
        <div>Serial number: {{ input.serial_number }}</div>
        <div class="flex">
          <span>Amount: </span>
          <FormatAmount
            :amount="input.amount"
            :is-asset="asset !== 'null'"
            :rates="rates"
            :decimals="assetDecimals"
          />
        </div>
      </div>
      <div v-else-if="input.output_index !== undefined && input.to_obj">
        <FormatAmount
          :amount="input.to_obj.amount"
          :is-asset="asset !== 'null'"
          :rates="rates"
          :decimals="assetDecimals"
        />
        <span class="inline-block">&nbsp;from&nbsp;</span>
        <Link :type="'unit'" :link="input.to_obj.unit">{{ input.to_obj.unit }}</Link>
      </div>
      <div
        v-else-if="
          (input.type === 'headers_commission' || input.type === 'witnessing') &&
          input.obj_commissions
        "
      >
        <FormatAmount
          :amount="input.obj_commissions.sum"
          :is-asset="asset !== 'null'"
          :rates="rates"
          :decimals="assetDecimals"
        />
        <span class="inline-block"
          >&nbsp;of {{ input.obj_commissions.obj_name }} commissions on&nbsp;</span
        >
        <Link :type="'address'" :link="input.obj_commissions.address">{{
          input.obj_commissions.address
        }}</Link>
        <span>
          from mci {{ input.obj_commissions.from_mci }} to mci
          {{ input.obj_commissions.to_mci }}
        </span>
      </div>
    </div>
    <div class="font-bold">Outputs</div>
    <div v-for="output in outputsUnitByAsset" :key="output.output_id">
      <div>
        <FormatAmount
          :amount="output.amount"
          :is-asset="asset !== 'null'"
          :rates="rates"
          :decimals="assetDecimals"
        />
        <span class="inline-block">&nbsp;to&nbsp;</span>
        <Link :type="'address'" :link="output.address">{{ output.address }}</Link>
      </div>
      <div v-if="output.is_spent">
        (spent in
        <Link :type="'unit'" :link="output.spent">{{ output.spent }}</Link
        >)
      </div>
    </div>
  </Collapse>
</template>

<style scoped></style>
