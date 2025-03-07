
import { defineStore } from "pinia";
import { ref } from "vue";
export const echartStore = defineStore('User', () => {
    const echartss = ref([
        {id:1,type:"bar"},
        {id:2,type:"pie"},
    ])
    const setAdsorbent = (newVal:any) => {
        adsorbent.value = newVal
    }
    return {
        adsorbent, setAdsorbent
    }
})