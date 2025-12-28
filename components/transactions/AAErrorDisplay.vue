<script setup>
import Link from "~/components/elements/Link.vue";
import { useAAError } from "~/composables/useAAError";
import { prettifyJson } from "~/helpers/text";
import { getAddressForTrace } from "~/helpers/definition";

const props = defineProps({
  response: {
    type: [String, Object],
    required: true
  },
  aaAddress: {
    type: String,
    default: null
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

const lastTrace = computed(() => {
  const trace = errorData.value.details.trace;
  return trace && trace.length > 0 ? trace[trace.length - 1] : null;
});

const rawJson = computed(() => {
  if (!errorData.value.details.raw) return '';
  return prettifyJson(errorData.value.details.raw);
});

function buildAddressUrl(address, xpath, line, includeError = false) {
  if (!address) return null;
  
  const params = new URLSearchParams();
  if (xpath) params.set('xpath', xpath);
  if (line) params.set('line', line);
  if (includeError && errorData.value.message) params.set('error', errorData.value.message);
  
  const queryString = params.toString();
  return `/address/${address}${queryString ? '?' + queryString : ''}`;
}

function getTraceUrl(trace, traceIndex, errorMessage) {
  const traceItem = trace[traceIndex];
  const address = traceItem.aa || getAddressForTrace(trace, traceIndex);
  const isLastTrace = traceIndex === trace.length - 1;
  
  return buildAddressUrl(address, traceItem.xpath, traceItem.line, isLastTrace);
}

function getXpathUrl() {
  let address = props.aaAddress;
  let xpath = errorData.value.details.xpath;
  let line = null;
  
  if (lastTrace.value) {
    address = lastTrace.value.aa || getAddressForTrace(errorData.value.details.trace, errorData.value.details.trace.length - 1);
    xpath = lastTrace.value.xpath;
    line = lastTrace.value.line;
  }
  
  if (!address) return null;
  
  return buildAddressUrl(address, xpath, line, true);
}

function getCodeLineUrl(lineNumber) {
  let address = props.aaAddress;
  let xpath = errorData.value.details.xpath;
  
  if (lastTrace.value) {
    address = lastTrace.value.aa || getAddressForTrace(errorData.value.details.trace, errorData.value.details.trace.length - 1);
    xpath = lastTrace.value.xpath;
  }
  
  if (!address) return null;
  
  return buildAddressUrl(address, xpath, lineNumber, true);
}
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
          <td>
            <NuxtLink 
              v-if="getXpathUrl()"
              :to="getXpathUrl()"
              class="error-xpath error-xpath-link"
            >
              {{ errorData.details.xpath }}
            </NuxtLink>
            <span v-else class="error-xpath">{{ errorData.details.xpath }}</span>
          </td>
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
              <NuxtLink 
                v-for="line in errorData.details.codeLines" 
                :key="line.lineNumber" 
                :to="getCodeLineUrl(line.lineNumber)"
                class="code-line code-line-clickable"
              >
                <span class="line-num">{{ line.lineNumber }}</span>
                <span class="line-code">{{ line.formula }}</span>
              </NuxtLink>
            </div>
          </td>
        </tr>

        <tr v-if="hasTrace">
          <th class="error-label">Trace</th>
          <td>
            <div class="trace-list">
              <NuxtLink 
                v-for="(t, idx) in errorData.details.trace" 
                :key="idx" 
                :to="getTraceUrl(errorData.details.trace, idx, errorData.message)"
                class="trace-item trace-clickable"
              >
                <span :class="['trace-type', { fn: t.type === 'function' }]">{{ t.type }}</span>
                <span v-if="t.aa" class="trace-aa">{{ t.aa }}</span>
                <span class="trace-xpath">{{ t.xpath }}</span>
                <span v-if="t.name" class="trace-name">{{ t.name }}</span>
                <span v-if="t.line" class="trace-line">line {{ t.line }}</span>
              </NuxtLink>
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
  @apply border border-gray-200 rounded-lg overflow-hidden bg-white w-full max-w-full;
}

.aa-error-display table {
  @apply border-collapse;
  table-layout: fixed;
}

.error-label {
  @apply text-left py-2 px-3 bg-gray-50 text-gray-500 font-semibold text-xs uppercase;
  @apply border-b border-gray-200 align-top;
  width: 90px;
  min-width: 90px;
}

.aa-error-display td {
  @apply py-2 px-3 border-b border-gray-100 align-top overflow-hidden;
  word-wrap: break-word;
  word-break: break-word;
}

.aa-error-display tr:last-child td,
.aa-error-display tr:last-child th {
  @apply border-b-0;
}

.error-message {
  @apply text-red-600 font-medium;
}

.error-xpath {
  @apply text-green-700 font-mono text-xs break-all;
}

.error-xpath-link {
  @apply cursor-pointer transition-colors;
}

.error-xpath-link:hover {
  @apply text-green-800 underline;
}

.error-context {
  @apply text-purple-600 font-mono text-xs whitespace-pre-wrap;
}

.chain-container {
  @apply flex flex-wrap items-center gap-1 font-mono text-xs;
}

.chain-addr {
  @apply text-blue-600 bg-blue-50 px-2 py-0.5 rounded break-all;
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

.code-line-clickable {
  @apply cursor-pointer transition-colors;
  color: rgb(31 41 55 / var(--tw-text-opacity, 1));
}
.code-line-clickable:hover {
  @apply underline;
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

.trace-item:hover > :is(.trace-aa, .trace-xpath, .trace-line, .trace-name) {
  @apply underline;
}

.trace-item {
  @apply flex items-start gap-2 py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs flex-wrap;
}

.trace-clickable {
  @apply cursor-pointer transition-colors;
}

.trace-type {
  @apply bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium;
}

.trace-type.fn {
  @apply bg-purple-100 text-purple-700;
}

.trace-aa {
  @apply text-blue-600 font-mono text-[11px] break-all;
}

.trace-xpath {
  @apply text-green-700 font-mono text-[11px] break-all;
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
