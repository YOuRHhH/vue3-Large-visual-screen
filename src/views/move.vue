<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Drag from '../utils/drag';
import * as echarts from 'echarts';


const canvasArr:any[] = [];
const resizeObserver = new ResizeObserver(() => {
    canvasArr.forEach((item: any) => {
        item.resize();
    });
});
function createBox() {
    /**
     * 需要本地存储数据
     * 修改，回显，记录，都会用到
     */
    const divBox = document.createElement('div');
    divBox.style.width = '400px'
    divBox.style.height = '400px'
    divBox.style.backgroundColor = '#fff'
    divBox.style.border = '1px solid #000'
    var myChart = echarts.init(divBox);
    var option;

    option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }
        ]
    };
    option && myChart.setOption(option);
    canvasArr.push(myChart);

    // 监听目标元素
    resizeObserver.observe(divBox);
    return divBox;
}
var drag: any = null;
const control = ref(false);
onMounted(() => {
    drag = new Drag({
        el: '.drag',      // 盒子
        item: '.drag-item',    // 小盒子
        marking: true,         // 是否显示标线
        markingColor: '#f00',  // 标线颜色
        dashed: true,          // 是否显示虚线
        dashedColor: '#0f0',   // 虚线颜色
        adsorbent: {
            open: true,          // 是否开启吸附
            distance: 5          // 吸附距离
        },
        itemData: [{ "id": "1", "component": "123123", "bg": "black", "left": 105, "top": 309, "width": 100, "height": 100, "z_index": 1006 }]
    });
    scal()
    mouseWheel()
    setTimeout(() => {
        addBox()
    }, 1000);
})
// 监听按键
function scal() {
    // 监听是否按下control 
    document.onkeydown = function (e) {
        var key = e.key;
        if (key === 'Control') {
            control.value = true;
        } else {
            control.value = false;
        }
    }
}
// 监听滚轮
function mouseWheel() {
    document.onwheel = function (e: any) {
        // 放大
        if (e.deltaY > 0 && control.value) {

            // 缩小
        } else if (e.deltaY < 0 && control.value) {
        }
    }

}

function dragEnter(e: any) {
    console.log(e)
}
function addBox() {
    drag.addItem(createBox())
}
</script>
<template>
    <div class="drag">
        <div class="drag-item" style="background-color:black;">
            <div class="drag-item" style="background-color:blue;"></div>
        </div>
        <div class="drag-item" style="background-color:red;"></div>
        <div class="drag-item" style="background-color:yellow;"></div>
    </div>
    <button @click="drag.getJSONData(true)">getData</button>
</template>

<style lang="scss" scoped>
.container {
    overflow: hidden;
    height: 100%;
    width: 100%;
}

.drag {
    height: 100%;
    width: 100%;
}

.drag-item {
    height: 100px;
    width: 100px;
}
</style>