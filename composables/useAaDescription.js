import { computed, onMounted, shallowRef, toValue, watch } from "vue";
import { parseHttpUrl } from "../helpers/httpUrl.js";

const AA_ADDRESS_RE = /^[A-Z2-7]{32}$/;

function extractDocUrl(def) {
  if (!def) return null;
  const parsed = typeof def === "string" ? JSON.parse(def) : def;
  return typeof parsed?.[1]?.doc_url === "string" ? parsed[1].doc_url : null;
}

async function loadAaDescription(address, definition, baseDefinition, signal) {
  if (!definition && !baseDefinition) return null;

  try {
    let docUrl = extractDocUrl(definition) || extractDocUrl(baseDefinition);
    if (!docUrl) return null;

    if (docUrl.includes("{{aa_address}}")) {
      if (typeof address !== "string" || !AA_ADDRESS_RE.test(address)) return null;
      docUrl = docUrl.replaceAll("{{aa_address}}", address);
    }

    const url = parseHttpUrl(docUrl);
    if (!url) return null;

    return await $fetch("/aa-documentation", {
      method: "POST",
      query: { url: url.href },
      retry: 0,
      signal,
    });
  } catch {
    return null;
  }
}

export function useAaDescription(address, definition, baseDefinition) {
  const doc = shallowRef(null);

  onMounted(() => {
    watch(
      () => [toValue(address), toValue(definition), toValue(baseDefinition)],
      async ([addr, def, baseDef], _, onCleanup) => {
        const controller = new AbortController();
        onCleanup(() => controller.abort());
        doc.value = null;
        const result = await loadAaDescription(addr, def, baseDef, controller.signal);
        if (!controller.signal.aborted) doc.value = result;
      },
      { immediate: true }
    );
  });

  return {
    aaDescription: computed(() => doc.value?.description || ""),
    aaHomepageUrl: computed(() => doc.value?.homepage_url || ""),
    aaSourceUrl: computed(() => doc.value?.source_url || ""),
  };
}
