import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 大地图是入口：摇杆在平面上走动，走进区域才进对应玩法
    {
      path: '/',
      name: 'world',
      component: () => import('../views/WorldView.vue'),
    },
    // 原来的首页（工具坞：段位 / 外观 / 背包 / 宝箱 / 宠物蛋 / 好友）
    { path: '/home', name: 'home', component: HomeView },
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
    {
      path: '/fish',
      name: 'fish',
      component: () => import('../views/FishView.vue'),
    },
    {
      path: '/mine',
      name: 'mine',
      component: () => import('../views/MineView.vue'),
    },
    {
      path: '/barber',
      name: 'barber',
      component: () => import('../views/BarberView.vue'),
    },
    // 大地图上的孵化屋：宠物蛋独立成一栋房子
    {
      path: '/egg',
      name: 'egg',
      component: () => import('../views/EggView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },

  ],
});
