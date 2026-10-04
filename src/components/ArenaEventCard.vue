<script setup lang="ts">
import { computed } from 'vue';
import Button from './ui/Button.vue';
import { toHex } from '../game/cosmetics';
import { STYLE_META } from '../game/ai';
import { EVENT_POWER_LABEL, type ArenaEvent } from '../game/arena-events';
import { fmtClock, fmtDelay, type EventPhase } from '../game/arena-schedule';

/**
 * 晋级赛的一张「赛程牌」。
 *
 * 同一档里的 6 场赛事靠它一眼区分：顶部身份色带 + 场馆名 + 阵容胶囊 + 一条时刻行 +
 * 底部主按钮。三种状态（未开赛 / 报名中 / 已结束）共用一套骨架，只换时刻行与按钮，
 * 所以纵向扫一眼就能看出「现在能打哪几场」。
 *
 * 身份色只出现在色带、圆点与胶囊描边上——文字始终用主题的深色，保证对比度
 * （六种身份色里有很浅的（如 #D9EBC9），当文字色会读不清）。
 * 倒计时只做视觉呈现（`aria-hidden`），屏幕阅读器读的是旁边那句静态状态文案。
 */
const props = defineProps<{
  /** 赛事名（「萌芽杯」） */
  name: string;
  /** 身份（场馆 / 阵容 / 主题色 / 说明） */
  event: ArenaEvent;
  /** 本场现在处于哪个阶段 */
  phase: EventPhase;
  /** 距开赛还有多少毫秒（phase = upcoming） */
  startIn: number;
  /** 距报名截止还有多少毫秒（phase = open） */
  closeIn: number;
  /** 距下一场开赛还有多少毫秒（phase = closed） */
  nextIn: number;
  /** 该档位的冷却剩余毫秒（0 = 不在冷却） */
  cooldownIn: number;
  /** 报名费 */
  fee: number;
  /** 这一档是不是已经预约了这一场 */
  booked: boolean;
  /** 积分不够（锁定） */
  locked: boolean;
  /** 锁定时要补的积分 */
  lockedPoints: number;
}>();

const emit = defineEmits<{ signup: []; book: []; cancel: [] }>();

const band = computed(
  () => `linear-gradient(90deg, ${toHex(props.event.art[0])}, ${toHex(props.event.art[1])})`,
);
const dot = computed(() => toHex(props.event.art[0]));
/** 胶囊底色：身份色兑白，保证深色文字仍然对比充足 */
const tagStyle = computed(() => ({
  background: `color-mix(in srgb, ${dot.value} 16%, #ffffff)`,
  borderColor: `color-mix(in srgb, ${dot.value} 45%, #ffffff)`,
}));

const powerTone = computed(
  () =>
    ({ weak: 'is-weak', even: 'is-even', strong: 'is-strong' })[props.event.power],
);

/** 主按钮是否可用（不在冷却、不在锁定、且在报名窗口内） */
const canSignup = computed(
  () => props.phase === 'open' && props.cooldownIn <= 0 && !props.locked,
);
</script>

<template>
  <div
    class="evc"
    :class="{ 'is-open': phase === 'open' && cooldownIn <= 0, 'is-booked': booked }"
    role="group"
    :aria-label="`${name} · ${event.venue} · ${event.label}`"
  >
    <div class="evc__band" :style="{ background: band }">
      <span v-if="phase === 'open' && cooldownIn <= 0" class="evc__pulse" />
    </div>

    <div class="evc__top">
      <span class="evc__dot" :style="{ background: dot }" />
      <span class="evc__venue">{{ event.venue }}</span>
    </div>

    <div class="evc__name">{{ name }}</div>

    <div class="evc__tags">
      <span class="evc__tag" :style="tagStyle">{{ event.label }}</span>
      <span class="evc__style" :style="{ color: STYLE_META[event.style].color }">
        {{ STYLE_META[event.style].label }}
      </span>
      <span class="evc__power" :class="powerTone">{{ EVENT_POWER_LABEL[event.power] }}</span>
    </div>

    <div class="evc__faces" aria-hidden="true">
      <span v-for="e in event.emojis" :key="e" class="evc__face">{{ e }}</span>
    </div>

    <p class="evc__blurb">{{ event.blurb }}</p>

    <!-- 时刻行：视觉给倒计时，无障碍读的是左边那句静态状态 -->
    <div class="evc__time">
      <span v-if="cooldownIn > 0" class="evc__state">该档冷却中</span>
      <span v-else-if="booked" class="evc__state">已预约</span>
      <span v-else-if="phase === 'upcoming'" class="evc__state">未开赛</span>
      <span v-else-if="phase === 'open'" class="evc__state is-live">报名中</span>
      <span v-else class="evc__state">本场已结束</span>

      <span class="evc__count num" aria-hidden="true">
        <template v-if="cooldownIn > 0">{{ fmtClock(cooldownIn) }}</template>
        <template v-else-if="phase === 'upcoming'">{{ fmtClock(startIn) }} 后开赛</template>
        <template v-else-if="phase === 'open'">{{ fmtClock(closeIn) }} 截止</template>
        <template v-else>{{ fmtClock(nextIn) }} 后下一场</template>
      </span>
    </div>

    <div class="evc__foot">
      <template v-if="locked">
        <Button block disabled>🔒 还差 {{ lockedPoints }} 分</Button>
      </template>
      <template v-else-if="booked">
        <div class="evc__booked">
          <span class="evc__booked-text">到点自动开赛</span>
          <Button size="sm" variant="quiet" @click="emit('cancel')">取消</Button>
        </div>
      </template>
      <template v-else-if="cooldownIn > 0">
        <Button block disabled>冷却中</Button>
      </template>
      <template v-else-if="phase === 'upcoming'">
        <Button
          block
          :title="`预约「${name}」，开赛时自动报名（${fmtDelay(startIn)}后）`"
          @click="emit('book')"
        >
          ⏰ 预约
        </Button>
      </template>
      <template v-else-if="canSignup">
        <Button block variant="primary" @click="emit('signup')">
          报名「{{ name }}」 · 🪙{{ fee }}
        </Button>
      </template>
      <template v-else>
        <Button block disabled>本场已结束</Button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.evc {
  flex: none;
  width: 224px;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: 0 0 var(--s3);
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e2);
  overflow: hidden;
  transition:
    transform var(--dur-1, 0.15s) var(--ease, ease),
    border-color var(--dur-1, 0.15s) var(--ease, ease);
}

.evc:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
}

.evc.is-open {
  border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
}

.evc.is-booked .evc__band {
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.35) 0 6px,
    rgba(255, 255, 255, 0) 6px 12px
  );
}

.evc__band {
  position: relative;
  height: 5px;
  background-size: 200% 100%;
}

.evc__pulse {
  position: absolute;
  right: 8px;
  top: -3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
  animation: evc-pulse 1.6s ease-in-out infinite;
}

@keyframes evc-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.86);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.evc__top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--s3) var(--s3) 0;
  min-width: 0;
}

.evc__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.evc__venue {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evc__name {
  padding: 0 var(--s3);
  font-size: 12px;
  color: var(--text-dim);
}

.evc__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 var(--s3);
}

.evc__tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.evc__style {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.evc__power {
  font-size: 11px;
  font-weight: 600;
}

/* 这一路人的「队服脸」：一眼看出今晚是快攻营还是防守派 */
.evc__faces {
  display: flex;
  gap: 2px;
  padding: 0 var(--s3);
  font-size: 15px;
  line-height: 1;
  filter: grayscale(0.15);
}

.evc__power.is-weak {
  color: #1e9e6a;
}

.evc__power.is-even {
  color: var(--text-dim);
}

.evc__power.is-strong {
  color: #d98a1f;
}

.evc__blurb {
  margin: 0;
  padding: 0 var(--s3);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
  min-height: 32px;
}

.evc__time {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin: 0 var(--s3);
  padding: 6px 8px;
  border-radius: var(--r-sm, 8px);
  background: var(--surface-2, var(--surface));
  font-size: 11px;
}

.evc__state {
  color: var(--text-dim);
  font-weight: 600;
  white-space: nowrap;
}

.evc__state.is-live {
  color: var(--accent);
}

.evc__count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.evc__foot {
  margin-top: auto;
  padding: var(--s2) var(--s3) 0;
}

.evc__booked {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
}

.evc__booked-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
}

@media (prefers-reduced-motion: reduce) {
  .evc,
  .evc__pulse {
    animation: none;
    transition: none;
  }
}

@media (max-width: 560px) {
  .evc {
    width: 200px;
  }
}
</style>
