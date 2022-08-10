<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { useWindowSize } from "@vueuse/core";

import VChart from "vue-echarts";

import { format } from "../../helpers/amount";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps(["name", "symbol", "data"]);

const router = useRouter();
const { width } = useWindowSize();

const chart = ref();
const isSmallScreen = ref(false);

const option = ref({
  tooltip: {
    trigger: "item",
    position: "top",
    formatter: function (params) {
      return `${params.data.name}<br/>${format(params.data.value)} ${props.symbol} (${
        params.percent
      }%)`;
    },
  },
  series: [
    {
      name: props.name,
      type: "pie",
      radius: "80%",
      minShowLabelAngle: 4,
      cursor: "default",
      data: props.data,
      label: {
        cursor: "default",
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
});

function resize() {
  chart.value.resize();
}

function mouseMove(params) {
  const { name, event } = params;
  if (event.target.type !== "tspan") return;

  if (name === "Others") {
    chart.value.chart.getZr().setCursorStyle("default");
    return;
  }

  chart.value.chart.getZr().setCursorStyle("pointer");
}

function click(params) {
  const { name, event } = params;
  if (event.target.type !== "tspan" || name === "Others") return;

  router.push(`/address/${name}`);
}

function setSmallPie() {
  chart.value.setOption({
    series: [
      {
        radius: "50%",
      },
    ],
  });
}

function setLargePie() {
  chart.value.setOption({
    series: [
      {
        radius: "80%",
      },
    ],
  });
}

onMounted(() => {
  if (isSmallScreen.value) {
    return setSmallPie();
  }

  setLargePie();
});

watch(
  width,
  () => {
    if (width.value > 640 && isSmallScreen.value) {
      isSmallScreen.value = false;
    } else if (width.value <= 640 && !isSmallScreen.value) {
      isSmallScreen.value = true;
    }
  },
  {
    immediate: true,
  }
);

watch(isSmallScreen, () => {
  if (!chart.value) return;

  if (isSmallScreen.value) {
    return setSmallPie();
  }

  setLargePie();
});

defineExpose({
  resize,
});
</script>

<template>
  <v-chart ref="chart" class="chart" :option="option" @mousemove="mouseMove" @click="click" />
</template>

<style scoped></style>
