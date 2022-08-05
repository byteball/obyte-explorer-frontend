<script setup>
import { onBeforeMount, ref, inject } from "vue";
import { useI18n } from "vue-i18n";

import Collapse from "../../components/elements/Collapse.vue";
import Link from "../../components/elements/Link.vue";
import FormatAmount from "../../components/FormatAmount.vue";
import fetchNextHolders from "../../api/fetchNextHolders";

const props = defineProps([
  "holders",
  "name",
  "asset",
  "decimals",
  "endHolders",
  "offsetForHolders",
  "typeOfHolders",
]);

const socket = inject("socket.io");

const { t } = useI18n();
const listHolders = ref([]);
const lEndHolders = ref(false);
const lOffsetForHolders = ref(0);

onBeforeMount(() => {
  lEndHolders.value = props.endHolders;
  lOffsetForHolders.value = props.offsetForHolders;
  listHolders.value = [...props.holders];
});

function moreHoldersHandler(data) {
  lEndHolders.value = data.end;
  lOffsetForHolders.value += data.holders.length;
  listHolders.value = [...listHolders.value, ...data.holders];
}

async function getMoreHolders() {
  const result = await fetchNextHolders(socket, props.asset, {
    type: props.typeOfHolders,
    offset: lOffsetForHolders.value,
  });
  moreHoldersHandler(result);
}
</script>

<template>
  <Collapse :title="t('holders')" :closed="true">
    <div class="grid gap-1" v-memo="[listHolders]">
      <ul class="list-decimal list-inside">
        <li v-for="holder in listHolders" :key="holder.address">
          <Link :type="'address'" :link="holder.address">{{ holder.address }}</Link>
          &nbsp;(<FormatAmount :amount="holder.balance" :decimals="decimals" :is-asset="true" />
          {{ name }})
        </li>
      </ul>
      <a v-if="!lEndHolders" class="link link-hover text-blue-500 mt-2" @click="getMoreHolders">
        {{ t("showMoreHolders") }}
      </a>
    </div>
  </Collapse>
</template>

<style scoped></style>
