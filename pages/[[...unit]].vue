<script setup>
import ContentForLegend from "~/components/elements/ContentForLegend.vue";
import UnitInfo from "~/components/unit/UnitInfo.vue";
import UnitMain from "~/components/unit/UnitMain.vue";

import fetchUnitInfo from "~/api/fetchUnitInfo";

import { useInfoStore } from "~/stores/info.js";

import { desc } from "~/configs/meta.js";
import { normalizeUnit } from "~/helpers/normalizeUnit.js";

const route = useRoute();

const infoStore = useInfoStore();

definePageMeta({
  path: '/:unit(.*)*',
  name: "unit",
  keepalive: true,
  key: 'unit',
})

const unitFromRoute = computed(() => normalizeUnit(route.params.unit));

const title = (unitFromRoute.value ? `Unit ${unitFromRoute.value} details on Obyte DAG chain | ` : '') + desc;
useHead({
  title: title,
  meta: [
    { name: "description", content: title },
    { name: "og:title", content: title },
    { name: "og:description", content: title },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: title },
  ],
})


if (unitFromRoute.value) {
  infoStore.setLoading(true);
  const { data: result } = await useAsyncData(`unit`, () => fetchUnitInfo(unitFromRoute.value));

  infoStore.setInfo(result.value);
  infoStore.setReady(true);
  infoStore.setLoading(false);
}

onMounted(() => {
  document.body.classList.add("overscroll-none", "overflow-hidden");
});

onUnmounted(() => {
  document.body.classList.remove("overscroll-none", "overflow-hidden");
});
</script>

<template>
  <div id="cy" class="right-0 xl:right-[34%] overscroll-none"></div>
  <div id="scroll" class="right-0 xl:right-[34%] overscroll-none">
    <div id="scrollBody">&nbsp;</div>
  </div>
  <ContentForLegend/>
  <ClientOnly>
    <UnitMain/>
  </ClientOnly>
  <UnitInfo/>
</template>
