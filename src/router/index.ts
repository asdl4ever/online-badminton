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
    // 训练场 = 单机练习的俯视房间（房间里有球台 / 发球机）；老链接直接重定向
    {
      path: '/training',
      redirect: '/single',
    },
    // 健身房：挥拍砸沙袋练「进攻」
    {
      path: '/gym',
      name: 'gym',
      component: () => import('../views/GymView.vue'),
    },
    // 操场：跑步练「速度 / 体力」
    {
      path: '/track',
      name: 'track',
      component: () => import('../views/TrackView.vue'),
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
    // 大地图上的晋级赛馆：8 人淘汰赛
    {
      path: '/arena',
      name: 'arena',
      component: () => import('../views/ArenaView.vue'),
    },
    // 大地图上的商店：活动 + 宝箱
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
    },
    // 大地图上的宠物店：每小时刷新 3 只在售宠物
    {
      path: '/petshop',
      name: 'petshop',
      component: () => import('../views/PetShopView.vue'),
    },
    // 大地图上的名人堂：AI 球员排行榜 + 观战
    {
      path: '/hall',
      name: 'hall',
      component: () => import('../views/HallView.vue'),
    },
    // 大地图上的赛事中心（观战台）：世界赛树状图 + 真观战
    {
      path: '/watch',
      name: 'watch',
      component: () => import('../views/WatchView.vue'),
    },
    // 大地图上的农场：棉花地，拍棉花换金币
    {
      path: '/farm',
      name: 'farm',
      component: () => import('../views/FarmView.vue'),
    },
    // 小黄龙联名活动（入口在主世界右侧的悬浮图标上）
    {
      path: '/nailong',
      name: 'nailong',
      component: () => import('../views/NailongView.vue'),
    },
    // 哥斯拉来袭（入口在主世界右侧活动栏 + 商店告示板）
    {
      path: '/godzilla',
      name: 'godzilla',
      component: () => import('../views/GodzillaView.vue'),
    },
    // 外星人降临（入口在大世界的 🎪 活动弹窗）
    {
      path: '/alien',
      name: 'alien',
      component: () => import('../views/AlienView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },

  ],
});
