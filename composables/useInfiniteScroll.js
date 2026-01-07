import { useScroll, useElementSize } from "@vueuse/core";
import { computed } from "vue";

export function useInfiniteScroll(scrollContainerRef, contentRef, options = {}) {
  const { threshold = 100 } = options;

  const { height: containerHeight } = useElementSize(scrollContainerRef);
  const { height: contentHeight } = useElementSize(contentRef);
  const { y: scrollY } = useScroll(scrollContainerRef);

  const isNearBottom = computed(() => {
    return scrollY.value + containerHeight.value + threshold >= contentHeight.value;
  });

  const isContentShorterThanContainer = computed(() => {
    return contentHeight.value <= containerHeight.value;
  });

  function shouldLoadMore(isLoaded, isNewPageLoaded, hasError) {
    if (!isLoaded || !isNewPageLoaded || hasError) return false;
    return isNearBottom.value || isContentShorterThanContainer.value;
  }


  return {
    containerHeight,
    contentHeight,
    scrollY,
    isNearBottom,
    isContentShorterThanContainer,
    shouldLoadMore,
  };
}
