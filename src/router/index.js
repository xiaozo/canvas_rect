import Vue from 'vue'
import Router from 'vue-router'
import Rect from '@/components/Rect'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'rect',
      component: Rect
    }
  ]
})
