<script setup>
const props = defineProps(["definition", "baseAaDefinition"]);

const aaDescription = ref('');
const aaHomepageUrl = ref('');
const aaSourceUrl = ref('');

const fetchAndSetAaDescription = async (docUrl) => {
  const aaDoc = await $fetch(docUrl);

  if (aaDoc.description) {
    aaDescription.value = aaDoc.description;
  }

  if (aaDoc.homepage_url) {
    aaHomepageUrl.value = aaDoc.homepage_url;
  }

  if (aaDoc.source_url) {
    aaSourceUrl.value = aaDoc.source_url;
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
  <div class="mt-1">
    <div v-if="aaHomepageUrl" class="inline-block">
      <NuxtLink class="link link-hover text-blue-500" :to="aaHomepageUrl" target="_blank"> Home page </NuxtLink>
    </div>
    <div v-if="aaSourceUrl" class="ml-2 inline-block">
      <NuxtLink class="link link-hover text-blue-500" :to="aaSourceUrl" target="_blank"> Source </NuxtLink>
    </div>
  </div>
</template>
