<script setup>
import Link from "../elements/Link.vue";
import { parseHttpUrl } from "~/helpers/httpUrl";

const props = defineProps(["assetUnit", "name", "url", "urlName"]);
const externalUrl = computed(() => parseHttpUrl(props.url)?.href);

const { t } = useI18n();
</script>

<template>
  <div v-if="assetUnit === 'bytes'"><span class="font-bold">Bytes</span> - native asset</div>
  <div v-else-if="name">
    <span class="font-bold">{{ name }}</span>
    <span v-if="externalUrl">
      - view on
      <a :href="externalUrl" target="_blank" rel="noopener noreferrer" class="link link-hover text-blue-500">{{ urlName }}</a> and
      <Link :type="'unit'" :link="assetUnit">{{ t("labelDefinition").toLowerCase() }}</Link>
    </span>
    <span v-else>
      - view
      <Link :type="'unit'" :link="assetUnit">{{ t("labelDefinition").toLowerCase() }}</Link></span
    >
  </div>
  <div v-else>
    <span class="font-bold">{{ assetUnit }}</span> - view
    <Link :type="'unit'" :link="assetUnit">{{ t("labelDefinition").toLowerCase() }}</Link>
  </div>
</template>

<style scoped></style>
