
import { defineStore } from "pinia";
import { ref } from "vue";
export const globalStore = defineStore('User', () => {
    const adsorbent = ref({
        open:true,
        distance:5
    })
    const setAdsorbent = (newVal) => {
        adsorbent.value = newVal
    }
    return {
        adsorbent, setAdsorbent
    }
})