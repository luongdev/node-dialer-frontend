import {defineStore} from "pinia";

export const useLoading = defineStore({
    id: 'loading',
    state: () => ({state: false}),
    actions: {
        set(loading: boolean) {
            this.state = loading;
        }
    }
})
