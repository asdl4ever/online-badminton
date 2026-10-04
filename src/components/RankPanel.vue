<script setup lang="ts">
import { useProgressStore } from '../stores/progress';
import { POINT_RULES, TIERS, titleForPoints, type TierId } from '../game/ranks';
import { ARENA_TIERS } from '../game/arena';
import { toHex } from '../game/cosmetics';
import { celebrate } from '../composables/celebrate';
import { toastGood } from '../composables/useToast';
import Button from './ui/Button.vue';

const progress = useProgressStore();

function claim(id: TierId): void {
  const tier = TIERS.find((t) => t.id === id);
  progress.claim(id);
  if (!tier) return;
  toastGood(`已领取：${tier.reward}`);
  celebrate(1, [toHex(tier.color), '#ffffff', '#ffd45c']);
}
</script>

<template>
  <div class="rp">
    <div class="rp__head">
      <div class="rp__badge" :style="{ background: toHex(progress.tier.color) }">
        {{ progress.tier.glyph }}
      </div>
      <div class="rp__info">
        <div class="rp__tier">
          {{ progress.tier.label }}
          <span class="muted num">{{ progress.points }} 分</span>
          <span class="rp__title">「{{ titleForPoints(progress.points) }}」</span>
        </div>
        <div class="rp__bar">
          <span
            class="rp__bar-fill"
            :style="{ width: `${progress.progress * 100}%`, background: toHex(progress.tier.color) }"
          />
        </div>
        <div class="muted rp__next">
          {{
            progress.next
              ? `距离 ${progress.next.label} 还差 ${progress.next.points - progress.points} 分`
              : '已达最高组别'
          }}
        </div>
      </div>
    </div>

    <ul class="rp__list">
      <li
        v-for="t in TIERS"
        :key="t.id"
        class="rp__item"
        :class="{ 'is-locked': progress.points < t.points }"
      >
        <span class="rp__dot" :style="{ background: toHex(t.color) }">{{ t.glyph }}</span>
        <div class="rp__item-body">
          <div class="rp__item-name">
            {{ t.label }} <span class="muted num">{{ t.points }} 分</span>
          </div>
          <div class="muted rp__reward">{{ t.reward }}</div>
        </div>
        <Button v-if="progress.isClaimed(t.id)" size="sm" variant="quiet" disabled>
          已领取
        </Button>
        <Button
          v-else-if="progress.points >= t.points"
          size="sm"
          variant="primary"
          @click="claim(t.id)"
        >
          领取
        </Button>
        <span v-else class="rp__need num">还差 {{ t.points - progress.points }}</span>
      </li>
    </ul>

    <p class="muted rp__note">
      联机胜 +{{ POINT_RULES.online.win }} / 负 +{{ POINT_RULES.online.lose }}，单机胜 +{{
        POINT_RULES.single.win
      }}
      / 负 +{{ POINT_RULES.single.lose }}。积分只存在本机；杯赛按积分逐档解锁，赛季每月清零。
    </p>

    <!-- 奖杯柜：各杯赛的前三名陈列（原首页已移除，挪到这块荣誉面板里） -->
    <div class="rp__trophies">
      <h4 class="rp__trophies-title">🏆 奖杯柜</h4>
      <div class="trophies">
        <div
          v-for="c in ARENA_TIERS"
          :key="c.tier"
          class="trophy"
          :class="{ 'is-empty': !progress.trophies[c.tier] }"
        >
          <div class="trophy__cup">
            <template v-if="progress.trophies[c.tier]">
              <span v-if="progress.trophies[c.tier].champion" class="trophy__big">🏆</span>
              <span v-else-if="progress.trophies[c.tier].runner" class="trophy__big">🥈</span>
              <span v-else class="trophy__big">🥉</span>
            </template>
            <span v-else class="trophy__big is-dim">🏆</span>
          </div>
          <div class="trophy__name">{{ c.glyph }} {{ c.label }}</div>
          <div v-if="progress.trophies[c.tier]" class="trophy__count num">
            <span v-if="progress.trophies[c.tier].champion">冠×{{ progress.trophies[c.tier].champion }}</span>
            <span v-if="progress.trophies[c.tier].runner">亚×{{ progress.trophies[c.tier].runner }}</span>
            <span v-if="progress.trophies[c.tier].third">季×{{ progress.trophies[c.tier].third }}</span>
          </div>
          <div v-else class="muted trophy__none">暂无奖杯</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rp__head {
  display: flex;
  gap: var(--s4);
  align-items: center;
}

.rp__badge {
  flex: none;
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #1b2740;
  font-weight: 700;
  font-size: 18px;
  box-shadow: inset 0 -6px 0 rgba(0, 0, 0, 0.12);
}

.rp__info {
  flex: 1 1 auto;
  min-width: 0;
}

.rp__tier {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  gap: var(--s3);
  align-items: baseline;
  flex-wrap: wrap;
}

.rp__title {
  font-size: 14px;
  color: var(--accent);
}

.rp__bar {
  height: 8px;
  margin: var(--s2) 0;
  border-radius: var(--r-pill);
  background: var(--surface-2);
  border: 1px solid var(--line);
  overflow: hidden;
}

.rp__bar-fill {
  display: block;
  height: 100%;
  transition: width 0.3s ease;
}

.rp__next {
  font-size: 12px;
}

.rp__list {
  list-style: none;
  margin: var(--s5) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.rp__item {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.rp__item.is-locked {
  opacity: 0.6;
}

.rp__dot {
  flex: none;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #1b2740;
  font-size: 13px;
  font-weight: 700;
}

.rp__item-body {
  flex: 1 1 auto;
  min-width: 0;
}

.rp__item-name {
  font-size: 14px;
  color: var(--text);
}

.rp__reward {
  font-size: 12px;
}

.rp__need {
  font-size: 12px;
  color: var(--text-dim);
  flex: none;
}

.rp__note {
  margin-top: var(--s4);
  font-size: 12px;
}

/* --- 奖杯柜（从首页搬过来） -------------------------------------------------- */
.rp__trophies {
  margin-top: var(--s5);
  padding-top: var(--s4);
  border-top: 1px solid var(--line);
}

.rp__trophies-title {
  margin: 0 0 var(--s3);
  font-size: 14px;
}

.trophies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--s3);
}

.trophy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--s3) var(--s2);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface-2);
  text-align: center;
}

.trophy.is-empty {
  opacity: 0.55;
}

.trophy__big {
  font-size: 26px;
  line-height: 1;
}

.trophy__big.is-dim {
  filter: grayscale(1);
  opacity: 0.4;
}

.trophy__name {
  font-size: 12px;
  font-weight: 700;
}

.trophy__count {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.trophy__none {
  font-size: 11px;
}
</style>
