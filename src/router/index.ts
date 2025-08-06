import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/api-builder',
    name: 'ApiBuilder',
    component: () => import('../views/ApiBuilderView.vue'),
    meta: {
      title: 'API Builder',
      requiresAuth: false
    }
  },
  {
    path: '/project-creation',
    name: 'ProjectCreation',
    component: () => import('../views/ProjectCreationView.vue'),
    meta: {
      title: 'Create New Project',
      requiresAuth: false
    }
  },
  {
    path: '/project-creation/:step',
    name: 'ProjectCreationStep',
    component: () => import('../views/ProjectCreationView.vue'),
    props: route => ({
      initialStep: parseInt(route.params.step as string) || 1
    }),
    meta: {
      title: 'Create New Project',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Vue Layout Minimal`
  } else {
    document.title = 'Vue Layout Minimal'
  }
  
  next()
})

export default router