<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from './ui/Button.vue';
import {
  BRANCH_COST,
  MASTERY_BRANCH_LEVEL,
  MASTERY_MAX_LEVEL,
  SKILLS,
  SKILL_SLOTS,
  SKILL_SYNERGIES,
  SKILL_BY_ID,
  branchAwakenOf,
  masteryLevel,
  masteryProgress,
  skillBranches,
  skillCost,
  skillStar,
  familyOf,
  type SkillId,
  type SkillMeta,
} from '../game/skills';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';

/**
 * 🥋 **招式背包**：招式按「**星级 + 格子**」排布，点一格看详情。
 * 招式都是**局内主动**（手机有按钮、桌面按 1/2/3）——永久数值成长归「锻炼」，
 * 这里只管打法搭配。解锁靠多种途径 + 📜秘籍，分支/质变靠熟练度 + 🪙。
 */
const progress = useProgressStore();

const owned = (id: SkillId): boolean => progress.unlockedSkills.includes(id);
const equipped = (id: SkillId): boolean => progress.equippedSkills.includes(id);
const availOf = (id: SkillId): { ok: boolean; need: string } => progress.skillAvailable(id);
const costOf = (m: SkillMeta): number => skillCost(m);
const starOf = (m: SkillMeta): number => skillStar(m);
const mLevel = (id: SkillId): number => masteryLevel(progress.skillMastery[id] ?? 0);
const mProg = (id: SkillId): number => masteryProgress(progress.skillMastery[id] ?? 0);
const branchId = (id: SkillId): string | undefined => progress.skillBranch[id];

const STAR_COLORS = ['#9aa0a6', '#7aa85a', '#4a90d9', '#a86ce0', '#f0a020'];
const starColor = (n: number): string => STAR_COLORS[Math.max(1, Math.min(5, n)) - 1];
const kindLabel = (m: SkillMeta): string => (m.kind === 'passive' ? '被动' : '主动');

const selected = ref<SkillId>('charge');

/** 分类页签 + 搜索（技能一多，扁平列表翻起来太累） */
const GROUPS = [
  { id: 'all', label: '全部' },
  { id: 'attack', label: '进攻' },
  { id: 'defense', label: '防守' },
  { id: 'mobility', label: '移动' },
  { id: 'technique', label: '技术' },
  { id: 'stamina', label: '体力' },
  { id: 'fun', label: '趣味' },
] as const;
const tab = ref<string>('all');
const q = ref('');
const filtered = computed<SkillMeta[]>(() =>
  SKILLS.filter(
    (s) =>
      (tab.value === 'all' || s.group === tab.value) &&
      (!q.value || s.name.includes(q.value) || s.id.includes(q.value)),
  ),
);
const metSynergy = (skills: SkillId[]): boolean => skills.every((k) => equipped(k));

/** 把当前筛选结果按「母招族」分组（树式展示：族头 + 成员格子） */
const grouped = computed(() => {
  const byFam = new Map<string, SkillMeta[]>();
  for (const s of filtered.value) {
    const fid = familyOf(s.id).id;
    if (!byFam.has(fid)) byFam.set(fid, []);
    byFam.get(fid)!.push(s);
  }
  return [...byFam.entries()].map(([, items]) => ({ fam: familyOf(items[0].id), items }));
});
const sel = computed<SkillMeta>(() => SKILL_BY_ID[selected.value]);
/** 已选分支（对象） + 是否已觉醒质变 */
const selBranch = computed(() => {
  const bid = branchId(sel.value.id);
  if (!bid) return null;
  return skillBranches(sel.value).find((b) => b.id === bid) ?? null;
});
const selAwaken = computed(() => {
  const bid = branchId(sel.value.id);
  if (!bid) return null;
  const aw = branchAwakenOf(sel.value, bid, progress.skillMastery[sel.value.id] ?? 0);
  const branch = skillBranches(sel.value).find((b) => b.id === bid);
  return { def: branch?.awaken ?? null, awakened: !!aw };
});

function select(id: SkillId): void {
  selected.value = id;
}
function selectSlot(i: number): void {
  const id = progress.equippedSkills[i - 1];
  if (id) select(id);
}

function toggleEquip(id: SkillId): void {
  if (!owned(id)) return;
  const cur = progress.equippedSkills.slice();
  const i = cur.indexOf(id);
  if (i >= 0) cur.splice(i, 1);
  else {
    if (cur.length >= SKILL_SLOTS) return toastWarn(`最多携带 ${SKILL_SLOTS} 个招式——先卸一个`);
    cur.push(id);
  }
  progress.setSkillLoadout(cur);
}
function tryUnlock(id: SkillId): void {
  const r = progress.unlockSkill(id);
  if (r.ok) toastGood(r.message);
  else toastWarn(r.message);
}
function exchange(): void {
  const r = progress.buyScroll(300);
  if (r.ok) toastGood(r.message);
  else toastWarn(r.message);
}
function pickBranch(id: SkillId, bid: string): void {
  const r = progress.chooseSkillBranch(id, bid);
  if (r.ok) toastGood(r.message);
  else toastWarn(r.message);
}
</script>

<template>
  <div class="skillbag">
    <p class="muted skillbag__hint">
      🥋 招式是局内打法：点按钮（手机）或按 1 / 2 / 3（桌面）才发动，只在单机 / PvE
      对局内生效；永久属性成长去「锻炼」练（每维 Lv5 / Lv8 送功底）。
    </p>
    <div class="skillbag__top">
      <div class="slots">
        <div
          v-for="i in SKILL_SLOTS"
          :key="i"
          class="slot"
          :class="{ 'is-empty': !progress.equippedSkills[i - 1] }"
          @click="selectSlot(i)"
        >
          <span class="slot__key">{{ i }}</span>
          <template v-if="progress.equippedSkills[i - 1]">
            <span class="slot__icon">{{ SKILL_BY_ID[progress.equippedSkills[i - 1]].icon }}</span>
            <span class="slot__name">{{ SKILL_BY_ID[progress.equippedSkills[i - 1]].name }}</span>
          </template>
          <span v-else class="slot__empty">空槽 · 键{{ i }}</span>
        </div>
      </div>
      <div class="wallet">
        <span class="wallet__n num">📜 {{ progress.scrolls }} · 🪙 {{ progress.coins }}</span>
        <Button size="sm" variant="quiet" @click="exchange">🪙300 换 1 本</Button>
      </div>
    </div>

    <div class="skillbag__body">
      <!-- 详情 -->
      <div class="detail" :class="{ 'is-locked': !availOf(sel.id).ok && !owned(sel.id) }">
        <div class="detail__head">
          <span class="detail__icon" :style="{ background: `${starColor(starOf(sel))}22`, borderColor: starColor(starOf(sel)) }">
            {{ sel.icon }}
          </span>
          <div class="detail__meta">
            <div class="detail__name">
              {{ sel.name }}
              <span class="detail__kind" :class="{ pk: sel.kind === 'passive' }">{{ kindLabel(sel) }}</span>
            </div>
            <div class="detail__stars">
              <span v-for="n in 5" :key="n" :style="{ color: n <= starOf(sel) ? starColor(starOf(sel)) : 'var(--line)' }">★</span>
              <span class="detail__state">
                {{ equipped(sel.id) ? '· 已装备' : owned(sel.id) ? '· 已拥有' : availOf(sel.id).ok ? '· 可解锁' : '· 未解锁' }}
              </span>
            </div>
          </div>
        </div>

        <p class="detail__how">{{ sel.how }}</p>
        <p class="muted detail__fx">{{ sel.effect }}</p>

        <template v-if="owned(sel.id)">
          <div class="mastery">
            <div class="mastery__bar"><i :style="{ width: `${Math.round(mProg(sel.id) * 100)}%` }" /></div>
            <span class="mastery__lv num">熟练 {{ mLevel(sel.id) }}/{{ MASTERY_MAX_LEVEL }}</span>
          </div>

          <div class="branch">
            <div class="branch__title">分支强化</div>
            <div v-if="selBranch" class="branch__on">
              已选：<b>{{ selBranch.name }}</b>
              <div v-if="selAwaken?.def" class="awaken" :class="{ 'is-on': selAwaken.awakened }">
                🧬 质变「{{ selAwaken.def.name }}」：{{ selAwaken.def.desc }}
                <span v-if="!selAwaken.awakened" class="muted">（熟练 {{ selAwaken.def.at }} 级觉醒）</span>
                <span v-else class="awaken__on">已觉醒</span>
              </div>
            </div>
            <template v-else-if="mLevel(sel.id) >= MASTERY_BRANCH_LEVEL">
              <Button
                v-for="b in skillBranches(sel)"
                :key="b.id"
                size="sm"
                variant="quiet"
                block
                :disabled="progress.coins < (b.cost ?? BRANCH_COST)"
                @click="pickBranch(sel.id, b.id)"
              >
                <span class="branch__bname">{{ b.name }} · 🪙{{ b.cost ?? BRANCH_COST }}</span>
                <span class="muted">{{ b.desc }}<template v-if="b.awaken"> · 🧬{{ b.awaken.name }}</template></span>
              </Button>
            </template>
            <div v-else class="muted branch__hint">
              熟练到 {{ MASTERY_BRANCH_LEVEL }} 级可花金币选分支；熟练度到质变档后，
              这一招发动时更猛、冷却 -10%、持续 +15%
            </div>
          </div>

          <Button variant="primary" block @click="toggleEquip(sel.id)">
            {{ equipped(sel.id) ? '卸下' : '装备到携带槽' }}
          </Button>
        </template>

        <template v-else-if="availOf(sel.id).ok">
          <Button variant="primary" block :disabled="progress.scrolls < costOf(sel)" @click="tryUnlock(sel.id)">
            花 {{ costOf(sel) ? `📜${costOf(sel)}` : '（免费）' }} 解锁
          </Button>
          <div class="muted branch__hint" style="margin-top: 6px">
            还差 {{ Math.max(0, costOf(sel) - progress.scrolls) }} 本秘籍（周赛首通 / 竞技夺冠 / 金币兑换）
          </div>
        </template>

        <div v-else class="detail__locked">🔒 解锁条件：{{ availOf(sel.id).need }}</div>
      </div>

      <!-- 背包格 -->
      <div class="gridwrap">
        <div class="filters">
          <div class="tabs">
            <button
              v-for="g in GROUPS"
              :key="g.id"
              type="button"
              class="tab"
              :class="{ 'is-on': tab === g.id }"
              @click="tab = g.id"
            >
              {{ g.label }}
            </button>
          </div>
          <input v-model="q" class="search" type="text" placeholder="搜索招式…" />
        </div>

        <div class="grid">
          <template v-for="grp in grouped" :key="grp.fam.id">
            <div class="famhead">
              {{ grp.fam.icon }} {{ grp.fam.name }}
              <span class="muted famhead__n">{{ grp.items.length }}</span>
            </div>
            <button
              v-for="s in grp.items"
              :key="s.id"
              class="cell"
              type="button"
              :class="{
                'is-sel': selected === s.id,
                'is-locked': !availOf(s.id).ok && !owned(s.id),
                'is-owned': owned(s.id),
                'is-on': equipped(s.id),
              }"
              :style="{ '--star': starColor(starOf(s)) }"
              @click="select(s.id)"
            >
              <span v-if="equipped(s.id)" class="cell__slot">带</span>
              <span v-else-if="!owned(s.id)" class="cell__lock">{{ availOf(s.id).ok ? '可解' : '🔒' }}</span>
              <span class="cell__icon">{{ s.icon }}</span>
              <span class="cell__name">{{ s.name }}</span>
              <span class="cell__stars"><span v-for="n in 5" :key="n" :class="{ dim: n > starOf(s) }">★</span></span>
            </button>
          </template>
        </div>

        <!-- 🔗 套装协同：凑齐指定招式触发额外被动 -->
        <div class="syn">
          <div class="syn__title">🔗 套装协同</div>
          <div class="syn__list">
            <span
              v-for="sy in SKILL_SYNERGIES"
              :key="sy.id"
              class="syn__chip"
              :class="{ 'is-on': metSynergy(sy.skills) }"
              :title="sy.desc"
            >
              {{ sy.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skillbag {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}
.skillbag__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
.skillbag__top {
  display: flex;
  align-items: center;
  gap: var(--s3);
}
.slots {
  flex: 1;
  display: flex;
  gap: var(--s2);
  min-width: 0;
}
.slot {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface);
  cursor: pointer;
}
.slot.is-empty {
  border-style: dashed;
  justify-content: center;
  cursor: default;
}
.slot__key {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--surface-2, #f1efe9);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
}
.slot__icon {
  font-size: 16px;
}
.slot__name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.slot__empty {
  font-size: 12px;
  color: var(--text-dim);
}
.wallet {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.wallet__n {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.skillbag__body {
  display: flex;
  gap: var(--s3);
  align-items: flex-start;
}
.detail {
  flex: 0 0 232px;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
}
.detail__head {
  display: flex;
  gap: var(--s2);
  align-items: center;
}
.detail__icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 26px;
  border-radius: var(--r-md);
  border: 1.5px solid var(--line);
}
.detail__name {
  font-size: 15px;
  font-weight: 700;
}
.detail__kind {
  margin-left: 6px;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  vertical-align: middle;
}
.detail__kind.pk {
  background: #6a7a9a;
}
.detail__stars {
  font-size: 13px;
  letter-spacing: 1px;
}
.detail__state {
  margin-left: 6px;
  font-size: 11px;
  color: var(--text-dim);
}
.detail__how {
  font-size: 13px;
  margin: 0;
}
.detail__fx {
  font-size: 12px;
  margin: 0;
}
.mastery {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mastery__bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;
}
.mastery__bar i {
  display: block;
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
}
.mastery__lv {
  font-size: 11px;
  color: var(--text-dim);
  white-space: nowrap;
}
.branch {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 6px;
  border-top: 1px solid var(--line);
}
.branch__title {
  font-size: 12px;
  font-weight: 700;
}
.branch__on {
  font-size: 12px;
  color: var(--accent);
}
.branch__bname {
  font-weight: 700;
}
.awaken {
  margin-top: 4px;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: var(--r-sm, 6px);
  background: var(--surface-2, #f6f4ef);
  color: var(--text-dim);
}
.awaken.is-on {
  color: #a86ce0;
  background: color-mix(in srgb, #a86ce0 12%, var(--surface));
}
.awaken__on {
  margin-left: 4px;
  font-weight: 700;
}
.branch__hint {
  font-size: 11px;
}
.detail__locked {
  font-size: 12px;
  color: var(--text-dim);
}
.grid {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}
.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px 6px;
  border-radius: var(--r-md);
  border: 1.5px solid color-mix(in srgb, var(--star, #999) 45%, var(--line));
  background: color-mix(in srgb, var(--star, #999) 8%, var(--surface));
  cursor: pointer;
}
.cell.is-locked {
  opacity: 0.5;
  filter: grayscale(0.6);
}
.cell.is-sel {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.cell.is-on {
  border-color: var(--accent);
}
.cell__icon {
  font-size: 24px;
  line-height: 1.1;
}
.cell__name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.cell__stars {
  font-size: 10px;
  color: var(--star, #999);
}
.cell__stars .dim {
  color: var(--line);
}
.cell__slot,
.cell__lock {
  position: absolute;
  top: 3px;
  right: 4px;
  font-size: 9px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  line-height: 14px;
}
.cell__lock {
  background: transparent;
  color: var(--text-dim);
}

.gridwrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filters {
  display: flex;
  align-items: center;
  gap: var(--s2);
}
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.tab {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  font-size: 12px;
  color: var(--text-dim);
  cursor: pointer;
}
.tab.is-on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.search {
  flex: none;
  width: 120px;
  padding: 4px 8px;
  border-radius: var(--r-sm, 6px);
  border: 1px solid var(--line);
  background: var(--surface);
  font-size: 12px;
  color: var(--text);
}
.syn {
  border-top: 1px solid var(--line);
  padding-top: 6px;
}
.syn__title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}
.syn__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.syn__chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px dashed var(--line);
  color: var(--text-dim);
}
.syn__chip.is-on {
  border-style: solid;
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--surface));
}
.famhead {
  grid-column: 1 / -1;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  padding: 4px 0 1px;
  border-bottom: 1px solid var(--line);
}
.famhead__n {
  font-weight: 400;
}
</style>
