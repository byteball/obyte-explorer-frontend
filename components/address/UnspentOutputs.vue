<script setup>
import { getAssetName } from "~/helpers/asset.js";

import Collapse from "~/components/elements/Collapse.vue";
import Link from "~/components/elements/Link.vue";
import FormatAmount from "~/components/FormatAmount.vue";

defineProps({
  unspent: {
    type: Array,
    default: () => []
  }
});

const { t } = useI18n();
</script>

<template>
  <Collapse :title="t('unspent')" :closed="true">
    <div class="grid gap-1" v-memo="[unspent]">
      <div v-for="u in unspent" :key="u.output_id">
        <Link :type="'unit'" :link="u.unit">{{ u.unit }}</Link>
        &nbsp;(<FormatAmount :amount="u.amount" :decimals="u.assetDecimals" :is-asset="true" />
        <Link :type="'asset'" :link="getAssetName(u.asset, u.assetName)">
          {{ getAssetName(u.asset, u.assetName) }} </Link
        >)
      </div>
    </div>
  </Collapse>
</template>
