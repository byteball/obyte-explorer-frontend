<script setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

import { format } from "../../helpers/amount";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps(["name", "data"]);

const option = ref({
  tooltip: {
    trigger: "item",
    position: "top",
    formatter: function (params) {
      return `${params.data.name} - $${format(params.data.value)} (${params.percent}%)`;
    },
  },
  series: [
    {
      name: props.name,
      type: "pie",
      radius: "80%",
      minShowLabelAngle: 20,
      cursor: "default",
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
