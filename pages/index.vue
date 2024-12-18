<script setup>
import ContentForLegend from "~/components/elements/ContentForLegend.vue";
import UnitInfo from "~/components/unit/UnitInfo.vue";
import UnitMain from "~/components/unit/UnitMain.vue";

import { desc } from "~/configs/meta.js";

definePageMeta({
  path: "/",
  name: "home",
  keepalive: true,
  key: 'home',
})


const title = desc;
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
  <ContentForLegend />
  <ClientOnly>
    <UnitMain />
  </ClientOnly>
  <UnitInfo/>
</template>
