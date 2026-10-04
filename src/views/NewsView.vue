<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import NewsPaper from '../components/NewsPaper.vue';

/**
 * 📰 **新闻周刊**（整页 `/news`）：世界自己发生的事（老将退役 / 新秀入行…）。
 * 正文是共用的 `NewsPaper`（大地图平板里的「新闻周刊」应用用的是同一份，
 * 只是切到紧凑版）。
 */
const router = useRouter();

function back(): void {
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="新闻周刊" back @back="back">
      <template #stage>
        <div class="news">
          <NewsPaper />
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
/* 报纸底色铺满整块内容区，正文自己滚动 */
.news {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 60px 16px 28px;
  background: #f4efe3;
}
</style>
