<script setup lang="ts">
import { useRouter } from 'vue-router';
import GlassPanel from '../components/ui/GlassPanel.vue';
import GlassButton from '../components/ui/GlassButton.vue';
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
      <GlassPanel>
        <div class="hero">
          <div class="hero__mark" aria-hidden="true">🏸</div>
          <h1 class="hero__title">羽毛球</h1>
          <p class="muted hero__sub">
            2D 侧视角单打 · 球拍跟着指针走 · WebRTC 直连，打不通自动走中继
          </p>
          <div class="hero__actions">
            <GlassButton variant="primary" size="lg" @click="go('/single')">单机练习</GlassButton>
            <GlassButton size="lg" @click="go('/online')">联机对战</GlassButton>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel>
        <h3 style="margin-bottom: 14px">操作说明</h3>
        <div class="legend">
          <div><b style="color: var(--accent)">移动鼠标</b> 挥动球拍</div>
          <div>
            <span class="kbd">A</span><span class="kbd">D</span> 或
            <span class="kbd">←</span><span class="kbd">→</span> 左右移动
          </div>
          <div><span class="kbd">W</span> 或 <span class="kbd">↑</span> 起跳</div>
          <div><span class="kbd">R</span> 结束后再来一局</div>
        </div>
        <p class="muted" style="margin-top: 16px">
          球拍碰到球就会自动击出，<b>不需要点击</b>。<b>挥拍方向决定球的去向</b>：往上抹是挑高球 /
          高远球，平着扫是平抽，往下砍是扣杀。<b>挥得越快，出球越快越深</b>；挥得软，球就软绵绵落网前。
        </p>
        <p class="muted" style="margin-top: 8px">
          鼠标甩到屏幕边缘时，直接抬起鼠标挪回中间继续即可（不会误触发挥拍）。
          手机上自动切换为左侧移动条 + 右侧摇杆。
        </p>
      </GlassPanel>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 18px 8px 8px;
}

.hero__mark {
  font-size: 58px;
  line-height: 1;
  filter: drop-shadow(0 10px 26px rgba(78, 163, 255, 0.45));
}

.hero__title {
  font-size: 46px;
  letter-spacing: -1.4px;
  margin: 12px 0 0;
}

.hero__sub {
  margin: 10px 0 0;
}

.hero__actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 26px;
}

/* phones in landscape have very little vertical room — tighten everything */
@media (pointer: coarse) {
  .hero {
    padding: 6px 6px 2px;
  }

  .hero__mark {
    font-size: 38px;
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
    margin-top: 16px;
  }
}
</style>
