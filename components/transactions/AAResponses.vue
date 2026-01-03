<script setup>
import Link from "~/components/elements/Link.vue";
import Payload from "~/components/elements/Payload.vue";
import AAErrorDisplay from "~/components/transactions/AAErrorDisplay.vue";

import { getDateFromSeconds } from "~/helpers/date";
import { prettifyJson, parseJSONForResponse } from "~/helpers/text";
import { useAAError } from "~/composables/useAAError";

const { ERROR_TYPES, parseAAResponse } = useAAError();

function hasAAError(response) {
  const parsed = parseAAResponse(response.response);
  return parsed.hasError && parsed.errorType !== ERROR_TYPES.UNKNOWN;
}

defineProps(["arrAaResponses"]);

const { t } = useI18n();
</script>

<template>
  <div v-for="response in arrAaResponses" :key="response.mci" style="max-width: 750px">
    <div class="block sm:flex bg-gray-100 p-1 sm:p-2">
      <div class="flex-1 sm:font-bold">
        <div v-if="response.trigger_unit">
          {{ t("triggerUnitID") }}:
          <div class="grid sm:inline">
            <Link :type="'unit'" :link="response.trigger_unit" class="truncate max-w-95">{{
              response.trigger_unit
            }}</Link>
          </div>
        </div>
        <div v-else>{{ t("from") }} {{ response.aa_address }}</div>
      </div>
      <div v-if="response.timestamp" class="mt-2 sm:mt-0" data-allow-mismatch>
        {{ getDateFromSeconds(response.timestamp) }}
      </div>
    </div>
    <div>
      <ul class="list-disc list-outside ml-5 sm:ml-10 mt-2 mb-6">
        <li>
          <div v-if="response.trigger_address">
            {{ t("triggerAddress") }}:
            <Link
              :type="'address'"
              :link="response.trigger_address"
              class="block sm:inline-block"
              >{{ response.trigger_address }}</Link
            >
          </div>
          <div v-else>
            {{ t("aaAdress") }}:
            <Link :type="'address'" :link="response.aa_address">{{ response.aa_address }}</Link>
          </div>
        </li>
        <li v-if="response.mci">MCI: {{ response.mci }}</li>
        <li>{{ response.bounced ? t("bounced") : t("notBounced") }}</li>
        <li v-if="response.response_unit">
          {{ t("responseUnit") }}:
          <div class="grid sm:inline">
            <Link :type="'unit'" :link="response.response_unit" class="truncate max-w-95">{{
              response.response_unit
            }}</Link>
          </div>
        </li>
        <li>
          {{ t("response") }}:
          <AAErrorDisplay
            v-if="hasAAError(response)"
            :response="response.response"
            :aa-address="response.aa_address"
            class="mt-2"
          />
          <Payload v-else>{{ prettifyJson(parseJSONForResponse(response.response)) }}</Payload>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
