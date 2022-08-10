<script setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps(["name", "data"]);

const option = ref({
  tooltip: {
    trigger: "item",
    formatter: "{b} - ${c} ({d}%)",
    position: "top",
  },
  series: [
    {
      name: props.name,
      type: "pie",
      radius: "80%",
      minShowLabelAngle: 20,
      label: {
        position: "inner",
        fontSize: 11,
      },
      labelLine: {
        show: false,
      },
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
</script>

<template>
  <v-chart class="chart" :option="option" />
</template>

<style scoped></style>
