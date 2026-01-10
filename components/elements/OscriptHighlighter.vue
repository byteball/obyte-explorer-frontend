<script setup>
const props = defineProps({
  text: String,
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
const router = useRouter();

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

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
      } else if (value.startsWith('"') && inner.startsWith("{") && inner.endsWith("}")) {
        tokens.push({ type: "formula", value, inner: inner.slice(1, -1), quote: value[0] });
      } else if (value.startsWith("`") && inner.startsWith("{") && inner.endsWith("}")) {
        tokens.push({ type: "formula", value, inner: inner.slice(1, -1), quote: value[0] });
      } else if (value.startsWith("'") && inner.startsWith("{") && inner.endsWith("}")) {
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

function renderTokens(tokens) {
  return tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);
      switch (token.type) {
        case "comment":
          return `<span class="os-comment">${escaped}</span>`;
        case "string":
          const inner = token.value.slice(1, -1);
          if (inner.startsWith("http://") || inner.startsWith("https://")) {
            return `<span class="os-string">${token.value[0]}<a href="${inner}" class="os-link" target="_blank" rel="noopener noreferrer">${escapeHtml(inner)}</a>${token.value[token.value.length - 1]}</span>`;
          }
          return `<span class="os-string">${escaped}</span>`;
        case "json-key":
          return `<span class="os-json-key">${escaped}</span>`;
        case "address-string":
          return `<span class="os-string">${token.quote}<a class="addr os-link" href="/address/${token.address}">${token.address}</a>${token.quote}</span>`;
        case "formula":
          return `<span class="os-formula-bracket">${token.quote}{</span>${renderFormula(token.inner)}<span class="os-formula-bracket">}${token.quote}</span>`;
        case "variable":
          return `<span class="os-variable">${escaped}</span>`;
        case "number":
          return `<span class="os-number">${escaped}</span>`;
        case "boolean":
          return `<span class="os-boolean">${escaped}</span>`;
        case "keyword":
          return `<span class="os-keyword">${escaped}</span>`;
        case "function":
          return `<span class="os-function">${escaped}</span>`;
        case "operator":
          return `<span class="os-operator">${escaped}</span>`;
        case "address":
          return `<a class="addr os-link" href="/address/${token.value}">${escaped}</a>`;
        default:
          return escaped;
      }
    })
    .join("");
}

function renderFormula(text) {
  const tokens = tokenize(text);
  return renderTokens(tokens);
}

function getLeadingWhitespace(str) {
  const match = str.match(/^(\s*)/);
  return match ? match[1] : '';
}

function processLines(text) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const lineNum = index + 1;
    const tokens = tokenize(line);
    const highlighted = renderTokens(tokens);
    const isHighlighted = props.highlightLine === lineNum;
    
    return {
      lineNum,
      content: highlighted || ' ',
      isHighlighted,
      hasError: isHighlighted && props.errorMessage,
      errorIndent: isHighlighted && props.errorMessage ? getLeadingWhitespace(line) : '',
    };
  });
}

const processedLines = computed(() => processLines(props.text));
const lineNumberWidth = computed(() => {
  const maxLine = processedLines.value.length;
  return Math.max(2, String(maxLine).length);
});

function handleLineClick(lineNum, event) {
  emit('line-click', lineNum, event);
}

function handleClick(event) {
  const { target } = event;
  if (target && target.tagName === "A" && target.className.includes("addr")) {
    event.preventDefault();
    router.push({ path: `/address/${target.innerText}` });
  }
}

onBeforeMount(() => {
  window.addEventListener("click", handleClick, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleClick, true);
});
</script>

<template>
  <div class="oscript-wrapper">
    <table class="oscript-code">
      <tbody>
        <template v-for="line in processedLines" :key="line.lineNum">
          <tr v-if="line.hasError" class="error-row">
            <td class="line-gutter error-gutter"></td>
            <td class="error-message-line">
              <span v-html="escapeHtml(line.errorIndent)"></span>Error: {{ errorMessage }}
            </td>
          </tr>
          <tr 
            class="code-row" 
            :class="{ highlighted: line.isHighlighted }"
            :data-line="line.lineNum"
          >
            <td 
              class="line-gutter" 
              :class="{ highlighted: line.isHighlighted }"
              :style="{ width: lineNumberWidth + 'ch' }"
              @click="handleLineClick(line.lineNum, $event)"
              :title="`Line ${line.lineNum}`"
            >
              {{ line.lineNum }}
            </td>
            <td 
              class="line-content code-line" 
              :class="{ highlighted: line.isHighlighted }"
              v-html="line.content"
            ></td>
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

:deep(.os-keyword) {
  color: #cf222e;
  font-weight: bold;
}

:deep(.os-boolean) {
  color: #0550ae;
  font-weight: bold;
}

:deep(.os-string) {
  color: #2c6dcd;
}

:deep(.os-json-key) {
  color: #0550ae;
  font-weight: normal;
}

:deep(.os-number) {
  color: #0550ae;
}

:deep(.os-comment) {
  color: #6e7781;
  font-style: italic;
}

:deep(.os-variable) {
  color: #2a5589;
}

:deep(.os-function) {
  color: #6639ba;
}

:deep(.os-operator) {
  color: #cf222e;
}

:deep(.os-formula-bracket) {
  color: #24292f;
  font-weight: bold;
}

:deep(.os-link) {
  color: #3b82f6; 
  text-decoration: none;
  cursor: pointer;
}

:deep(.os-link:hover) {
  color: #2563eb;
  text-decoration: underline;
}
</style>
