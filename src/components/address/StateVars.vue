<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { prettifyJson, parseJSONForStateVars } from "../../helpers/text";

import Payload from "../elements/Payload.vue";

const props = defineProps(["stateVars", "storageSize"]);

const MAX_DISPLAYED = 30;

const { t } = useI18n();
const filter = ref("");
const vars = ref([]);
const objStateVarsLength = ref(0);

let i = 0;
function updVars() {
  i = 0;
  const v = [];
  objStateVarsLength.value = Object.keys(props.stateVars).length;

  for (let key in props.stateVars) {
    if (i === MAX_DISPLAYED) {
      break;
    }

    const value = String(props.stateVars[key]);
    if (!filter.value || key.includes(filter.value) || value.includes(filter.value)) {
      const result = {
        key,
      };
      try {
        result.type = "json";
        result.value = prettifyJson(parseJSONForStateVars(value));
      } catch (e) {
        result.type = "text";
        result.value = value;
      }

      v.push(result);
      i++;
    }
  }

  vars.value = v;
}

watch(filter, () => {
  updVars();
});

onMounted(() => {
  updVars();
});
</script>

<template>
  <div v-if="objStateVarsLength > MAX_DISPLAYED" class="mt-2 mb-4">
    <input
      class="input input-bordered input-xs"
      type="text"
      v-model="filter"
      placeholder="Search"
    />
    <span class="text-xs ml-2">{{ t("tooManyVars") }}</span>
  </div>

  <ul class="list-disc list-outside ml-10">
    <li v-for="v in vars" :key="v.key">
      <span>{{ v.key }}: </span>
      <div v-if="v.type === 'json'">
        <Payload>{{ v.value }}</Payload>
      </div>
      <span v-else>{{ v.value }}</span>
    </li>
  </ul>
  <div class="py-4">{{ t("storageSize") }}: {{ storageSize }} bytes</div>
</template>

<style scoped></style>
