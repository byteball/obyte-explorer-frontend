import { computed, ref, watch } from "vue";

export function useAaDescription(definitionRef, baseDefinitionRef) {
  const aaDescription = ref("");
  const aaHomepageUrl = ref("");
  const aaSourceUrl = ref("");

  const fetchAaDescription = async () => {
    const definition = definitionRef?.value;
    if (!definition) return;

    try {
      const parsedDefinition = JSON.parse(definition);
      let docUrl = parsedDefinition[1]?.doc_url;

      if (!docUrl && baseDefinitionRef?.value) {
        const baseParsed = JSON.parse(baseDefinitionRef.value);
        docUrl = baseParsed[1]?.doc_url;
      }

      if (docUrl) {
        const aaDoc = await $fetch(docUrl);
        if (aaDoc?.description) {
          aaDescription.value = aaDoc.description;
        }
        aaHomepageUrl.value = aaDoc?.homepage_url || "";
        aaSourceUrl.value = aaDoc?.source_url || "";
      } else {
        aaHomepageUrl.value = "";
        aaSourceUrl.value = "";
      }
    } catch {
      //
    }
  };

  const truncatedDescription = computed(() => {
    if (!aaDescription.value) return "";
    const maxLength = 100;
    return aaDescription.value.length > maxLength
      ? aaDescription.value.substring(0, maxLength) + "..."
      : aaDescription.value;
  });

  watch(
    () => [definitionRef?.value, baseDefinitionRef?.value],
    () => fetchAaDescription(),
    { immediate: true }
  );

  return {
    aaDescription,
    aaHomepageUrl,
    aaSourceUrl,
    truncatedDescription,
    fetchAaDescription,
  };
}
