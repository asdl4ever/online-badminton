# 羽毛球 · Badminton

浏览器里的 2D 侧视角羽毛球单打游戏。Vue 3 + TypeScript + Vite 前端，Phaser 4 渲染，支持单机对战 AI 和 WebRTC 点对点联机。

- **物理**：自己写的（重力 + 二次空气阻力），不用 Phaser 内置物理——羽毛球的高速衰减必须靠二次阻力，而且联机需要确定性
- **网战**：房主权威 + 客户端预测 + 快照推算 + 延迟补偿
- **传输**：PeerJS(WebRTC) 直连优先，打不通自动降级到自己服务器上的 WebSocket 中继
- **界面**：Soft UI Evolution 亮色主题，桌面 + 手机双端

源码约 5100 行。

---

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173，同时暴露到局域网（手机可直接访问）
npm run build      # 类型检查 + 生产构建到 dist/
npm start          # 生产：serve dist/ 并挂载 /relay 中继，读 $PORT
npm run serve      # = build && start
```

`npm run dev` 已经配了 `host: true`，手机上开 `http://<你的局域网IP>:5173` 即可。

### 调试用的 URL 参数

| 参数 | 作用 |
|---|---|
| `?debug=1` | 画布左上角显示网络遥测（RTT / 快照频率 / 球滞后） |
| `?net=p2p` | 强制走 WebRTC 直连（排查直连为什么失败） |
| `?net=relay` | 强制走 WebSocket 中继 |
| `?touch=1` / `?touch=0` | 在电脑上强制开关手机触摸界面 |
| `?ice=relay` | 强制 ICE 只走 TURN（用于验证 TURN 是否可用） |

---

## 目录结构

```
├─ server/                       生产环境服务端（纯 Node，无框架）
│  ├─ index.mjs                  静态服务 dist/ + 挂载中继，监听 $PORT
│  └─ relay.mjs                  WebSocket 中继：按房间号配对两个玩家并双向转发
│
├─ src/
│  ├─ main.ts                    入口：Pinia / Router / Vuetify / 字体
│  ├─ App.vue                    路由出口 + 手机竖屏提示遮罩
│  ├─ style.css                  全部 CSS：设计 token + 组件样式 + Vuetify 覆写
│  ├─ router/index.ts            3 条路由（首页 / 单机 / 联机），游戏页懒加载
│  │
│  ├─ game/                      ← 游戏本体，不依赖 Vue
│  │  ├─ constants.ts            所有可调数值：场地尺寸、物理、球拍、击球、网战频率
│  │  ├─ types.ts                共享类型：PlayerInput / World / NetMessage 等
│  │  ├─ theme.ts                画布上所有颜色 + 字体栈（改主题只改这里）
│  │  ├─ physics.ts              弹道积分、过网角度下限、落点解算
│  │  ├─ simulation.ts           ★ 游戏规则核心：世界状态、每帧步进、击球、判分、序列化
│  │  ├─ ai.ts                   单机 AI（带难度参数：预判误差、反应延迟、接触误差）
│  │  ├─ racket.ts               鼠标位移 → 拍头位置 + 拍头速度（含平滑与瞬移保护）
│  │  ├─ input.ts                键盘绑定（左右移动 / 起跳）
│  │  ├─ touch.ts                手机双摇杆 + 布局编辑器（全画布内绘制）
│  │  ├─ emotes.ts               表情定义 + 冷却时间
│  │  ├─ telemetry.ts            客户端网络遥测（RTT / 抖动 / 快照频率 / 球滞后）
│  │  ├─ device.ts               设备与 URL 参数探测（零依赖，不能引 Phaser）
│  │  ├─ audio.ts                Web Audio 合成音效（无音频素材）
│  │  └─ scenes/GameScene.ts     ★ Phaser 场景：渲染 + 主循环 + 网络收发（最大的文件）
│  │
│  ├─ net/                       ← 联机传输层
│  │  ├─ link.ts                 NetLink 接口 + NetMessage 协议 + 房间号生成
│  │  ├─ session.ts              WebRTC(PeerJS) 实现
│  │  ├─ relay.ts                WebSocket 中继实现
│  │  ├─ connect.ts              连接策略：先试直连，失败降级中继，记住上次结果
│  │  └─ ice.ts                  STUN/TURN 配置（可注入自建 TURN）
│  │
│  ├─ stores/game.ts             Pinia：房间/连接/难度（持久化）/遥测快照
│  ├─ composables/
│  │  └─ useMobileShell.ts       手机首次触摸时请求全屏 + 锁横屏
│  │
│  ├─ components/
│  │  ├─ GameCanvas.vue          Phaser 实例的生命周期宿主
│  │  └─ ui/                     可复用 UI 组件
│  │     ├─ Panel.vue            软阴影面板（三级高度）
│  │     ├─ Button.vue           按钮（default/primary/quiet × sm/md/lg）
│  │     ├─ StatusChip.vue       状态胶囊
│  │     ├─ TopBar.vue           顶栏（返回 + 标题 + 右侧插槽）
│  │     ├─ ScoreLine.vue        底部比分行
│  │     ├─ SegmentedChoice.vue  分段选择器（难度切换）
│  │     └─ EmotePicker.vue      表情选择面板
│  └─ views/
│     ├─ HomeView.vue            首页
│     ├─ SingleView.vue          单机对局
│     └─ OnlineView.vue          联机大厅 + 对局
│
├─ .opencode/skills/             已安装的 AI 设计 skill（ui-ux-pro-max 等）
└─ railway.json                  部署配置：build = npm run build，start = npm start
```

---

## 操作

| 操作 | 桌面 | 手机 |
|---|---|---|
| 移动 | `A` / `D` 或 `←` / `→` | 左摇杆左右推 |
| 起跳 | `空格` / `K`（也兼容 `W`） | 左摇杆右侧的「跳」按钮 |
| 挥拍 | **移动鼠标**（碰到球自动击出） | 右摇杆（碰球自动击出） |
| 重开一局 | `R` 或点击按钮 | 点击按钮 |
| 表情 | 顶栏「表情」按钮，或 `1`~`8` 直选 | 顶栏「表情」按钮 |
| 摇杆布局 | — | 顶栏「摇杆」→ 拖动改位置 / 拖把手改大小（跳跃键跟随左摇杆） |

**出球规律**：挥拍方向决定球的去向（往上抹=挑高/高远，平扫=平抽，下砍=扣杀），挥拍速度决定出球力度。触球点低于网高时会被强制托起，不会打下网。

**发球规则**：发球阶段双方都会被挡在离网一定距离外；发球必须在重置后稍作停顿、并**向前或向上**挥出才生效（向后收拍、纯站位移动不会误发球）。

---

## 联机架构

```
        房主（权威）                        访客
   ┌──────────────────┐             ┌──────────────────┐
   │ 跑完整物理模拟     │             │ 只渲染 + 预测自己  │
   │ 收到输入后结算     │  60Hz 快照   │ 收到快照后校正     │
   │ 30→60Hz 广播状态  │ ──────────► │ 球：本地物理推算   │
   │                  │ ◄────────── │ 60Hz 发送输入      │
   └──────────────────┘             └──────────────────┘
```

用到的四种网络技术：

| 技术 | 用在哪 | 解决什么 |
|---|---|---|
| **客户端预测** | 访客自己的角色 | 自己操作零延迟 |
| **本地物理推算**（dead reckoning） | 访客看到的球 | 球不再是"滞后的快照副本"，去掉约 40ms 滞后 |
| **渲染插值** | 本地/房主的画面 | 60Hz 物理 + 165Hz 显示器不再抖动 |
| **延迟补偿**（rewind） | 房主判定访客击球 | 用 `RTT/2` 前的球位做接触判定，访客不挥空 |
| **表情** | 独立旁路消息 | 不影响物理，发送方立即显示 |

### 传输选择

1. 先试 **WebRTC 直连**（延迟最低）
2. 4.5~6 秒内没连上，自动降级到 **WebSocket 中继**（走你的服务器）
3. 上次成功的通道会影响下次的等待时长，但**不会永久锁死**

> ⚠️ **实测结论**：PeerJS 内置的 TURN 服务器已失效（DNS 都解析不出），公共 TURN 也全部拿不到 relay 候选。所以国内跨省的家宽（CGNAT）**基本连不上直连**，实际都走中继。中继的延迟 = 两台机器到你服务器的距离之和，**服务器位置比任何代码优化都重要**。

---

## 调参入口

窄改一个文件的场景：

| 想改什么 | 改哪里 |
|---|---|
| 手感：重力 / 阻力 / 球拍长度 / 击球力度 / 判分 | `src/game/constants.ts` |
| 球场和球员的颜色 | `src/game/theme.ts` |
| UI 配色、圆角、阴影、动效时长 | `src/style.css` 顶部的 `:root` |
| 网络频率、延迟补偿上限 | `src/game/constants.ts` 的 `NET_*` / `LAG_COMP_*` |
| AI 难度 | `src/game/ai.ts` 的 `TUNING` |
| 摇杆死区 / 起跳阈值 | `src/game/touch.ts` 顶部 |
| 自建 TURN | 环境变量 `VITE_TURN_URL` / `VITE_TURN_USER` / `VITE_TURN_PASS` |

---

## 部署（Railway）

1. 构建命令 `npm run build`，启动命令 `npm start`（`railway.json` 已经写好）
2. `server/index.mjs` 会自动读 Railway 注入的 `$PORT`
3. **区域选择很关键**：实测 US West 时中继 RTT 约 426ms，换到 Singapore 反而涨到 828ms（Railway 的边缘节点统一从洛杉矶接入，机房搬远了等于绕路）。国内玩家建议换到**香港**的机器（免备案，约 ¥24-40/月）

如果换到香港/自建机器，整个 `npm ci && npm run build && npm start` 就跑起来了，前端和中继在同一个盒子里，**不需要改代码**。

---

## 已知限制

- **直连基本不可用**：国内家宽普遍 CGNAT，对称 NAT 打不通，只能靠中继。想拿到真正低延迟只能自建 coturn 放在靠近玩家的位置
- **手机摇杆无死区提示**：推得很轻时角色不动（死区 0.26），调 `touch.ts` 的 `DEADZONE` 可改
- **表情用系统 emoji**：Windows / 安卓 / iOS 上长得不一样，低端安卓可能出黑白。要一致就得内嵌 Twemoji SVG
- **没有观战 / 匹配 / 排行榜**：目前只有"建房 + 输入房号"
- **服务器权威只在房主浏览器**：房主关掉页面这局就结束了（没有断线重连）

---

## 未使用的依赖

`package.json` 里这两个已经没有任何代码引用，可以删：

- `howler` — 音效用的是 Web Audio 合成，没引 howler
- `playpeerjs` — 装过但没用上

另外 `src/components/HelloWorld.vue` 是脚手架残留，也可以删。
