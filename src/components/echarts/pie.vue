<script lang="ts" setup>
import { defineComponent,onMounted } from 'vue';

defineComponent({
    name:"ExamplePic"
});
import * as echarts from 'echarts';



var option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
};
onMounted(() => {
    var chartDom = document.getElementById('ExamplePic');
    var myChart = echarts.init(chartDom);
    option && myChart.setOption(option);
})

</script>
<template>
    <div id="ExamplePic" class="h-full w-full" style="height: 100px;width: 100px;">
    </div>
</template>