import { createRouter, createWebHashHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 大地图是入口：摇杆在平面上走动，走进区域才进对应玩法
    {
      path: '/',
      name: 'world',
      component: () => import('../views/WorldView.vue'),
    },
    // 老的首页（工具坞那屏）已经取消：一进来就是大世界。
    // 旧链接 / 旧版本客户端里残留的 /home 直接落回大地图。
    { path: '/home', redirect: '/' },
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
    // 健身房：举重「进攻」· 沙袋「技术」· 跑步机「体力」
    {
      path: '/gym',
      name: 'gym',
      component: () => import('../views/GymView.vue'),
    },
    // 操场：跑圈练「速度」
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
    // 画室：你画我猜（联机轮流画猜，画笔复用击球拖尾特效）
    {
      path: '/paint',
      name: 'paint',
      component: () => import('../views/PaintView.vue'),
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
    // 大地图上的商城：顶部 皮肤 / 宝箱 / 背包 + 左侧分类（子路由只换这一段）
    // `:section?` = coin（金币商店）/ honor（荣誉商店）/ pet（宠物）/ shard（碎片兑换）
    //                / chest（宝箱）/ bag（背包）
    {
      path: '/shop/:section?',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
    },
    // 宠物店已经并进商城的「皮肤 → 宠物」，老链接直接重定向
    {
      path: '/petshop',
      redirect: '/shop/pet',
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
    // 新闻周刊：世界自己发生的事（老将退役 / 新秀入行…）
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/NewsView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },

  ],
});
