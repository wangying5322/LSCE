import Vue from 'vue'
import Router from 'vue-router'
import Lsce from '../views/lsce'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LSCE',
      component: Lsce
    }
  ]
})
