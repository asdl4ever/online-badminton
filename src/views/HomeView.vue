<script setup lang="ts">
import { useRouter } from 'vue-router';
import { sfx } from '../game/audio';

const router = useRouter();

function go(path: string) {
  sfx.unlock();
  sfx.click();
  void router.push(path);
}
</script>

<template>
  <div class="page">
    <div class="shell" style="max-width: 720px">
      <div class="card" style="text-align: center; padding: 44px 28px">
        <h1 style="font-size: 46px; letter-spacing: -1px">🏸 羽毛球</h1>
        <p class="muted" style="margin: 12px 0 28px">
          2D 侧视角单打 · Phaser 4 · PeerJS 点对点联机
        </p>

        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap">
          <button class="btn btn-primary" style="min-width: 180px" @click="go('/single')">
            单机练习
          </button>
          <button class="btn" style="min-width: 180px" @click="go('/online')">
            联机对战
          </button>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 14px">操作说明</h3>
        <div class="legend">
          <div><b style="color: var(--accent)">移动鼠标</b> 挥动球拍</div>
          <div><span class="kbd">A</span><span class="kbd">D</span> 或 <span class="kbd">←</span><span class="kbd">→</span> 左右移动</div>
          <div><span class="kbd">W</span> 或 <span class="kbd">↑</span> 起跳</div>
          <div><span class="kbd">R</span> 结束后再来一局</div>
        </div>
        <p class="muted" style="margin-top: 16px">
          球拍碰到球就会自动击出，<b>不需要点击</b>。<b>挥拍方向决定球的去向</b>：往上抹是挑高球 /
          高远球，平着扫是平抽，往下砍是扣杀。<b>挥得越快，出球越快越深</b>；挥得软，球就软绵绵落网前。
        </p>
        <p class="muted" style="margin-top: 8px">
          鼠标甩到屏幕边缘时，直接抬起鼠标挪回中间继续即可（不会误触发挥拍）。
        </p>
      </div>
    </div>
  </div>
</template>
