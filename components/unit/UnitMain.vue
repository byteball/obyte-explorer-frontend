<script setup>
import { ArrowCircleUpIcon, ExclamationIcon } from "@heroicons/vue/outline";
import { EventNames } from "~/enum/eventEnums";

import {
  highlightNode,
  nextHandler,
  updDagHandler,
  prevHandler,
  deletedHandler,
  newHandler,
  setEmitHandler,
  setClickHandler,
  setCurrentUnit,
  getNew,
  scrollUp,
  scrollDown,
} from "~/services/cytoscape.js";

import { useGlobalStateStore } from "~/stores/globalState";
import { useInfoStore } from "~/stores/info.js";
import fetchUnitInfo from "~/api/fetchUnitInfo";

const router = useRouter();
const route = useRoute();

const globalState = useGlobalStateStore();
const infoStore = useInfoStore();

const { searchInputFocused } = storeToRefs(globalState);
const { info } = storeToRefs(infoStore);

const alertShown = ref(false);
const alertTimeout = ref();

const { $socket } = useNuxtApp();

function updDag(data) {
  updDagHandler(data);
  if (route.params.unit) {
    setCurrentUnit(route.params.unit);
  }
}

function hideAlert() {
  alertShown.value = false;

  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
  }
}

async function getUnitInfo(unit) {
  if (info && info.unit === unit) return;

  infoStore.setLoading(true);
  const result = await fetchUnitInfo($socket, unit);
  if (result.deleted) {
    globalState.setLastUnit("");
    deletedHandler(unit);
    alertShown.value = true;
    setTimeout(hideAlert, 3000);
    await router.push(`/`);
  } else {
    globalState.setLastUnit(result.unit);
  }
  infoStore.setInfo(result);
  infoStore.setReady(true);
  infoStore.setLoading(false);
}

function highlightNodeEmitHandler({ type, data }) {
  switch (type) {
    case EventNames.Start:
      return updDag(data);
    case EventNames.Prev:
      return prevHandler(data);
    case EventNames.Next:
      return nextHandler(data);
    case EventNames.NotFound:
      return;
  }
}

setEmitHandler((name, data) => {
  switch (name) {
    case EventNames.Info:
      return getUnitInfo(data.unit);
    case EventNames.Prev:
      return $socket.emit(EventNames.Prev, data, prevHandler);
    case EventNames.Next:
      return $socket.emit(EventNames.Next, data, nextHandler);
    case EventNames.HighlightNode:
      return $socket.emit(EventNames.HighlightNode, data, highlightNodeEmitHandler);
    case EventNames.New:
      return $socket.emit(EventNames.New, data, newHandler);
  }
});

setClickHandler((unit) => {
  if (unit.startsWith("/")) {
     unit = unit.replace("/", "%2F");
  }
  router.push(`/${unit}`);
});

function resetUnit() {
  infoStore.setInfo({});
  infoStore.setReady(false);
  globalState.setLastUnit("");
  router.push(`/`);
  getLastUnits();
}

function getLastUnits() {
  $socket.emit(EventNames.GetLastUnits, updDag);
}

$socket.on("update", getNew);

function keyDown(e) {
  if (searchInputFocused.value) return;

  if (e.key === "ArrowUp") {
    e.preventDefault();
    scrollUp();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    scrollDown();
  }
}

watch(
  () => route.params.unit,
  () => {
    if (route.name !== "home") return;

    if (route.params.unit) {
      highlightNode(route.params.unit);
    } else {
      resetUnit();
    }
  }
);

onMounted(() => {
  window.addEventListener("keydown", keyDown);
  if (route.params.unit) {
    getUnitInfo(route.params.unit);
    $socket.emit(EventNames.GetUnit, { unit: route.params.unit }, updDag);
    return;
  }
  getLastUnits();
});


onUnmounted(() => {
  window.removeEventListener("keydown", keyDown);
});
</script>

<template>
  <div class="up top-40 sm:top-28 lg:top-20 right-[2%] xl:right-[35%]">
    <button
      class="btn btn-ghost btn-circle tooltip tooltip-left"
      data-tip="To most recent units"
      @click="resetUnit"
    >
      <ArrowCircleUpIcon
        class="h-12 w-12 text-gray-700 opacity-70 hover:opacity-90"
        style="margin-top: -1px"
      />
    </button>
  </div>
  <div
    class="alert alert-error shadow-lg absolute w-72 cursor-pointer"
    :class="{ alertShown: alertShown }"
    @click="hideAlert"
  >
    <div>
      <ExclamationIcon class="h-6 w-6 text-gray-50" style="margin-top: -1px" />
      <span class="text-gray-50">Unit not found</span>
    </div>
  </div>
</template>

<style scoped>
.alert {
  z-index: 9999999;
  left: 24px;
  transition: all 0.7s;
  opacity: 0;
  transform: translate(-1000px, 14px);
}

.alertShown {
  opacity: 1;
  transform: translate(0, 14px);
}
</style>
