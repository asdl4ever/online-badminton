---
name: chest-economy-rebalance
overview: 宝箱经济调整：CHEST_COST 120 → 400（十连自动变为 3600），完全移除金币袋掉落（每次必出装扮），保底 10 抽不变、稀有度权重不变，并清理相关死代码与文案。
todos:
  - id: items-cost
    content: 修改 src/game/items.ts：CHEST_COST 改为 400，删除 COIN_DROP_CHANCE 与 COIN_DROP_RANGE
    status: completed
  - id: progress-remove-coinbag
    content: 修改 src/stores/progress.ts：删除 rollOne 金币袋分支，PullResult 移除 coins 变体与无用 import
    status: completed
    dependencies:
      - items-cost
  - id: chestpanel-cleanup
    content: 修改 src/components/ChestPanel.vue：删除金币袋渲染分支、import 与说明文案
    status: completed
    dependencies:
      - progress-remove-coinbag
  - id: readme-sync
    content: 更新 README.md 宝箱获取途径描述，核对调参入口表
    status: completed
    dependencies:
      - chestpanel-cleanup
---

## 用户需求

宝箱经济调整，解决「装扮太廉价」的问题。经澄清确认的最终方案：

## 方案（用户已确认）

1. **只涨价**：`CHEST_COST` 从 120 调到 400，十连价 `TEN_PULL_COST` 由现有公式（10 倍打九折）自动派生为 3600，不做多档宝箱。
2. **取消金币袋**：移除宝箱 15% 概率开出金币袋（40~120 金币）的机制，每次抽取必出装扮。
3. **保底与掉率不变**：`PITY_LIMIT = 10`（10 抽保底史诗+）、稀有度权重（普通 58 / 稀有 28 / 史诗 11 / 传说 3）均不动。

## 涉及范围

- 价格常量与金币袋掉落逻辑（`items.ts`、`progress.ts`）
- 宝箱面板的 UI 与文案（`ChestPanel.vue`）
- README 中对外观获取途径的描述同步更新

## 收入端不动

联机赢 40 / 输 15、单机赢 15 / 输 5、采矿 5~80/矿等金币来源均不调整。

## Tech Stack

- 现有项目：Vue 3 + TypeScript + Pinia（`useLocalStorage` 持久化）
- 改动全部在常量与既有函数内部，无新依赖、无新文件

## Implementation Approach

- **价格**：只改 `src/game/items.ts` 的 `CHEST_COST = 400`；`TEN_PULL_COST` 是派生常量（`Math.round(CHEST_COST * 10 * 0.9)`），自动变为 3600，无需改动。
- **取消金币袋**：
- 删除 `items.ts` 中 `COIN_DROP_CHANCE` 与 `COIN_DROP_RANGE` 两个常量。
- `src/stores/progress.ts` 的 `rollOne()` 删除开头的金币袋分支（`if (!floor && Math.random() < COIN_DROP_CHANCE) ...`），`!floor` 条件随之消失；保底补抽逻辑（`floor === 'epic'`）不受影响。
- `PullResult` 联合类型删除 `{ kind: 'coins'; amount }` 变体，只保留 `{ kind: 'item'; item; duplicate; refund }`。
- `ChestPanel.vue` 删除 `COIN_DROP_CHANCE` 的 import、单抽结果卡与十连格子中金币袋的渲染分支、底部说明文案中「金币袋」的表述。
- **保底与掉率**：`PITY_LIMIT`、`RARITY_META` 权重均不修改。
- **README**：更新「获取途径：宝箱」一句（移除金币袋相关暗示），并在调参入口表核对 `CHEST_COST` 相关行仍准确。

## 架构影响

纯数值与死代码清理，改动集中在 3 个源文件 + README；`canSingle` / `canTen` 等判断都基于常量，UI 价格显示自动跟随，无行为回归风险。存档兼容：旧存档中的 `bmt-pity` 计数继续有效，无迁移需求。