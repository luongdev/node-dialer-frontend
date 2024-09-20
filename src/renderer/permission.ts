import router from './router'
import Performance from '@renderer/utils/performance'

let end = null
router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} route`) /// Routing Benchmark
  next()
  setTimeout(() => {
    end()
  }, 0)
})

router.afterEach(() => { })
