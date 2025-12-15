<script setup>
import Link from "~/components/elements/Link.vue";
import { useAAError } from "~/composables/useAAError";
import { prettifyJson } from "~/helpers/text";

const props = defineProps({
  response: {
    type: [String, Object],
    required: true
  }
});

const { ERROR_TYPES, parseAAResponse } = useAAError();

const errorData = computed(() => parseAAResponse(props.response));

const isCallChain = computed(() => errorData.value.errorType === ERROR_TYPES.CALL_CHAIN);
const isXpath = computed(() => errorData.value.errorType === ERROR_TYPES.XPATH);
const isObject = computed(() => errorData.value.errorType === ERROR_TYPES.OBJECT);
const hasCodeLines = computed(() => errorData.value.details.codeLines?.length > 0);
const hasTrace = computed(() => errorData.value.details.trace?.length > 0);
const hasContext = computed(() => !!errorData.value.details.formattedContext);
const hasAddresses = computed(() => errorData.value.details.addresses?.length > 0);

const rawJson = computed(() => {
  if (!errorData.value.details.raw) return '';
  return prettifyJson(errorData.value.details.raw);
});
</script>

<template>
  <div v-if="errorData.hasError" class="aa-error-display">
    <table class="w-full text-sm">
      <tbody>
        <tr v-if="errorData.message">
          <th class="error-label">Message</th>
          <td class="error-message">{{ errorData.message }}</td>
        </tr>

        <tr v-if="isXpath">
          <th class="error-label">XPath</th>
          <td class="error-xpath">{{ errorData.details.xpath }}</td>
        </tr>

        <tr v-if="isCallChain && hasAddresses">
          <th class="error-label">Call Chain</th>
          <td>
            <div class="chain-container">
              <template v-for="(addr, idx) in errorData.details.addresses" :key="addr">
                <span v-if="idx > 0" class="chain-arrow">-></span>
                <Link :type="'address'" :link="addr" class="chain-addr">{{ addr }}</Link>
              </template>
            </div>
          </td>
        </tr>

        <tr v-if="hasContext">
          <th class="error-label">Context</th>
          <td class="error-context">{{ errorData.details.formattedContext }}</td>
        </tr>

        <tr v-if="hasCodeLines">
          <th class="error-label">Code</th>
          <td>
            <div class="code-block">
              <div v-for="line in errorData.details.codeLines" :key="line.lineNumber" class="code-line">
                <span class="line-num">{{ line.lineNumber }}</span>
                <span class="line-code">{{ line.formula }}</span>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="hasTrace">
          <th class="error-label">Trace</th>
          <td>
            <div class="trace-list">
              <div v-for="(t, idx) in errorData.details.trace" :key="idx" class="trace-item">
                <span :class="['trace-type', { fn: t.type === 'function' }]">{{ t.type }}</span>
                <Link v-if="t.aa" :type="'address'" :link="t.aa" class="trace-aa">{{ t.aa }}</Link>
                <span class="trace-xpath">{{ t.xpath }}</span>
                <span v-if="t.name" class="trace-name">{{ t.name }}</span>
                <span v-if="t.line" class="trace-line">line {{ t.line }}</span>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="isObject">
          <th class="error-label">Raw</th>
          <td class="error-raw">{{ rawJson }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.aa-error-display {
  @apply border border-gray-200 rounded-lg overflow-hidden bg-white;
}

.aa-error-display table {
  @apply border-collapse;
}

.error-label {
  @apply text-left py-2 px-3 bg-gray-50 text-gray-500 font-semibold text-xs uppercase;
  @apply border-b border-gray-200 align-top;
  width: 90px;
  min-width: 90px;
}

.aa-error-display td {
  @apply py-2 px-3 border-b border-gray-100 align-top;
  word-wrap: break-word;
}

.aa-error-display tr:last-child td,
.aa-error-display tr:last-child th {
  @apply border-b-0;
}

.error-message {
  @apply text-red-600 font-medium;
}

.error-xpath {
  @apply text-green-700 font-mono text-xs;
}

.error-context {
  @apply text-purple-600 font-mono text-xs whitespace-pre-wrap;
}

.chain-container {
  @apply flex flex-wrap items-center gap-1 font-mono text-xs;
}

.chain-addr {
  @apply text-blue-600 bg-blue-50 px-2 py-0.5 rounded;
}

.chain-arrow {
  @apply text-gray-400;
}

.code-block {
  @apply bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto mt-1;
}

.code-line {
  @apply flex gap-3 font-mono text-xs leading-relaxed;
}

.line-num {
  @apply text-gray-400 min-w-[24px] text-right select-none;
}

.line-code {
  @apply text-gray-800 whitespace-pre-wrap break-all;
}

.trace-list {
  @apply mt-1 space-y-1;
}

.trace-item {
  @apply flex items-center gap-2 py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs flex-wrap;
}

.trace-type {
  @apply bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium;
}

.trace-type.fn {
  @apply bg-purple-100 text-purple-700;
}

.trace-aa {
  @apply text-blue-600 font-mono text-[11px];
}

.trace-xpath {
  @apply text-green-700 font-mono text-[11px];
}

.trace-name {
  @apply text-purple-600 font-mono text-[11px] font-semibold;
}

.trace-line {
  @apply text-gray-500 text-[11px];
}

.error-raw {
  @apply font-mono text-xs text-gray-700 whitespace-pre-wrap break-all;
}
</style>
