<script setup>
import { prettifyJson, parseJSONForStateVars } from "~/helpers/text.js";

import Payload from "~/components/elements/Payload.vue";

const props = defineProps({
  stateVars: {
    type: Object,
    required: true
  },
  storageSize: {
    type: Number,
    default: 0
  }
});

const MAX_DISPLAYED = 30;

const { t } = useI18n();
const filter = ref("");
const vars = ref([]);
const objStateVarsLength = ref(0);

function updateVars() {
  const entries = Object.entries(props.stateVars);
  objStateVarsLength.value = entries.length;

  const filtered = entries
    .filter(([key, val]) => {
      if (!filter.value) return true;
      const value = String(val);
      return key.includes(filter.value) || value.includes(filter.value);
    })
    .slice(0, MAX_DISPLAYED)
    .map(([key, val]) => {
      const value = String(val);
      try {
        return {
          key,
          type: "json",
          value: prettifyJson(parseJSONForStateVars(value))
        };
      } catch {
        return { key, type: "text", value };
      }
    });

  vars.value = filtered;
}

watch(filter, updateVars);

onMounted(updateVars);
</script>

<template>
  <div v-if="objStateVarsLength > MAX_DISPLAYED" class="mt-2 mb-4">
    <input
      class="input input-bordered input-xs focus:outline-0"
      type="text"
      v-model="filter"
      placeholder="Search"
    />
    <span class="text-xs ml-2">{{ t("tooManyVars") }}</span>
  </div>

  <ul class="list-disc list-outside ml-5 sm:ml-10">
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
