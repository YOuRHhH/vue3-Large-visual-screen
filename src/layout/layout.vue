<script lang="ts" setup>
import { defineComponent } from 'vue';
defineComponent({
    name:"Layout"
});
import Head from "./components/Header.vue"
import Side from "./components/Side.vue"
</script>
<template>
    <Head></Head>
    <div class="flex body">
        <Side></Side>
        <router-view></router-view>
    </div>
</template>

<style lang="scss" scoped>
.body{
    height: calc(100vh - 60px);
}
</style>