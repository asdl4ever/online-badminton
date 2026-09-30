<script setup lang="ts">
import { useRouter } from 'vue-router';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import CustomizePanel from '../components/CustomizePanel.vue';
import { sfx } from '../game/audio';

const router = useRouter();

function go(path: string) {
  sfx.unlock();
  sfx.click();
  void router.push(path);
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
          <div><span class="kbd">W</span> 或 <span class="kbd">↑</span> 起跳</div>
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

      <CustomizePanel />
    </div>
  </div>
</template>

<style scoped>
.hero {
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
}
</style>
