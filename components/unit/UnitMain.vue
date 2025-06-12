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
import { normalizeUnit } from "~/helpers/normalizeUnit.js";
import { prepareLink } from "~/helpers/prepareLink.js";

const router = useRouter();
const route = useRoute();

const globalState = useGlobalStateStore();
const infoStore = useInfoStore();

const { searchInputFocused } = storeToRefs(globalState);
const { info } = storeToRefs(infoStore);

const alertShown = ref(false);
const alertTimeout = ref();

const { $socket } = useNuxtApp();

const unitFromRoute = computed(() => normalizeUnit(route.params.unit));

function updDag(data) {
  updDagHandler(data);
  if (unitFromRoute.value) {
    setCurrentUnit(unitFromRoute.value);
  }
}

function hideAlert() {
  alertShown.value = false;

  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
  }
}

async function checkUnitInfoResult(result, unit) {
  if (result.deleted) {
    globalState.setLastUnit("");
    deletedHandler(unit);
    alertShown.value = true;
    setTimeout(hideAlert, 3000);
    await router.push(`/`);
    return false;
  }

  globalState.setLastUnit(result.unit);
  return true;
}

async function getUnitInfo(unit) {
  if (info.value && info.value.unit === unit) return;

  infoStore.setLoading(true);
  const result = await fetchUnitInfo(unit);

  const isOk = await checkUnitInfoResult(result, unit);

  if (!isOk) {
    infoStore.setLoading(false);
    resetUnit();
    return;
  }

  infoStore.setInfo(result);
  infoStore.setReady(true);
  infoStore.setLoading(false);
}

async function checkRouterAndUnitInfoFromStore() {
  if (unitFromRoute.value) {
    const isOk = await checkUnitInfoResult(info.value, unitFromRoute.value);
    if (!isOk) return;

    $socket.emit(EventNames.GetUnit, { unit: unitFromRoute.value }, updDag);
    return;
  }
  
  getLastUnits();
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
  unit = prepareLink(unit);
  router.push(`/${unit}`);
});

function resetState() {
  infoStore.setInfo({});
  infoStore.setReady(false);
  globalState.setLastUnit("");
}

async function resetUnit() {
  await router.push(`/`);
  resetState();
}

function getLastUnits() {
  resetState();
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
  () => unitFromRoute.value,
  () => {
    if (route.name !== "home" && route.name !== 'unit') return;

    if (unitFromRoute.value) {
      highlightNode(unitFromRoute.value);
    } else {
      getLastUnits();
    }
  }
);

onMounted(() => {
  window.addEventListener("keydown", keyDown);
  checkRouterAndUnitInfoFromStore();
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
