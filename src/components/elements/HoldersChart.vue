<script setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps(["name", "symbol", "data"]);

const chart = ref();

const option = ref({
  tooltip: {
    trigger: "item",
    formatter: `{b}<br />{c} ${props.symbol} ({d}%)`,
    position: "top",
  },
  series: [
    {
      name: props.name,
      type: "pie",
      radius: "80%",
      data: props.data,
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

defineExpose({
  resize,
});
</script>

<template>
  <v-chart ref="chart" class="chart" :option="option" />
</template>

<style scoped></style>
