<script setup>
import { parseHttpUrl } from "~/helpers/httpUrl";

const props = defineProps({
  text: { type: String, default: "" },
  highlightLine: {
    type: Number,
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['line-click']);

const oscriptKeywords = new Set([
  "messages", "bounce_fees", "app", "payload", "asset", "outputs", "address",
  "amount", "cases", "if", "init", "state", "base", "cap", "is_private",
  "is_transferrable", "auto_destroy", "fixed_denominations", "issued_by_definer_only",
  "cosigned_by_definer", "spender_attested", "issue_condition", "transfer_condition",
  "attestors", "denominations", "base_aa", "params", "doc_url", "getters",
  "autonomous", "agent", "data", "payment", "data_feed", "profile", "text",
  "definition", "definition_template", "poll", "vote", "asset_attestors", "attestation",
]);

const formulaKeywords = new Set([
  "else", "return", "bounce", "require", "var", "response", "response_unit",
  "timestamp", "mci", "mc_unit", "this_address", "storage_size", "unit",
  "number_of_responses", "previous_aa_responses", "trigger", "params", "definition",
]);

const formulaFunctions = new Set([
  "min", "max", "sqrt", "ln", "ceil", "floor", "round", "abs", "hypot",
  "is_valid_signed_package", "sha256", "is_valid_sig", "vrf_verify", "json_parse",
  "json_stringify", "number_from_seed", "length", "is_valid_address", "substring",
  "starts_with", "ends_with", "contains", "parse_date", "timestamp_to_string",
  "typeof", "is_integer", "is_valid_amount", "is_aa", "index_of", "array_length",
  "is_array", "is_assoc", "to_upper", "to_lower", "exists", "delete", "freeze",
  "chash160", "map", "reduce", "split", "join", "reverse", "keys", "replace",
  "has_only", "foreach", "filter", "log",
]);

const operators = new Set(["OR", "NOT", "AND", "OTHERWISE", "or", "and", "not", "otherwise"]);

const addressRegex = /^[A-Z0-9]{32}$/;

function tokenize(text) {
  const tokens = [];
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.*$|\/\*[\s\S]*?\*\/|\$\w+(?:\.\w+)*|\b\w+\b|\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|[{}[\]:,()]|\s+)/gm;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const value = match[0];

    if (value.startsWith("//") || value.startsWith("/*")) {
      tokens.push({ type: "comment", value });
    } else if (value.startsWith('"') || value.startsWith("'") || value.startsWith("`")) {
      const inner = value.slice(1, -1);
      if (addressRegex.test(inner)) {
        tokens.push({ type: "address-string", value, address: inner, quote: value[0] });
      } else if (inner.startsWith("{") && inner.endsWith("}")) {
        tokens.push({ type: "formula", value, inner: inner.slice(1, -1), quote: value[0] });
      } else {
        tokens.push({ type: "string", value });
      }
    } else if (value.startsWith("$")) {
      tokens.push({ type: "variable", value });
    } else if (/^\d/.test(value)) {
      tokens.push({ type: "number", value });
    } else if (value === "true" || value === "false") {
      tokens.push({ type: "boolean", value });
    } else if (oscriptKeywords.has(value) || formulaKeywords.has(value)) {
      tokens.push({ type: "keyword", value });
    } else if (formulaFunctions.has(value)) {
      tokens.push({ type: "function", value });
    } else if (operators.has(value)) {
      tokens.push({ type: "operator", value });
    } else if (addressRegex.test(value)) {
      tokens.push({ type: "address", value });
    } else if (/^\s+$/.test(value)) {
      tokens.push({ type: "whitespace", value });
    } else {
      tokens.push({ type: "text", value });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "string") {
      let j = i + 1;
      while (j < tokens.length && tokens[j].type === "whitespace") {
        j++;
      }
      if (j < tokens.length && tokens[j].value === ":") {
        tokens[i].type = "json-key";
      }
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "variable") {
      let j = i + 1;
      while (j < tokens.length && tokens[j].type === "whitespace") {
        j++;
      }
      if (j < tokens.length && tokens[j].value === "(") {
        tokens[i].type = "function";
      }
    }
  }

  return tokens;
}

function expandTokens(text) {
  return tokenize(text).flatMap((token) => {
    if (token.type === "formula") {
      return [
        { type: "formula-bracket", value: `${token.quote}{` },
        ...expandTokens(token.inner),
        { type: "formula-bracket", value: `}${token.quote}` },
      ];
    }
    if (token.type === "string") {
      const label = token.value.slice(1, -1);
      const url = /^https?:\/\//i.test(label) && parseHttpUrl(label);
      if (url) return { ...token, label, href: url.href };
    }
    if (token.type === "text" || token.type === "whitespace") {
      return { type: "plain", value: token.value };
    }
    return token;
  });
}

function prepareTokens(text) {
  const result = [];
  for (const token of expandTokens(text)) {
    const prev = result.at(-1);
    if (token.type === "plain" && prev?.type === "plain") {
      prev.value += token.value;
    } else {
      result.push(token);
    }
  }
  return result;
}

const processedLines = computed(() =>
  props.text.split("\n").map((raw, index) => ({
    lineNum: index + 1,
    raw,
    tokens: prepareTokens(raw),
  }))
);

const lineNumberWidth = computed(() => Math.max(2, String(processedLines.value.length).length));
</script>

<template>
  <div class="oscript-wrapper">
    <table class="oscript-code">
      <tbody>
        <template v-for="line in processedLines" :key="line.lineNum">
          <tr v-if="line.lineNum === highlightLine && errorMessage" class="error-row">
            <td class="line-gutter error-gutter"></td>
            <td class="error-message-line">
              <span>{{ line.raw.match(/^\s*/)[0] }}</span>Error: {{ errorMessage }}
            </td>
          </tr>
          <tr
            class="code-row"
            :class="{ highlighted: line.lineNum === highlightLine }"
            :data-line="line.lineNum"
          >
            <td
              class="line-gutter"
              :class="{ highlighted: line.lineNum === highlightLine }"
              :style="{ width: lineNumberWidth + 'ch' }"
              @click="emit('line-click', line.lineNum)"
              :title="`Line ${line.lineNum}`"
            >
              {{ line.lineNum }}
            </td>
            <td class="line-content code-line" :class="{ highlighted: line.lineNum === highlightLine }">
              <template v-for="(token, index) in line.tokens" :key="index">
                <template v-if="token.type === 'plain'">{{ token.value }}</template>
                <span v-else-if="token.type === 'address-string'" class="os-string">{{ token.quote }}<NuxtLink
                  class="addr os-link" :to="`/address/${token.address}`" no-prefetch
                >{{ token.address }}</NuxtLink>{{ token.quote }}</span>
                <NuxtLink v-else-if="token.type === 'address'" class="addr os-link" :to="`/address/${token.value}`" no-prefetch>{{ token.value }}</NuxtLink>
                <span v-else-if="token.href" class="os-string">{{ token.value[0] }}<a
                  :href="token.href" class="os-link" target="_blank" rel="noopener noreferrer"
                >{{ token.label }}</a>{{ token.value.at(-1) }}</span>
                <span v-else :class="`os-${token.type}`">{{ token.value }}</span>
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.oscript-wrapper {
  overflow-x: auto;
}

.oscript-code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  border-collapse: collapse;
  width: 100%;
}

@media (max-width: 768px) {
  .oscript-code {
    font-size: 0.75rem;
  }
}

.code-row {
  transition: background-color 0.15s ease;
}

.code-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.code-row.highlighted {
  background-color: rgba(255, 255, 0, 0.15);
}

.line-gutter {
  padding: 0 0.5rem 0 0.25rem;
  text-align: right;
  color: #9ca3af;
  user-select: none;
  cursor: pointer;
  vertical-align: top;
  white-space: nowrap;
  border-right: 1px solid #e5e7eb;
  transition: all 0.15s ease;
  position: sticky;
  left: 0;
}

.line-gutter:hover {
  color: #3b82f6;
}

.line-gutter.highlighted {
  border-right-color: #ffd700;
  color: #d97706;
  font-weight: 600;
}

.line-content {
  padding: 0 0 0 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  min-height: 1.6em;
}

.line-content.highlighted {
  position: relative;
}

.line-content.highlighted::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #ffd700;
}

.error-row {
  background-color: rgba(239, 68, 68, 0.05);
}

.error-gutter {
  background-color: rgba(239, 68, 68, 0.1);
  border-right-color: #ef4444;
}

.error-message-line {
  background-color: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-left: 3px solid #ef4444;
  padding: 0.35rem 0.75rem;
  color: #dc2626;
  font-style: italic;
  white-space: pre-wrap;
}

.os-keyword {
  color: #cf222e;
  font-weight: bold;
}

.os-boolean {
  color: #0550ae;
  font-weight: bold;
}

.os-string {
  color: #2c6dcd;
}

.os-json-key {
  color: #0550ae;
  font-weight: normal;
}

.os-number {
  color: #0550ae;
}

.os-comment {
  color: #6e7781;
  font-style: italic;
}

.os-variable {
  color: #2a5589;
}

.os-function {
  color: #6639ba;
}

.os-operator {
  color: #cf222e;
}

.os-formula-bracket {
  color: #24292f;
  font-weight: bold;
}

.os-link {
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
}

.os-link:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>
