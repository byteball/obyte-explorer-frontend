<script setup>
import Link from "../elements/Link.vue";
import Payload from "../elements/Payload.vue";

import { getDateFromSeconds } from "../../helpers/date";
import { prettifyJson, safeJSONParse } from "../../helpers/text";

defineProps(["arrAaResponses"]);
</script>

<template>
  <div v-for="response in arrAaResponses" :key="response.mci">
    <div class="flex bg-gray-100 p-2">
      <div class="flex-1 font-bold">
        <div v-if="response.trigger_unit">
          Trigger unit:
          <Link :type="'unit'" :link="response.trigger_unit">{{ response.trigger_unit }}</Link>
        </div>
        <div v-else>From {{ response.aa_address }}</div>
      </div>
      <div v-if="response.timestamp">{{ getDateFromSeconds(response.timestamp) }}</div>
    </div>
    <div>
      <ul class="list-disc list-outside ml-10 mt-2 mb-6">
        <li>
          <div v-if="response.trigger_address">
            Trigger address:
            <Link :type="'address'" :link="response.trigger_address">{{
              response.trigger_address
            }}</Link>
          </div>
          <div v-else>
            AA address:
            <Link :type="'address'" :link="response.aa_address">{{ response.aa_address }}</Link>
          </div>
        </li>
        <li v-if="response.mci">MCI: {{ response.mci }}</li>
        <li>{{ response.bounced ? "Bounced" : "Not bounced" }}</li>
        <li v-if="response.response_unit">
          Response unit:
          <Link :type="'unit'" :link="response.response_unit">{{ response.response_unit }}</Link>
        </li>
        <li>
          Response:
          <Payload>{{ prettifyJson(safeJSONParse(response.response)) }}</Payload>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
