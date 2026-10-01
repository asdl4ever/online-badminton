---
name: UI界面重构-交互原型与组件规范
overview: 先产出一个独立的可交互 HTML 界面原型（手机横屏、固定像素 UI、假数据、可展开/收起的右侧竖向功能坞）供确认，再按确认后的规范只重构 UI 层：统一组件尺寸 tokens、抽公共小部件、重写各页面外壳，UI 保持固定像素、游戏画面自适应铺满，不动玩法逻辑与游戏场景。
design:
  architecture:
    framework: vue
todos:
  - id: prototype-html
    content: 用 [skill:ui-ux-pro-max] 生成可交互原型 docs/ui-prototype.html：六屏切换、全部按钮组件状态、固定像素 UI、右侧坞收展、假数据
    status: completed
  - id: ui-tokens
    content: 用 [skill:design-system] 在 style.css 建 --ui-* 固定尺寸 token 层，清理 @media(pointer:coarse) 中的缩放分支，保留铺满与安全区
    status: completed
    dependencies:
      - prototype-html
  - id: page-shell
    content: 新增 PageShell 外壳组件（顶栏槽 / 画面槽 / 右侧坞槽，播放态满屏无滚动），五个游戏视图接入
    status: completed
    dependencies:
      - ui-tokens
  - id: dock-topbar
    content: 强化 SideDock 与 TopBar：固定尺寸、面板内分组与分隔、点击外部/Esc 收起、展开状态记忆，插槽 API 保持兼容
    status: completed
    dependencies:
      - ui-tokens
  - id: widgets-unify
    content: 统一各视图小部件尺寸（分段选择、状态胶囊、卖鱼/升级/建房加入、本场收益、房号输入），删除页内零散重复样式
    status: completed
    dependencies:
      - page-shell
      - dock-topbar
  - id: verify-ui
    content: 逐页核对桌面与手机横屏表现（顶栏、坞、得分行、弹窗、Toast），并运行 npm run build 验证类型与构建
    status: completed
    dependencies:
      - widgets-unify
  - id: update-docs
    content: 更新 readme：记录 UI 尺寸规范、原型文件位置与查看方式
    status: completed
    dependencies:
      - verify-ui
---

## 产品概述

对现有界面做一次「外壳与尺寸规范」层面的重构：先把当前所有按钮、组件、状态做成一个**可交互的 HTML 原型**（手机横屏、固定像素 UI、假数据）供确认，再按确认后的规范重写各页面外壳。界面形态保持"一个固定大小的区域块 + 更多选项通过右侧竖向小组件坞呈现"，游戏画面自适应铺满屏幕。

## 核心功能

- **可交互 HTML 原型**：覆盖目前全部界面元素，六个屏幕（首页 / 单机 / 联机 / 攀爬 / 钓鱼 / 采矿）可切换，用假数据演示交互。
- **固定像素 UI**：所有控件（顶栏、按钮、分段选择器、状态胶囊、坞、比分行）为固定像素尺寸，不随屏幕大小缩放、不随断点变化。
- **游戏画面自适应铺满**：画面区域在任何屏幕比例下铺满可用空间，UI 浮在其上/其外侧，不产生滚动条。
- **右侧竖向功能坞**：一个固定尺寸的小图标按钮展开/收起一列功能项，各模式的二级功能（模式、难度、摇杆编辑、表情、卖鱼、鱼竿升级、建房/加入、邀请好友、重来、连接状态、本场收益）都收纳于此。
- **顶栏固定为一条**：返回 + 标题 + 收起/展开按钮，收起后画面占满整屏，右上角留一个显眼浮标可再展开。
- **统一组件尺寸规范**：按钮三档高度、图标尺寸、间距、圆角、字号全部收敛到一套 token，删除按屏幕缩放的分支。
- **零行为改动**：玩法、物理、网络、存档逻辑与交互判定完全不变，仅调整 UI 层。

## 技术栈

- 前端：沿用现有 **Vue 3 + TypeScript + Vite + Vuetify 3**，样式继续走 `src/style.css` 的 CSS 变量 token 体系（不引入 Tailwind / 新的组件库）。
- 原型：**单文件 HTML**（内联 CSS + 原生 JS），无框架、无依赖、不参与 Vite 构建，放在仓库 `docs/` 下，用浏览器直接打开即可查看。
- 无新增依赖。

## 实施策略

分两阶段，原型先行作为确认关口：

1. **阶段一 — 可交互原型**（`docs/ui-prototype.html`）

- 用一个固定逻辑尺寸（如 1280×720）的"区域块"承载界面，内部所有控件用固定像素；外层页面可滚动以便查看。
- 顶部一组切换标签在六个屏幕间切换；每个屏幕用假数据（假比分、假金币、假鱼篓 ¥42、假房间号 7K3QM、假 RTT 68ms）演示。
- 把"游戏画面"用一个渐变占位块表示，并标注"此区域自适应铺满、UI 不缩放"，直观体现新规范。
- 覆盖清单：Button（3 变体 × 3 尺寸 + disabled）、Panel（三级高度）、TopBar（展开/收起）、SideDock（收起/展开/内部分组）、ScoreLine、StatusChip（ok/warn/idle）、Stars、SegmentedChoice、EmotePicker、Toast、弹窗（段位/外观/背包/宝箱/宠物蛋/好友）、房间号大字 + 复制按钮、房号输入框、等待转圈。
- 可加"尺寸标注"开关，点开在控件旁显示其像素高度/字号，便于确认规范。

2. **阶段二 — UI 层重构**（用户确认原型后执行）

- 在 `:root` 增加一层**尺寸 token**（`--ui-*`），统一控件高度、图标尺寸、字号、坞尺寸、顶栏高度。
- 清理 `src/style.css` 中 `@media (pointer: coarse)` 的"按断点缩放"规则（顶栏压缩、按钮 30px/11px、分段选择器隐藏 label 等），只保留：铺满规则、`touch-action: none`、安全区 `env()`、无滚动。
- 抽公共外壳 `PageShell.vue`（TopBar 槽 + 画面槽 + 右侧坞槽），五个游戏视图接入，消除各页重复的外壳 CSS。
- 强化 `SideDock.vue` / `TopBar.vue`：固定尺寸、面板内分组与分隔、点击外部或 Esc 收起、展开状态记忆（`localStorage`），插槽 API 保持向后兼容。
- 统一各视图小部件尺寸，删除页内零散样式（`fish-code` / `mine-code` / `mine-earn` 等重复定义合并到统一输入框与数值样式）。

## 关键技术决策与取舍

- **固定像素而非缩放**：确认了用户"UI 不缩放、画面铺满"的取向。代价是极小屏手机上控件偏小，换来的是所有设备一致的布局与可预期的点击热区；因此按钮最小高度不低于 36px、坞切换按钮 34px 作为下限。
- **保留右侧竖向坞形态**：现有 `SideDock` 已符合目标，重构重点是尺寸 token 化与内容分组，不换形态（避免大范围改动视图与交互习惯）。
- **原型独立于应用**：不进构建、不被路由引用，零风险；确认后再动 `src/`。
- **不做逻辑层重构**：不动 `src/game/**`、`src/net/**`、`src/stores/**`，只调整模板与样式，回归面可控。

## 实施注意事项

- `src/style.css` 中 `.page--playing .*` 系列选择器是**故意写成三层类名**的，用来压过 Vuetify/scoped 样式（scoped 样式注入顺序在后）。重写这部分时必须保持选择器权重，否则顶栏与画布铺满会失效。
- 必须保留 `env(safe-area-inset-*)` 与 `100dvh` 处理，否则刘海屏/手势条会遮挡顶栏或画面底部。
- 不要改动 `GameCanvas.vue` 的 props 与 `:key`（它由 `store.practice/difficulty` 决定重挂载）；外壳重构只搬动 DOM 结构与样式，避免触发额外实例重建。
- `SideDock` 的默认插槽是五个视图的公开契约，重构期间保持"插槽内即功能列表"的语义，各视图只做尺寸类名替换。
- 样式统一时优先新增 token 并让组件引用，避免直接写魔法数字；删除旧规则前先全局搜索确认无引用。

## 架构设计

- 组件层次：`App` → 各 `View`（外壳）→ `PageShell`（TopBar 槽 / stage 槽 / SideDock 槽）→ 复用组件（Button、StatusChip、SegmentedChoice、ScoreLine…）与业务面板（BackpackPanel 等，经 AppModal 打开）。
- 尺寸规范来源单一化：`:root` 的 `--ui-*` token 为唯一真源，组件 scoped 样式只做局部布局，不自行定义高度与字号。
- 布局原则：`PageShell` 在播放态为固定高度、无滚动的单页；非播放态（首页、联机大厅）沿用现有居中容器（`max-width`）滚动布局。

## 目录结构

```
docs/
└─ ui-prototype.html        # [NEW] 独立的可交互界面原型：六屏切换 + 全部按钮/组件/状态 + 假数据 + 尺寸标注开关。
                          #   内联 CSS/JS，固定像素 UI，右侧竖向坞可收展，不参与构建。

src/
├─ style.css                # [MODIFY] 新增 --ui-* 固定尺寸 token 层（顶栏高、按钮三档高、图标 34px、字号阶梯、坞宽）；
                          #   删除 @media (pointer: coarse) 中按断点缩放顶栏/按钮/分段选择器的规则，
                          #   保留画布铺满、touch-action、env(safe-area)、无滚动相关规则；保持 .page--playing 选择器权重。
├─ components/ui/
│  ├─ PageShell.vue         # [NEW] 统一页面外壳：接收 TopBar 插槽、画面（stage）插槽、右侧 SideDock 插槽，
│  │                       #   统一页面 padding、播放态满屏无滚动、非播放态居中容器；避免各视图重复外壳样式。
│  ├─ SideDock.vue          # [MODIFY] 尺寸 token 化（toggle 34px、面板宽 200px）、面板内分组标题与分隔线、
│  │                       #   点击外部/Esc 收起、展开状态记忆；保持默认插槽语义不变。
│  ├─ TopBar.vue            # [MODIFY] 固定高度与标题字号走 token；收起态浮标尺寸统一；保持 back/title/aside 插槽。
│  ├─ Button.vue            # [MODIFY] 三档高度（sm 36 / md 44 / lg 52）与内边距、字号收敛到 token，禁用态样式统一。
│  ├─ SegmentedChoice.vue   # [MODIFY] 紧凑变体固定尺寸（轨道 30px、选项字号 13px），不再依赖断点媒体查询压缩。
│  ├─ StatusChip.vue        # [MODIFY] 固定高度 24px、字号 12px，三种 tone 颜色沿用现有语义色。
│  └─ ScoreLine.vue         # [MODIFY] 底部比分行固定高度与字号，手机端不再整行隐藏（改为可选紧凑态）。
└─ views/
   ├─ SingleView.vue        # [MODIFY] 接入 PageShell；模式/难度分段、摇杆按钮移入坞并统一尺寸。
   ├─ OnlineView.vue        # [MODIFY] 接入 PageShell；表情/摇杆/状态/邀请好友移入坞；大厅面板尺寸对齐 token。
   ├─ ClimbView.vue         # [MODIFY] 接入 PageShell（重来按钮入坞）。
   ├─ FishView.vue          # [MODIFY] 接入 PageShell；卖鱼/鱼竿升级/房号输入/建房/加入统一为固定尺寸小部件。
   ├─ MineView.vue          # [MODIFY] 接入 PageShell；本场收益与共建房/加入控件统一尺寸。
   └─ HomeView.vue          # [MODIFY] 六个模式按钮与右上工具坞尺寸对齐 token（布局不变）。

readme.md                    # [MODIFY] 记录 UI 尺寸规范、原型文件位置与查看方式。
```

## 关键代码结构

固定像素尺寸 token（唯一真源，放在 `:root` 现有 token 之后）：

```css
:root {
  /* control heights are fixed pixels: the UI never scales with the screen */
  --ui-bar-h: 44px;        /* top bar */
  --ui-dock-w: 200px;      /* right rail panel width */
  --ui-icon: 34px;         /* dock toggle / icon button */
  --ui-btn-sm: 36px;
  --ui-btn-md: 44px;
  --ui-btn-lg: 52px;
  --ui-chip-h: 24px;
  --ui-font-xs: 12px;
  --ui-font-sm: 13px;
  --ui-font-md: 15px;
  --ui-font-lg: 17px;
}
```

`PageShell` 对外契约（三个插槽，视图只声明自己的小部件）：

```ts
// props: playing?: boolean  —— 播放态为满屏无滚动的单页
// slots: #topbar / #stage / #dock
```

## Agent Extensions

### Skill

- **ui-ux-pro-max**
- Purpose: 为固定像素 UI 原型与后续组件规范提供布局、可点击热区、字体与配色的校验依据（手机横屏 HUD 场景）。
- Expected outcome: 原型与重构后的组件尺寸/间距符合可用性基线（最小触控 36px 等），并给出手机横屏下的层级与可读性检查结论。
- **design-system**
- Purpose: 设计三层 token 架构（primitive → semantic → component），把现有 `:root` 变量扩展成包含 `--ui-*` 尺寸层的完整体系。
- Expected outcome: `style.css` 中形成单一真源的尺寸/字号/圆角 token 表，组件全部引用 token，附带组件尺寸规格说明可直接指导重构。