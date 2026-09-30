import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/single',
      name: 'single',
      component: () => import('../views/SingleView.vue'),
    },
    {
      path: '/online',
      name: 'online',
      component: () => import('../views/OnlineView.vue'),
    },
    {
      path: '/climb',
      name: 'climb',
      component: () => import('../views/ClimbView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
