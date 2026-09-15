import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardPage.vue'),
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/ProductCatalogPage.vue'),
  },
  {
    path: '/products/add',
    name: 'AddProduct',
    component: () => import('@/views/AddProductPage.vue'),
  },
  {
    path: '/products/:id',
    name: 'ProductDetails',
    component: () => import('@/views/ProductDetailsPage.vue'),
  },
  {
    path: '/products/:id/edit',
    name: 'EditProduct',
    component: () => import('@/views/EditProductPage.vue'),
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
