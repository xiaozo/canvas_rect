import Vue from 'vue'
import Router from 'vue-router'
import Rect from '@/components/Rect'
import Canvas from '@/components/Canvas'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'rect',
      component: Rect
    },
    {
      path: '/canvas',
      name: 'Canvas',
      component: Canvas
    }
  ]
})
