import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import AuthView from '@/views/AuthView.vue'
import { getToken } from '@/helpers/auth'

const routes = [
  { path: '/auth', component: AuthView },
  { 
    path: '/', 
    component: Dashboard, 
    meta: { requiresAuth: false } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  if (to.meta.requiresAuth && !token) {
    next('/auth')
  } else {
    next()
  }
})

export default router
