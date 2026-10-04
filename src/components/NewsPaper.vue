<script setup lang="ts">
import { computed } from 'vue';
import { useProgressStore, type NewsItem } from '../stores/progress';

/**
 * 📰 **新闻周刊的正文**（刊头 + 按期分版）。
 *
 * `NewsView`（整页 `/news`）和大地图平板里的「新闻周刊」应用**共用这一份**，
 * 所以两边看到的永远是同一批消息 —— 消息本身由 `progress.news` 提供
 * （换血时在 `evolveRosterIfDue()` 里生成）。
 */
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const progress = useProgressStore();

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** 每种消息的角标 */
const KINDS: Record<NewsItem['kind'], { icon: string; tag: string }> = {
  retire: { icon: '👋', tag: '退役' },
  debut: { icon: '🌱', tag: '新秀' },
  champion: { icon: '🏆', tag: '冠军' },
};

/** M月D日 */
function day(t: number): string {
  const d = new Date(t);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 消息归到它所在那周的**周一零点**（周刊一期 = 一周） */
function weekStart(at: number): number {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 周一 = 0
  return d.getTime() - dow * 24 * 60 * 60 * 1000;
}

interface Issue {
  key: number;
  from: number;
  to: number;
  items: NewsItem[];
}

/** 按期（周）分组，最新的在最上面 */
const issues = computed<Issue[]>(() => {
  const map = new Map<number, NewsItem[]>();
  for (const n of progress.news) {
    const k = weekStart(n.at);
    const arr = map.get(k);
    if (arr) arr.push(n);
    else map.set(k, [n]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([k, items]) => ({ key: k, from: k, to: k + WEEK_MS - 1, items }));
});
</script>

<template>
  <div class="paper" :class="{ 'is-compact': compact }">
    <header class="masthead">
      <span class="masthead__brand">📰 羽毛球周刊</span>
      <span class="masthead__meta">世界赛 · 球员动态</span>
    </header>

    <p v-if="!issues.length" class="empty">
      周刊还没创刊 —— 世界赛换血（老将退役 / 新秀入行）之后，这里就会有消息。
    </p>

    <article v-for="(it, idx) in issues" :key="it.key" class="issue">
      <div class="issue__head">
        <span class="issue__no">{{ idx === 0 ? '最新一期' : `第 ${issues.length - idx} 期` }}</span>
        <span class="issue__date">{{ day(it.from) }} – {{ day(it.to) }}</span>
      </div>

      <div v-for="(n, i) in it.items" :key="n.id" class="item" :class="{ 'is-lead': i === 0 }">
        <div class="item__head">
          <span class="item__tag" :class="`item__tag--${n.kind}`">
            {{ KINDS[n.kind].icon }} {{ KINDS[n.kind].tag }}
          </span>
          <h3 class="item__title">{{ n.title }}</h3>
          <time class="item__time">{{ day(n.at) }}</time>
        </div>
        <p v-if="n.names.length" class="item__names">{{ n.names.join(' · ') }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.paper {
  max-width: 720px;
  margin: 0 auto;
  color: #2f2a20;
}

/* 刊头 */
.masthead {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-bottom: 10px;
  border-bottom: 3px double #3a352b;
  margin-bottom: 18px;
}

.masthead__brand {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 4px;
}

.masthead__meta {
  font-size: 12px;
  letter-spacing: 2px;
  color: #7a715c;
}

.empty {
  margin: 40px 0;
  text-align: center;
  font-size: 13px;
  color: #7a715c;
}

/* 一期 */
.issue + .issue {
  margin-top: 26px;
}

.issue__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid #cfc6ae;
  margin-bottom: 10px;
}

.issue__no {
  font-size: 13px;
  font-weight: 800;
  color: #8a5a2b;
  letter-spacing: 1px;
}

.issue__date {
  font-size: 12px;
  color: #7a715c;
}

/* 条目 */
.item {
  padding: 8px 10px;
  border-left: 3px solid #d6cdb6;
  background: #fbf8f0;
  border-radius: 0 8px 8px 0;
}

.item + .item {
  margin-top: 8px;
}

.item.is-lead {
  border-left-color: #b8860b;
  background: #fffdf6;
}

.item__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item__tag {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: #8a8a8a;
}

.item__tag--retire {
  background: #9a6b3f;
}

.item__tag--debut {
  background: #2f8f5b;
}

.item__tag--champion {
  background: #b8860b;
}

.item__title {
  flex: 1;
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
}

.item.is-lead .item__title {
  font-size: 17px;
}

.item__time {
  flex: none;
  font-size: 11px;
  color: #8b836d;
}

.item__names {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #5d5748;
}

/* 平板里的紧凑版：整体缩一号（屏幕小） */
.paper.is-compact .masthead__brand {
  font-size: 19px;
  letter-spacing: 2px;
}

.paper.is-compact .masthead {
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.paper.is-compact .empty {
  margin: 24px 0;
}

.paper.is-compact .issue + .issue {
  margin-top: 18px;
}

.paper.is-compact .item__title {
  font-size: 13px;
}

.paper.is-compact .item.is-lead .item__title {
  font-size: 15px;
}

.paper.is-compact .item__names {
  font-size: 11px;
}
</style>
