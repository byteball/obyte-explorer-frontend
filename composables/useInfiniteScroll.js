import { useWindowScroll, useElementSize, useWindowSize } from "@vueuse/core";
import { computed } from "vue";

export function useInfiniteScroll(elementRef, options = {}) {
  const { threshold = 100 } = options;

  const { height: windowHeight } = useWindowSize();
  const { height: elementHeight} = useElementSize(elementRef);
  const { y: scrollY } = useWindowScroll();

  const isNearBottom = computed(() => {
    return scrollY.value + windowHeight.value + threshold >= elementHeight.value;
  });

  const isContentShorterThanWindow = computed(() => {
    return elementHeight.value < windowHeight.value;
  });

  function shouldLoadMore(isLoaded, isNewPageLoaded, hasError) {
    if (!isLoaded || !isNewPageLoaded || hasError) return false;
    return isNearBottom.value || isContentShorterThanWindow.value;
  }


  return {
    windowHeight,
    elementHeight,
    scrollY,
    isNearBottom,
    isContentShorterThanWindow,
    shouldLoadMore,
  };
}
