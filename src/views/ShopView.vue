<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import ChestPanel from '../components/ChestPanel.vue';
import CoinShopPanel from '../components/CoinShopPanel.vue';
import HonorShopPanel from '../components/HonorShopPanel.vue';
import PetShopPanel from '../components/PetShopPanel.vue';
import ShardShop from '../components/ShardShop.vue';
import BackpackPanel from '../components/BackpackPanel.vue';
import { useProgressStore } from '../stores/progress';
import { sfx } from '../game/audio';

/**
 * 🏪 商城（大地图右上角那栋楼，`/shop`）：**一整层界面**，不再是可以走动的房间。
 *
 * - 顶部三个页签：**皮肤 / 宝箱 / 背包**；
 * - 「皮肤」下面左侧再列四家店：🪙 金币商店 / 🏅 荣誉商店 / 🐾 宠物 / 🧩 碎片兑换；
 * - 选中的那一栏写在地址里（`/shop/coin`、`/shop/chest`…），所以刷新、分享链接、
 *   从外壳右上角的「宝箱」按钮进来都落在同一处；点分类只是换这个参数，
 *   **不跳新页面、不重挂整个页面**。
 *
 * 宠物店（原来的 `/petshop` 那栋楼）已经并到这里：`/petshop` 直接重定向到 `/shop/pet`。
 */
const route = useRoute();
const router = useRouter();
const progress = useProgressStore();

type Section = 'coin' | 'honor' | 'pet' | 'shard' | 'chest' | 'bag';
const SECTIONS: Section[] = ['coin', 'honor', 'pet', 'shard', 'chest', 'bag'];

/** 「皮肤」页签左侧那四家店 */
const SKIN_SHOPS: { id: Section; label: string; icon: string; sub: string }[] = [
  { id: 'coin', label: '金币商店', icon: '🪙', sub: '低星装扮直购' },
  { id: 'honor', label: '荣誉商店', icon: '🏅', sub: '坐骑 · 特殊形象' },
  { id: 'pet', label: '宠物', icon: '🐾', sub: '每小时补货' },
  { id: 'shard', label: '碎片兑换', icon: '🧩', sub: '碎片专属装扮' },
];

/** 顶部页签（点它就切到那一栏的默认分类） */
const TABS: { id: 'skin' | 'chest' | 'bag'; label: string; to: Section }[] = [
  { id: 'skin', label: '皮肤', to: 'coin' },
  { id: 'chest', label: '宝箱', to: 'chest' },
  { id: 'bag', label: '背包', to: 'bag' },
];

const section = computed<Section>(() => {
  const s = String(route.params.section ?? 'coin') as Section;
  return SECTIONS.includes(s) ? s : 'coin';
});
const tab = computed<'skin' | 'chest' | 'bag'>(() => {
  if (section.value === 'chest') return 'chest';
  if (section.value === 'bag') return 'bag';
  return 'skin';
});

/** 切分类：只改地址里的那一段（同一个页面内切换） */
function go(s: Section): void {
  sfx.click();
  void router.push(`/shop/${s}`);
}

function back(): void {
  sfx.click();
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="商城" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num mall-wallet" title="金币">🪙 {{ progress.coins }}</span>
        <span class="icon-btn ui-num mall-wallet" title="荣誉点">🏅 {{ progress.honor }}</span>
        <span class="icon-btn ui-num mall-wallet" title="宝箱钥匙">🔑 {{ progress.chestKeys }}</span>
        <span class="icon-btn ui-num mall-wallet" title="星尘碎片">🧩 {{ progress.shards }}</span>
      </template>

      <template #stage>
        <div class="mall">
          <div class="mall__inner">
            <!-- 顶部：皮肤 / 宝箱 / 背包 -->
            <div class="mall__tabs">
              <button
                v-for="t in TABS"
                :key="t.id"
                class="mall__tab"
                :class="{ 'is-on': tab === t.id }"
                type="button"
                @click="go(t.to)"
              >
                {{ t.label }}
              </button>
            </div>

            <div class="mall__body">
              <!-- 左侧：皮肤这一栏里的四家店 -->
              <aside v-if="tab === 'skin'" class="mall__side">
                <button
                  v-for="s in SKIN_SHOPS"
                  :key="s.id"
                  class="mall__side-btn"
                  :class="{ 'is-on': section === s.id }"
                  type="button"
                  @click="go(s.id)"
                >
                  <span class="mall__side-icon">{{ s.icon }}</span>
                  <span class="mall__side-text">
                    <b>{{ s.label }}</b>
                    <em class="muted">{{ s.sub }}</em>
                  </span>
                </button>
              </aside>

              <!-- 右侧：当前这一栏的内容 -->
              <main class="mall__main">
                <CoinShopPanel v-if="section === 'coin'" />
                <HonorShopPanel v-else-if="section === 'honor'" />
                <PetShopPanel v-else-if="section === 'pet'" />
                <ShardShop v-else-if="section === 'shard'" />
                <ChestPanel v-else-if="section === 'chest'" />
                <BackpackPanel v-else @open-chest="go('chest')" />
              </main>
            </div>
          </div>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.mall {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* 内容居中限宽：桌面上一整屏铺开太长，读起来累 */
.mall__inner {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  width: 100%;
  max-width: 1240px;
  height: 100%;
  margin: 0 auto;
  /* 顶栏（退出 + 右上角那排）是浮层，内容要让开 */
  padding: calc(var(--ui-top-h) + 10px) var(--s4) var(--s4);
}

.mall__tabs {
  display: flex;
  gap: 6px;
}

.mall__tab {
  padding: 6px 20px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.mall__tab.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface-2));
}

.mall__body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: var(--s3);
}

.mall__side {
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 6px;
  width: 172px;
}

.mall__side-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.mall__side-btn.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
}

.mall__side-icon {
  font-size: 20px;
  line-height: 1;
}

.mall__side-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mall__side-text b {
  font-size: 13px;
}

.mall__side-text em {
  font-style: normal;
  font-size: 10px;
}

.mall__main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.mall-wallet {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}

/* 手机：左侧分类横过来，内容竖着排 */
@media (max-width: 720px) {
  .mall__body {
    flex-direction: column;
  }

  .mall__side {
    flex-direction: row;
    width: auto;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .mall__side-btn {
    flex: none;
    padding: 6px 10px;
  }

  .mall__side-text em {
    display: none;
  }
}
</style>
