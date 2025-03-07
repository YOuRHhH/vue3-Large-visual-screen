
import { defineStore } from "pinia";
import { ref } from "vue";
export const dragStore = defineStore('User', () => {
    const adsorbent = ref({
        open:true,
        distance:5
    })
    const setAdsorbent = (newVal:any) => {
        adsorbent.value = newVal
    }
    return {
        adsorbent, setAdsorbent
    }
})