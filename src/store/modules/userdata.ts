
import { defineStore } from "pinia";
import { ref } from "vue";
export const uerStore = defineStore('UserData', () => {
    const userData = ref({
    })
    return {
        userData
    }
})