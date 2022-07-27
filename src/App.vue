<script setup>
import { RouterView, useRouter } from "vue-router";
import { onBeforeMount } from "vue";
import Navbar from "./components/elements/Navbar.vue";

import { parseQueryParamsStrToObj } from "./helpers/text";

const router = useRouter();

function checkHashAndRedirect() {
  if (location.hash && location.hash !== "#") {
    const hash = location.hash;
    const hashSplit = hash.split("?");
    const value = hashSplit[0].replace(/%20/g, " ").substring(1);

    if (value.startsWith("/asset")) {
      router.push(`/asset/${value.substring(7)}`);
      return;
    }

    if (value.length !== 44 && value.length !== 32) {
      return;
    }

    if (value.length === 44) {
      router.push(`/${value}`);
      return;
    }

    if (value.length === 32) {
      const params = { path: `/address/${value}`, meta: { qq: "aaa" } };
      if (hashSplit[1]) {
        const queryParams = parseQueryParamsStrToObj(hashSplit[1]);
        if (queryParams.asset) {
          params.query = {};
          params.query.asset = queryParams.asset;
        }
      }

      router.push(params);
      return;
    }

    return 0;
  }
}

onBeforeMount(() => {
  checkHashAndRedirect();
});
</script>

<template>
  <div class="pt-16">
    <Navbar />
    <RouterView />
  </div>
</template>
