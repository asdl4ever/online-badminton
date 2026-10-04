---
name: arena-event-differentiation
overview: 让晋级赛「同一档内的 6 个赛事」不再是 6 张同名字卡：每个赛事名固定绑定一套「场馆 + 球场主题 + 对手阵容」，报名时按它生成对手；不动模拟层、不改存档结构、不加新文件。
todos:
  - id: event-identity-table
    content: 在 game/arena.ts 新增 ArenaEvent 类型与 6 条赛事身份表及 arenaEventOf 解析函数
    status: pending
  - id: entrant-rosters
    content: 在 progress.ts 让 enterArena 先定 cupName，buildEntrants/makeRookie/rookieCosmetic 按身份生成差异化对手阵容
    status: pending
    dependencies:
      - event-identity-table
  - id: arena-view-visuals
    content: 用 [skill:ui-ux-pro-max] 定 6 种赛事身份的视觉区分，落地 ArenaView 的赛事卡、赛程头部、对局固定主题与结算海报
    status: pending
    dependencies:
      - event-identity-table
  - id: verify-and-compat
    content: 跑类型检查与本地构建，核对每档 6 场赛事的场馆/主题/对手阵容、老存档兼容、世界赛与生涯履历不受影响
    status: pending
    dependencies:
      - arena-view-visuals
      - entrant-rosters
---

## Product Overview

晋级赛馆的报名分两步：先选级别（100 赛、200 赛……总决赛），进入某一级别后再从 6 个赛事名里挑一场报名。目前**同一个级别内的这 6 场赛事除了名字之外完全一样**：同样的报名费、同样的对手、同样的场地，选哪一场都没有区别。本次要让这 6 场赛事各自拥有可辨认的「身份」。

## Core Features

- **赛事身份表**：同一级别内的 6 个赛事固定对应 6 套身份（场馆 + 球场主题 + 对手阵容），每一档都按同样的顺序循环，形成「新手村 / 快攻营 / 防守派 / 速度队 / 老将组 / 综合赛」六种风格。
- **报名卡面**：6 张赛事卡分别显示场馆名、球场主题、对手阵容标签与一句话说明，并用该赛事的主题色做色带与描边，一眼可分辨。
- **赛程页**：本届赛事头部显示「赛事名 + 场馆 + 球场主题」。
- **对局场地**：进入比赛后，球场使用该赛事绑定的固定主题（日间 / 黄昏 / 薄荷 / 夜场），且不会覆盖玩家自己设置里保存的偏好主题。
- **结算海报**：本届结束的弹窗里增加一块赛事海报（主题双色渐变 + 场馆名 + 赛事全名 + 名次）。
- **对手阵容差异**：低级别（100 赛至 400 赛）现场生成的弱手，按阵容类型重新分配五维侧重并区分装扮档次（例如快攻营进攻高防守低、老将组技术高速度慢、新手村整体偏弱）；高级别（500 赛起）从名人堂名录里优先挑出符合该阵容风格的一批人组赛。
- **强度基本持平**：同一级别内部只做维度侧重，不做明显强弱梯度，避免出现「只挑最弱那场」的最优解；卡面同时标注「对手偏弱 / 偏强」，让选择有信息依据。
- **兼容性**：不改动存档结构，正在进行中的旧一届报名数据照常读取并正确显示场馆与阵容信息。

## Tech Stack

- 复用现有栈：Vue 3 + TypeScript + Vite、Vuetify 与项目自研 `src/components/ui/` 组件、Pinia（localStorage 持久化）。
- **不新增依赖、不新增文件**：全部改动落在 3 个既有文件（`src/game/arena.ts`、`src/stores/progress.ts`、`src/views/ArenaView.vue`）。
- 不触碰模拟层：`src/game/simulation.ts`、`src/game/config.ts`、`src/game/scenes/GameScene.ts` 全部不改。

## Implementation Approach

核心策略：把「赛事名」升级为一个可解析的**赛事身份（场馆 + 主题 + 阵容）**，身份表按「在本档名字池里的下标」索引，报名时用它生成对手，展示时用它画卡面、定场地、出海报；存档只保留原有的 `tier` + `cupName`，身份靠推导得到。

1. **赛事身份表（`src/game/arena.ts`）**

- 新增 `ArenaEvent` 类型与 `ARENA_EVENTS`（6 条），以及解析函数 `arenaEventOf(tier, cupName?)`。
- 6 条身份设计（顺序即档内下标）：

    1. 新手村：场馆「社区体育馆」，主题日间，五维整体 −4（偏弱），装扮最寒酸。
    2. 快攻营：场馆「城东进攻训练馆」，主题黄昏，进攻 +10 / 防守 −6。
    3. 防守派：场馆「老城区高远球馆」，主题薄荷，防守 +10 / 进攻 −6，多穿一两件（仍只普通/稀有）。
    4. 速度队：场馆「湖畔快腿中心」，主题薄荷，速度 +8 / 弹跳 +8 / 技术 −6。
    5. 老将组：场馆「市体育馆·老将专场」，主题夜场，技术 +9 / 速度 −7，装扮更齐（仍只普通/稀有）。
    6. 综合赛：场馆「中心竞技场」，主题夜场，五维 +2（本档最难），装扮最齐。

- **关键约束**：`ARENA_TIERS[i].names` 被 `pickCupName()`、`world-arena.ts` 的 `worldCupName()`、`career.ts` 的履历共用，**结构必须保持原样**，身份表是独立的第二张表，按 `names.indexOf(name)` 取模索引（跨档重复的名字如「公开赛」「国际大师赛」因此不会错位）。总决赛名字池只有 5 个，取模后只会用到前 5 条，天然兼容。

2. **报名与对手生成（`src/stores/progress.ts`）**

- `enterArena` 调整为：先确定 `cupName`（玩家点名的赛事若不在本档名字池则随机取），再用同一个 `cupName` 调 `buildEntrants(cupId, meName, cupName)`，保证「点名的赛事」和「生成对手用的身份」永远是同一个。
- `buildEntrants(tier, meName, cupName?)`：解析身份 `ev = arenaEventOf(tier, cupName)`。
    - 低档（下标小于 `ROOKIE_TIERS`）：`makeRookie(idx, name, ev)` 在原有 `base = 28 + tierIdx * 6` 之上叠加 `ev.bias` 与小幅抖动；`rookieCosmetic(ev.gear)` 按档次决定再补翅膀/披风槽位（仍严格只从 `common` / `rare` 里挑，保持「低档不穿传说」的既有约定）。
    - 高档（500 赛起）：保留现有的切片与「最后两档必定拉上皮泽恩」逻辑不动，只在选出的候选里按 `ev.pool` 做一次**稳定优先排序**（快攻营先取 `attack` 风格、防守派先取 `defense`、速度队先取 `speed`、老将组先取 rating 最高、综合赛维持原顺序），不足再回填。**不修改名人堂球员的 stats 与 cosmetic**（那是名人堂与世界赛共享的数据）。
- 玩家自己的 `stats`、名次结算、金币/积分/荣誉/钥匙发放全部不动；只把报名成功文案改成带上场馆名。
- **`arenaRun` 结构一字不改**，因此没有存档迁移，老存档里正在进行的这一届也能正确显示新信息（`cupName` 必然来自本档名字池）。

3. **界面（`src/views/ArenaView.vue`）**

- 第二步 6 张赛事卡：用 `arenaEventOf(picked.tier, n)` 渲染场馆名、主题色带（内联 `style` 传主题色）、阵容标签 chip 与一句话说明。
- 第一步档位卡：保留原有的 `c.names.join('、')`（世界赛共用该池），下方补一行该档会遇到的 6 种阵容预览。
- 赛程页头部：在 `run.cupName` 旁补场馆与主题标签。
- 对局：`:theme` 改为该赛事的固定主题，`:auto-cycle-theme="false"`，并去掉回写 `customize.theme`（`autoCycleTheme` 为假时 `GameScene.maybeCycleTheme()` 直接返回、也不会回调 `onThemeChange`，玩家设置里的 `bmt-theme` 不会被本局覆盖）。
- 结算弹窗：加一块赛事海报（`ev.art` 双色渐变 + 场馆名 + 赛事全名 + 名次徽章）。
- 新增样式全部写在本文件已有的 `<style scoped>` 里，只使用现有 token（`--s*` / `--r-*` / `--e*` / `--text*`），**不动 `src/style.css`**。

**性能**：身份表是 6 条静态数据、查表 O(1)；`buildEntrants` 仍是 O(15) 的既有规模，高档只多一次对不超过 20 个元素的 `filter`/排序，可忽略；无新增渲染循环、无新增网络消息、无每帧计算。

## Architecture Design

沿用现有分层，不引入新架构模式；数据单向流动：

```
报名界面（档 + 赛事名）
  → progress.enterArena：先定 cupName，再用 arenaEventOf 生成对手 → 写入既有 arenaRun
  → ArenaView 从 run.tier / run.cupName 反推同一身份
     → 卡面与赛程页头部（场馆 / 主题 / 阵容）
     → 对局固定球场主题（GameCanvas 的 theme prop）
     → 结算海报（art 双色）
```

身份表是唯一事实来源（single source of truth），界面与对手生成读同一份，不重复定义；`ARENA_TIERS`、`world-arena.ts`、`career.ts` 的既有读取路径完全不受影响。

## Directory Structure

```
d:/Games/Badminton/
├─ src/game/arena.ts            [MODIFY] 赛事身份层。新增 EventPool / ArenaEvent 类型、ARENA_EVENTS（6 条：阵容标签 / 场馆 / 一句话 / theme / art 双色 / pool / 四维 bias / gear 档次）、eventIndexOf() 与 arenaEventOf(tier, cupName?)。必须按「本档 names 数组下标取模」解析，保持 ARENA_TIERS 与 names 结构不变。
│
├─ src/stores/progress.ts       [MODIFY] 报名与对手生成。enterArena 先算 cupName 再调 buildEntrants(cupId, meName, cupName)；buildEntrants 增加可选 cupName 参数并解析身份；makeRookie(tierIdx, name, ev) 叠加四维 bias；rookieCosmetic(gear) 按档次补翅膀/披风槽位（仍只 common/rare）；高档在原有候选里按 pool 做稳定优先排序且不动名人堂 stats/cosmetic；报名成功文案带场馆名。arenaRun 结构不变。
│
└─ src/views/ArenaView.vue      [MODIFY] 界面落地。第二步 6 张赛事卡加场馆行、主题色带、阵容 chip 与说明；第一步档位卡加阵容预览；赛程页头部加场馆与主题标签；对局改为赛事固定主题且 auto-cycle 关闭、不回写玩家主题偏好；结算弹窗加赛事海报；新增样式写在文件内 scoped 段（复用现有 token，不动 src/style.css）。
```

## Key Code Structures

```ts
// src/game/arena.ts（新增，节选：这是界面与对手生成共用的唯一契约）

/** 阵容类型：低档用来重塑现场弱手四维，高档用来筛名人堂阵容 */
export type EventPool = 'rookie' | 'attack' | 'defense' | 'speed' | 'veteran' | 'open';

export interface ArenaEvent {
  key: string;
  /** 阵容标签（卡面 chip）：新手村 / 快攻营 / 防守派 / 速度队 / 老将组 / 综合赛 */
  label: string;
  /** 场馆名（卡面 / 赛程页 / 海报） */
  venue: string;
  /** 一句话说明 */
  blurb: string;
  /** 该赛事固定的球场主题 */
  theme: ThemeId;
  /** 海报与色带的两个颜色（0xRRGGBB，前端转 # 使用） */
  art: [number, number];
  /** 阵容类型 */
  pool: EventPool;
  /** 四维偏移（仅低档现场弱手使用，均值约 0） */
  bias: Partial<Record<keyof PlayerStats, number>>;
  /** 装扮档次：bare = 只有帽/拍/拖尾；mixed = 再补翅膀/披风（仍只 common/rare） */
  gear: 'bare' | 'mixed';
}

/** 按「本档 names 里的下标」解析身份；越界或找不到时兜底到第 0 条 */
export function arenaEventOf(tier: string, cupName?: string): ArenaEvent;
```

## Agent Extensions

### Skill

- **ui-ux-pro-max**
- Purpose: 为 6 套赛事身份定视觉区分方案（卡面色带 / 阵容 chip / 赛程页标签 / 结算海报的层级、配色与对比度），确保 6 张卡一眼可分辨而不是只有文字不同。
- Expected outcome: 产出一套与项目现有「Soft UI Evolution 亮色 + 液态玻璃」一致、且 6 种身份互不混淆的视觉规范（色带位置、chip 样式、海报版式），落地时只使用现有 `--ui-*` / `--r-*` / `--e*` / `--text*` token，不引入新的设计语言或依赖。