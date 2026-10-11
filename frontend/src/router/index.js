import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'MapHome',
    component: () => import('../views/MapHome.vue'),
  },
  {
    path: '/species/:id',
    name: 'SpeciesDetail',
    component: () => import('../views/SpeciesDetail.vue'),
    props: true,
  },
  {
    path: '/crops',
    name: 'CropList',
    component: () => import('../views/CropList.vue'),
  },
  {
    path: '/pests',
    name: 'PestList',
    component: () => import('../views/PestList.vue'),
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: () => import('../views/SearchResult.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
