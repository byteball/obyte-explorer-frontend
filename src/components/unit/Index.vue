<script setup>
import { inject, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ArrowCircleUpIcon } from "@heroicons/vue/outline";
import { EventNames } from "../../enum/eventEnums";

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
} from "../../services/cytoscape.js";

import { useGlobalStateStore } from "../../stores/globalState";
import { useInfoStore } from "../../stores/info";

const router = useRouter();
const route = useRoute();

const globalState = useGlobalStateStore();
const infoStore = useInfoStore();

const { searchInputFocused } = storeToRefs(globalState);

const socket = inject("socket.io");

function updDag(data) {
  updDagHandler(data);
  if (route.params.unit) {
    setCurrentUnit(route.params.unit);
  }
}

function infoEmitHandler(data) {
  infoStore.setInfo(data);
  infoStore.setReady(true);
  globalState.setLastUnit(data.unit);
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
      return alert("Not Found");
  }
}

setEmitHandler((name, data) => {
  switch (name) {
    case EventNames.Info:
      return socket.emit(EventNames.Info, data, infoEmitHandler);
    case EventNames.Prev:
      return socket.emit(EventNames.Prev, data, prevHandler);
    case EventNames.Next:
      return socket.emit(EventNames.Next, data, nextHandler);
    case EventNames.HighlightNode:
      return socket.emit(EventNames.HighlightNode, data, highlightNodeEmitHandler);
    case EventNames.New:
      return socket.emit(EventNames.New, data, newHandler);
  }
});

setClickHandler((unit) => {
  router.push(`/${unit}`);
  highlightNode(unit);
});

function resetUnit() {
  infoStore.setInfo({});
  infoStore.setReady(false);
  globalState.setLastUnit("");
  router.push(`/`);
  getLastUnits();
}

function getLastUnits() {
  socket.emit(EventNames.GetLastUnits, updDag);
}

socket.on("deleted", deletedHandler);
socket.on("update", getNew);

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
    socket.emit(EventNames.GetUnit, { unit: route.params.unit }, updDag);
    return;
  }
  getLastUnits();
});

onUnmounted(() => {
  window.removeEventListener("keydown", keyDown);
});
</script>

<template>
  <div id="up" class="top-40 sm:top-32 right-[2%] xl:right-[35%]">
    <button class="btn btn-ghost btn-circle" @click="resetUnit">
      <ArrowCircleUpIcon class="h-12 w-12 text-gray-700 opacity-70 hover:opacity-90" />
    </button>
  </div>
</template>

<style scoped>
#up {
  z-index: 10000;
  position: absolute;
}
</style>
