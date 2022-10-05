<script setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { useRouter } from "vue-router";
import VChart from "vue-echarts";

import { format } from "../../helpers/amount";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const router = useRouter();

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

function click(params) {
  const { name, event } = params;
  if (event.target.type !== "tspan") return;

  router.push(`/asset/${name}`);
}
</script>

<template>
  <v-chart class="chart" :option="option" @click="click" />
</template>

<style scoped></style>
