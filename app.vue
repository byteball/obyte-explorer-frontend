<script setup>
import Navbar from "~/components/elements/Navbar.vue";

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
  <Head>
    <Meta charset="UTF-8" />
    <Link rel="icon" href="/favicon.ico" />
    <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/css/autoComplete.02.min.css"/>
    <Meta property="og:type" content="website"/>
    <Meta property="og:image" content="https://explorer.obyte.org/logoForOg.png"/>
    <Meta name="twitter:card" content="summary_large_image"/>
    <Meta name="twitter:image" content="https://explorer.obyte.org/logoForOg.png"/>
    <Link rel="icon" href="/icon_16x16@2x.png" />
  </Head>
  <div class="pt-32 sm:pt-24 lg:pt-16">
    <Navbar />
    <NuxtPage />
  </div>
</template>
