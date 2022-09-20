import Vue from 'vue'
import Router from 'vue-router'
import Invoice from '@/components/Invoice'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'invoice',
      component: Invoice
    }
  ]
})
