import type { App } from 'vue'
import { nextTick } from "vue"
export const errorHandler = (App: App<Element>) => {
    App.config.errorHandler = (err, vm, info) => {
        nextTick(() => {
            if (process.env.NODE_ENV === 'development') {
                console.group('%c >>>>>> ERROR >>>>>>', 'color:red')
                console.log(`%c ${info}`, 'color:blue')
                console.groupEnd()
                console.group('%c >>>>>> Component >>>>>>', 'color:green')
                console.log(vm)
                console.groupEnd()
                console.group('%c >>>>>> Stack Trace >>>>>>', 'color:red')
                console.error(err)
                console.groupEnd()
            }
        })
    }

}
