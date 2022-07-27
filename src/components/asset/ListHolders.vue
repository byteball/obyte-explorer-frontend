<script setup>
import { onBeforeMount, ref, inject } from "vue";
import { EventNames } from "../../enum/eventEnums";

import Collapse from "../../components/elements/Collapse.vue";
import Link from "../../components/elements/Link.vue";
import FormatAmount from "../../components/FormatAmount.vue";

import { vDebugDirective } from "../../debug/debugDirective";

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

function getMoreHolders() {
  socket.emit(
    EventNames.LoadNextPageAssetHolders,
    {
      asset: props.asset,
      type: props.typeOfHolders,
      offset: lOffsetForHolders.value,
    },
    moreHoldersHandler
  );
}
</script>

<template>
  <Collapse :title="'Holders'" :closed="true">
    <div class="grid gap-1" v-debug-directive v-memo="[listHolders]">
      <ul class="list-decimal list-inside">
        <li v-for="holder in listHolders" :key="holder.address">
          <Link :type="'address'" :link="holder.address">{{ holder.address }}</Link>
          &nbsp;(<FormatAmount :amount="holder.balance" :decimals="decimals" :is-asset="true" />
          {{ name }})
        </li>
      </ul>
      <a v-if="!lEndHolders" class="link link-hover text-blue-500 mt-2" @click="getMoreHolders">
        Show more holders
      </a>
    </div>
  </Collapse>
</template>

<style scoped></style>
