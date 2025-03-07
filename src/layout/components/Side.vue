<script lang="ts" setup>
import { defineComponent } from 'vue';

defineComponent({
    name:"Side"
});

const arr = [
    {name:"柱状图",path:"bar"},
    // {name:"柱状图",path:"bar"},
    // {name:"折线图",path:"line"},
    // {name:"雷达图",path:"radar"},
]
/**
 * 开始拖动时就创建节点在drag容器中，
 */
</script>
<template>
    <aside>
        <div  :id="item.path" draggable="true" v-for="item in arr" :key="item.path">
123
        </div>
    </aside>
</template>

<style lang="scss" scoped>
aside{
    width: 200px;
    max-width: 200px;
    min-width: 200px;
}
</style>