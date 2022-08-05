<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { InformationCircleIcon } from "@heroicons/vue/outline";

const { t } = useI18n();
const isOpened = ref(false);

function show() {
  isOpened.value = true;
}

function hide() {
  isOpened.value = false;
}
</script>

<template>
  <div class="up bottom-4 left-4">
    <button class="btn btn-ghost btn-circle" @click="show">
      <InformationCircleIcon
        class="h-10 w-10 text-blue-500 opacity-70 hover:opacity-90"
        style="margin-top: -1px"
      />
    </button>
  </div>
  <div v-show="isOpened" class="absolute inset-0 bg-black opacity-50" id="bg" @click="hide"></div>
  <div v-show="isOpened" id="content" class="max-w-md w-full bg-white absolute p-6 rounded-lg">
    <div class="font-bold text-xl mb-4">{{ t("unitLegend") }}</div>
    <div class="grid gap-2">
      <div class="sprite-legend sprite-1-1">
        <span>- {{ t("notMcNotStable") }}</span>
      </div>
      <div class="sprite-legend sprite-2-1">
        <span>- {{ t("mcNotStable") }} </span>
      </div>
      <div class="sprite-legend sprite-3-1">
        <span>- {{ t("badUnit") }}</span>
      </div>
      <div class="sprite-legend sprite-1-2">
        <span>- {{ t("notMcFinal") }}</span>
      </div>
      <div class="sprite-legend sprite-2-2">
        <span>- {{ t("mcFinal") }}</span>
      </div>
      <div class="sprite-legend sprite-1-3">
        <span>- {{ t("notMcSelected") }} </span>
      </div>
      <div class="sprite-legend sprite-2-3">
        <span>- {{ t("mcSelected") }} </span>
      </div>
    </div>
    <div class="text-right">
      <button class="btn btn-ghost text-sm mt-4" @click="hide">{{ t("closeButton") }}</button>
    </div>
  </div>
</template>

<style scoped>
#bg {
  z-index: 1600;
}
#content {
  z-index: 1700;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.sprite-legend {
  background: url("/icon-legend.png") no-repeat;
  background-size: 90px 90px;
  width: 30px;
  height: 30px;
}
.sprite-legend span {
  position: absolute;
  margin-left: 35px;
  margin-top: 5px;
}
.sprite-1-1 {
  background-position: 0 0;
}
.sprite-1-2 {
  background-position: -30px 0;
}
.sprite-1-3 {
  background-position: -60px 0;
}
.sprite-2-1 {
  background-position: 0 -30px;
}
.sprite-2-2 {
  background-position: -30px -30px;
}
.sprite-2-3 {
  background-position: -60px -30px;
}
.sprite-3-1 {
  background-position: 0 -60px;
}
</style>
