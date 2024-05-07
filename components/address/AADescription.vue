<script setup>
const props = defineProps(["definition", "baseAaDefinition"]);

const aaDescription = ref('');

const fetchAndSetAaDescription = async (docUrl) => {
  const aaDoc = await $fetch(docUrl);

  if (aaDoc.description) {
    aaDescription.value = aaDoc.description;
  }
}

const checkAndSetAaDescription = async () => {
  try {
    const definition = JSON.parse(props.definition);

    if (definition[1].doc_url) {
      await fetchAndSetAaDescription(definition[1].doc_url);
      return;
    }

    if (props.baseAaDefinition) {
      const baseAaDefinition = JSON.parse(props.baseAaDefinition);

      if (baseAaDefinition[1].doc_url) {
        await fetchAndSetAaDescription(baseAaDefinition[1].doc_url);
      }
    }
  } catch (e) {
  }
}

await checkAndSetAaDescription();
</script>

<template>
  <div v-if="aaDescription" class="mt-1">
    {{ aaDescription }}
  </div>
</template>
