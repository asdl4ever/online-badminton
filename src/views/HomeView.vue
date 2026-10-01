<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import CustomizePanel from '../components/CustomizePanel.vue';
import FriendsPanel from '../components/FriendsPanel.vue';
import RankPanel from '../components/RankPanel.vue';
import BackpackPanel from '../components/BackpackPanel.vue';
import ChestPanel from '../components/ChestPanel.vue';
import PetEggPanel from '../components/PetEggPanel.vue';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';
import { sfx } from '../game/audio';

const router = useRouter();
const lobby = useLobbyStore();
const progress = useProgressStore();

const showLook = ref(false);
const showFriends = ref(false);
const showRank = ref(false);
const showBag = ref(false);
const showChest = ref(false);
const showEgg = ref(false);
/** the little tool icons live behind a toggle to the right of the main buttons */
const toolsOpen = ref(false);

/** pending friend requests + invites, shown as a badge on the friends icon */
const friendBadge = computed(() => lobby.requests.length + lobby.invites.length);
/** reached tiers that have not been claimed yet */
const rankBadge = computed(() => progress.claimable.length);
/** something is waiting behind the collapsed drawer */
const toolBadge = computed(
  () => rankBadge.value + friendBadge.value + (progress.tenTickets > 0 ? 1 : 0),
);

function go(path: string) {
  sfx.unlock();
  sfx.click();
  void router.push(path);
}

function toggleTools() {
  sfx.unlock();
  sfx.click();
  toolsOpen.value = !toolsOpen.value;
}

function openChestFromBag() {
  showBag.value = false;
  showChest.value = true;
}

/** fun mode only exists online, so entering it also opens the lobby */
function goParty() {
  sfx.unlock();
  sfx.click();
  void router.push({ path: '/online', query: { party: '1' } });
}

function open(which: 'look' | 'friends' | 'rank' | 'bag' | 'chest' | 'egg') {
  sfx.unlock();
  sfx.click();
  if (which === 'look') showLook.value = true;
  else if (which === 'friends') showFriends.value = true;
  else if (which === 'bag') showBag.value = true;
  else if (which === 'chest') showChest.value = true;
  else if (which === 'egg') showEgg.value = true;
  else showRank.value = true;
}
</script>

<template>
  <div class="page page--narrow">
    <div class="shell">
      <Panel>
        <div class="hero">
          <svg class="hero__mark" viewBox="0 0 64 64" aria-hidden="true">
            <!-- skirt: narrow at the cork, flaring outward -->
            <path
              d="M25 40 L11 11 Q32 4 53 11 L39 40 Q32 43 25 40 Z"
              fill="url(#skirt)"
              stroke="rgba(255,255,255,.32)"
              stroke-width="1.4"
            />
            <path
              d="M32 41 L32 8.5 M25 40 L22 9.5 M39 40 L42 9.5"
              stroke="rgba(255,255,255,.45)"
              stroke-width="1.3"
              fill="none"
              stroke-linecap="round"
            />
            <!-- cork -->
            <circle cx="32" cy="49" r="9.5" fill="var(--accent)" />
            <defs>
              <linearGradient id="skirt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f2f8ff" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#9bb6d4" stop-opacity="0.55" />
              </linearGradient>
            </defs>
          </svg>

          <h1 class="hero__title">羽毛球</h1>
          <p class="muted hero__sub">
            2D 侧视角单打 · 球拍跟着指针走 · WebRTC 直连，打不通自动走中继
          </p>

          <div class="hero__actions">
            <Button variant="primary" size="lg" @click="go('/single')">单机练习</Button>
            <Button size="lg" @click="go('/online')">联机对战</Button>
            <Button size="lg" @click="goParty">乐趣模式</Button>
            <Button size="lg" @click="go('/climb')">攀爬挑战</Button>
            <Button size="lg" @click="go('/fish')">钓鱼塘</Button>
            <Button size="lg" @click="go('/mine')">采矿场</Button>

            <div class="tools" :class="{ 'is-open': toolsOpen }">
              <button
                class="tool tools__toggle"
                :class="{ 'is-open': toolsOpen }"
                type="button"
                :aria-expanded="toolsOpen"
                :title="toolsOpen ? '收起' : '段位 / 外观 / 背包 / 宝箱 / 宠物蛋 / 好友'"
                @click="toggleTools"
              >
                <svg
                  class="tools__chevron"
                  :class="{ 'is-open': toolsOpen }"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>更多</span>
                <span v-if="toolBadge && !toolsOpen" class="tool__badge">{{ toolBadge }}</span>
              </button>

              <div v-if="toolsOpen" class="tools__list">
                <button class="tool" type="button" title="段位" @click="open('rank')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>段位</span>
                  <span v-if="rankBadge" class="tool__badge">{{ rankBadge }}</span>
                </button>

                <button class="tool" type="button" title="外观自定义" @click="open('look')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                    <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
                    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
                    <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
                  </svg>
                  <span>外观</span>
                </button>

                <button class="tool" type="button" title="背包" @click="open('bag')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 8h14l-1.2 11a1.5 1.5 0 0 1-1.5 1.3H7.7A1.5 1.5 0 0 1 6.2 19z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9 8V6.5a3 3 0 0 1 6 0V8"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>背包</span>
                </button>

                <button class="tool" type="button" title="宝箱" @click="open('chest')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="3"
                      y="9"
                      width="18"
                      height="11"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                    <path
                      d="M3 11.5h18M12 9v11"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <path
                      d="M5 9V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5V9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                  </svg>
                  <span>宝箱</span>
                  <span v-if="progress.tenTickets > 0" class="tool__badge">礼</span>
                </button>

                <button class="tool" type="button" title="宠物蛋" @click="open('egg')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 3c3.3 0 6 4.4 6 8.6A6 6 0 0 1 6 11.6C6 7.4 8.7 3 12 3z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9.4 12.4l2.2 1.8-2 1.6 2.4 1.7"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>宠物蛋</span>
                </button>

                <button class="tool" type="button" title="好友" @click="open('friends')">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
                    <path
                      d="M3.5 19a5.5 5.5 0 0 1 11 0"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <path
                      d="M16 6.5a3 3 0 0 1 0 5.6M17 19a5.4 5.4 0 0 0-1.6-3.8"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>好友</span>
                  <span v-if="friendBadge" class="tool__badge">{{ friendBadge }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 style="margin-bottom: var(--s3)">操作说明</h3>
        <div class="legend">
          <div><b style="color: var(--accent)">移动鼠标</b> 挥动球拍</div>
          <div>
            <span class="kbd">A</span><span class="kbd">D</span> 或
            <span class="kbd">←</span><span class="kbd">→</span> 左右移动
          </div>
          <div><span class="kbd">空格</span> 或 <span class="kbd">K</span> 起跳</div>
          <div><span class="kbd">R</span> 结束后再来一局</div>
        </div>
        <p class="muted" style="margin-top: var(--s4)">
          球拍碰到球就会自动击出，<b>不需要点击</b>。<b>挥拍方向决定球的去向</b>：往上抹是挑高球 /
          高远球，平着扫是平抽，往下砍是扣杀。<b>挥得越快，出球越快越深</b>；挥得软，球就软绵绵落网前。
        </p>
        <p class="muted" style="margin-top: var(--s2)">
          手机上自动切换为左右双摇杆：左侧推动移动、上推起跳，右侧控制球拍。
          点顶栏的「摇杆」按钮可以拖动调整两个摇杆的大小和位置。
        </p>
      </Panel>
    </div>

    <AppModal v-model="showRank" title="段位" max-width="600px">
      <RankPanel />
    </AppModal>

    <AppModal v-model="showLook" title="外观自定义">
      <CustomizePanel />
    </AppModal>

    <AppModal v-model="showBag" title="背包" max-width="760px">
      <BackpackPanel @open-chest="openChestFromBag" />
    </AppModal>

    <AppModal v-model="showChest" title="宝箱" max-width="540px">
      <ChestPanel />
    </AppModal>

    <AppModal v-model="showEgg" title="宠物蛋" max-width="480px">
      <PetEggPanel />
    </AppModal>

    <AppModal v-model="showFriends" title="好友" max-width="720px">
      <FriendsPanel room-code="" :can-invite="false" bare />
    </AppModal>
  </div>
</template>

<style scoped>
.tool {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--e1);
}

.tool:hover {
  color: var(--text);
}

.tool svg {
  width: 18px;
  height: 18px;
}

.tool__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--r-pill);
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}

/* ---- collapsible tool dock pinned to the panel's top-right corner, stacked vertically ---- */
.tools {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  width: max-content;
  z-index: 4;
  border-radius: var(--r-lg);
  border: 1px solid transparent;
  transition:
    background var(--dur-1) var(--ease),
    border-color var(--dur-1) var(--ease),
    box-shadow var(--dur-1) var(--ease);
}

/* expanded, it becomes a floating card so spilling past the panel reads
   as a dropdown rather than as broken layout */
.tools.is-open {
  padding: 6px;
  border-color: var(--line);
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  box-shadow: var(--e2);
  backdrop-filter: blur(10px);
}

.tools__toggle.is-open {
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 24%, transparent);
}

.tools__chevron {
  transition: transform 0.2s ease;
}

.tools__chevron.is-open {
  transform: rotate(180deg);
}

.tools__list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  animation: tools-in 0.2s ease both;
}

@keyframes tools-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}

.hero {
  position: relative;
  text-align: center;
  padding: var(--s4) var(--s2) var(--s1);
}

.hero__mark {
  width: 62px;
  height: 62px;
  display: block;
  margin: 0 auto;
}

.hero__title {
  font-size: 44px;
  letter-spacing: -1px;
  margin: var(--s3) 0 0;
}

.hero__sub {
  margin: var(--s2) 0 0;
}

.hero__actions {
  display: flex;
  gap: var(--s4);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--s5);
}

/* phones in landscape have very little vertical room — tighten everything */
@media (pointer: coarse) {
  .hero {
    padding: var(--s1) var(--s1) 0;
  }

  .hero__mark {
    width: 38px;
    height: 38px;
  }

  .hero__title {
    font-size: 30px;
    letter-spacing: -0.6px;
    margin-top: 6px;
  }

  .hero__sub {
    font-size: 13px;
  }

  .hero__actions {
    margin-top: var(--s4);
  }

  /* phones have no room for labels — the dock becomes a column of icon squares */
  .tools,
  .tools__list {
    gap: 6px;
  }

  .tools .tool {
    justify-content: center;
    padding: 7px;
  }

  .tools .tool > span:not(.tool__badge) {
    display: none;
  }
}
</style>
