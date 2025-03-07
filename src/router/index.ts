import { createWebHistory, createRouter } from 'vue-router'


import Layout from '../layout/layout.vue';
import Move from '../views/move.vue';
import About from '../views/about.vue';

const routes = [
  { 
    path: '/', 
    component: Layout,
    redirect: '/move',
    children: [
      { path: '/move', component: Move },
      { path: '/about', component: About },
    ]
  },
  { path: '/404', component: () => import('../pages/notfound.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/404'},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;