<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import { dockOpen, toggleDock } from '../../composables/useDock';
import type { InviteKind } from '../../net/lobby';
import AppModal from './AppModal.vue';
import SettingsPanel from '../SettingsPanel.vue';
import ProfilePanel from '../ProfilePanel.vue';
import RankPanel from '../RankPanel.vue';
import BackpackPanel from '../BackpackPanel.vue';
import FriendsPanel from '../FriendsPanel.vue';
import AchievementsPanel from '../AchievementsPanel.vue';

/**
 * 所有对局页共用的外壳：**没有顶栏**——
 * 左上角是「退出 + 模式设置」，右上角是一排横向小图标，剩下的整块都是画面。
 *
 * 画面里也不再有额外的文字模块：分数、连击、联机状态等都由游戏画面自己画
 * （见 GameScene 的 scoreLeft / scoreRight / infoLine / subMessage），
 * 所以游戏区域能真的铺满整屏。
 *
 * 尺寸全部走 `--ui-*` 固定像素（桌面/手机一致，不随屏幕缩放）。
 */
withDefaults(
  defineProps<{
    /** 页面名，做成左上角的小标签（不是顶栏） */
    title?: string;
    /** 左上角是否显示退出按钮 */
    back?: boolean;
    /**
     * 右上角那排「段位 / 背包 / 宝箱 / 宠物蛋 / 好友 / 成就」是外壳统一内置的，
     * 任何页面都和大世界一模一样。只有「好友」面板要看场景：邀请发出去该落在哪个页面。
     */
    friendsKind?: InviteKind;
    /** 当前房间号（有房间时好友面板才能邀请） */
    friendsCode?: string;
    friendsCanInvite?: boolean;
    /** 没房间时点邀请：页面提供的自动建房流程（点邀请 = 自动建房 + 发邀请） */
    friendsEnsureRoom?: () => Promise<string>;
  }>(),
  { title: '', back: false, friendsKind: 'match', friendsCode: '', friendsCanInvite: false },
);

const emit = defineEmits<{ back: [] }>();

/** 抽卡归到大地图的商店：宝箱按钮直接带路过去（不再各页弹窗） */
const shellRouter = useRouter();

/** 右上角图标行的铺开状态记在本机 */
const iconsOpen = useLocalStorage('bmt-ui-icons-open', true);
/** 右上角的设置弹窗（兑换码等） */
const settingsOpen = ref(false);
/** 右上角的个人主页弹窗（角色 / 段位 / 收藏进度） */
const profileOpen = ref(false);
/** 每个页面都有的那几个面板：达成/收藏/成长相关 */
const showAch = ref(false);
const showRank = ref(false);
const showBag = ref(false);
const showFriends = ref(false);

/**
 * 页面自己的按钮（比如大世界坞里的「邀请好友」）想打开外壳内置的面板时，
 * 通过模板 ref 调这几个方法，避免每页再各做一套。
 */
defineExpose({
  openFriends: () => (showFriends.value = true),
  openAchievements: () => (showAch.value = true),
  openBackpack: () => (showBag.value = true),
});
</script>

<template>
  <div class="shell-ui" :class="{ 'is-dock-open': dockOpen }">
    <div class="shell-ui__main">
      <!-- 左上角：退出 + 模式设置 -->
      <div class="hud-top">
        <button
          v-if="back"
          class="icon-btn jelly"
          type="button"
          title="退出"
          aria-label="退出"
          @click="emit('back')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M15 5 8 12l7 7"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          class="dock-btn jelly"
          :class="{ 'is-open': dockOpen }"
          type="button"
          data-dock-toggle
          aria-haspopup="true"
          :aria-expanded="dockOpen"
          :title="dockOpen ? '收起模式设置' : '展开模式设置'"
          @click="toggleDock"
        >
          <svg class="dock-btn__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h8M16 17h4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="16" cy="7" r="2.4" fill="currentColor" />
            <circle cx="10" cy="12" r="2.4" fill="currentColor" />
            <circle cx="14" cy="17" r="2.4" fill="currentColor" />
          </svg>
          <span>模式设置</span>
        </button>

        <span v-if="title" class="hud-top__title">{{ title }}</span>
      </div>

      <slot name="stage" />

      <!-- 右上角：一排横向小图标，收起时只留一个箭头 -->
      <div class="hud-icons" :class="{ 'is-collapsed': !iconsOpen }">
        <div class="hud-icons__row">
          <button
            class="icon-btn jelly"
            type="button"
            title="个人主页：角色 / 段位 / 收集进度"
            @click="profileOpen = true"
          >
            个人主页
          </button>

          <!-- 下面这一组所有页面完全一致（和大世界一样） -->
          <button class="icon-btn jelly" type="button" title="成就" @click="showAch = true">
            成就
          </button>
          <button class="icon-btn jelly" type="button" title="积分与荣誉奖励" @click="showRank = true">
            积分
          </button>
          <button class="icon-btn jelly" type="button" title="背包与收藏" @click="showBag = true">
            背包
          </button>
          <button class="icon-btn jelly" type="button" title="商店（活动 / 宝箱）" @click="shellRouter.push('/shop')">
            宝箱
          </button>
          <!-- 宠物从大地图的「宠物店」（/petshop）买，这里不放入口 -->
          <button class="icon-btn jelly" type="button" title="好友" @click="showFriends = true">
            好友
          </button>

          <slot name="icons" />
          <button class="icon-btn jelly" type="button" title="设置 / 兑换码" @click="settingsOpen = true">
            设置
          </button>
          <button
            class="icon-btn jelly icon-btn--toggle"
            type="button"
            :title="iconsOpen ? '收起这一行' : '展开这一行'"
            :aria-label="iconsOpen ? '收起这一行' : '展开这一行'"
            @click="iconsOpen = !iconsOpen"
          >
            {{ iconsOpen ? '收起' : '更多' }}
          </button>
        </div>
      </div>

      <slot name="dock" />
      <slot name="overlay" />
    </div>

    <AppModal v-model="settingsOpen" title="设置" max-width="480px">
      <SettingsPanel />
    </AppModal>

    <AppModal v-model="profileOpen" title="个人主页" max-width="620px">
      <ProfilePanel />
    </AppModal>

    <!-- 每个页面都有的面板（大世界同款） -->
    <AppModal v-model="showAch" title="成就" max-width="640px">
      <AchievementsPanel />
    </AppModal>
    <AppModal v-model="showRank" title="段位" max-width="600px">
      <RankPanel />
    </AppModal>
    <AppModal v-model="showBag" title="背包" max-width="760px">
      <BackpackPanel />
    </AppModal>
    <AppModal v-model="showFriends" title="好友" max-width="720px">
      <FriendsPanel
        :kind="friendsKind"
        :room-code="friendsCode"
        :can-invite="friendsCanInvite"
        :ensure-room="friendsEnsureRoom"
      />
    </AppModal>
  </div>
</template>
