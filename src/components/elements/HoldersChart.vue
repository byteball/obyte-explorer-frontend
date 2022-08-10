<script setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";
import { format } from "../../helpers/amount";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps(["name", "symbol", "data"]);

const chart = ref();

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
