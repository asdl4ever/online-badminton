import Phaser from 'phaser';
import { MOUNT_COLORS, type MountId } from '../cosmetics';
import type { CharacterPose } from './character';
import { THEME_MOUNTS, drawThemeMount } from './themeart';
import { drawMountCustom } from './mounts-theme';

/**
 * 坐骑绘制：**纯装饰**，画在角色脚下、跟着他跑和跳。
 *
 * 它不参与任何物理（不改移动速度、不改判定半径），所以联机时两边各画各的就行，
 * 轨迹不会因为这个分叉。所有坐骑都以 `pose.feetY` 为基准往上/往下画一点点。
 */
export type MountPass = 'back' | 'front' | 'all';

/**
 * 坐骑的**叠放策略**——决定它画在角色身体之前还是之后、是否分两遍画：
 * - `behind`（默认）：整件画在**身体之前**（角色压上去）→ 坐骑不再糊在脸上，读作「站在/骑在上面」；
 * - `front`：低矮贴地载具（滑板 / 悬浮板 / 云 / 毯…），维持画在身体之后（压在脚下）；
 * - `split`：**分两遍**——主体画在身后、近侧覆盖层（`MountArt.front`）画在身前，构成
 *   「角色骑在坐骑里」的前后遮挡（独木舟近侧船帮、兽形前腿…）。角色本体与球拍位置完全不动。
 */
type MountLayer = 'behind' | 'front' | 'split';
interface MountRig { layer: MountLayer; lift?: number }
/** 默认：画在身后 + 整体下压，让坐骑的「承托面」落到脚底（角色才像站在/骑在上面） */
const MOUNT_RIG_DEFAULT: MountRig = { layer: 'behind', lift: 16 };
const MOUNT_RIG: Partial<Record<MountId, MountRig>> = {
  // 低矮贴地载具：角色站在上面，画在身体之后（脚下压着它）
  board: { layer: 'front' }, bubble: { layer: 'front' }, cloud: { layer: 'front' }, carpet: { layer: 'front' },
  star: { layer: 'front' }, rocket: { layer: 'front' }, scooter: { layer: 'front' }, log: { layer: 'front' },
  box: { layer: 'front' }, spring: { layer: 'front' }, cart: { layer: 'front' }, broom: { layer: 'front' },
  bike: { layer: 'front' }, hover: { layer: 'front' }, nailongRoll: { layer: 'front' }, ufo: { layer: 'front' },
  sword: { layer: 'front' }, firewheel: { layer: 'front' }, kite: { layer: 'front' }, crescent: { layer: 'front' },
  laserbike: { layer: 'front' }, gearbike: { layer: 'front' }, persCarpet: { layer: 'front' },
  // 第七批宇宙科幻坐骑（悬浮载具，画在身体之后、角色站在上面）
  nanoSwarmBoard: { layer: 'front' }, dataHoverPod: { layer: 'front' }, warpSled: { layer: 'front' },
  marsRover: { layer: 'front' }, forerDisc: { layer: 'front' },
  // 第八批海洋怪兽：破冰船 / 维度裂隙 = 载具（身前）；鲸 / 海象 / 鮟鱇 = 兽形（默认身后）
  fridIceBoat: { layer: 'front' }, dimRift: { layer: 'front' },
  // 分两遍：主体在身后、近侧压在身上（第六批新坐骑）
  slavMortar: { layer: 'split' }, incaAlpaca: { layer: 'split' },
  polyCanoe: { layer: 'split' }, auzKangaroo: { layer: 'split' },
  // 第九批：恐龙 / 史前 / 神话 / 恶搞坐骑（角色骑在其上，分两遍绘制）
  cretTrike: { layer: 'split' }, swampDeino: { layer: 'split' }, swampSerpent: { layer: 'split' },
  iceageMammoth: { layer: 'split' }, yorPanther: { layer: 'split' }, kalBear: { layer: 'split' },
  banBoat: { layer: 'split' }, banCart: { layer: 'split' }, memeDoge: { layer: 'split' },
  memeRocket: { layer: 'split' }, officeChair: { layer: 'split' }, gnomeSnail: { layer: 'split' },
  trashCart: { layer: 'split' }, trashTruck: { layer: 'split' },
  // 第十批：梦境 / 微观 / 炼金 / 毛线 / 画中世界坐骑
  dreamCloud: { layer: 'split' }, dreamBed: { layer: 'split' },
  microCilia: { layer: 'split' }, microCell: { layer: 'split' },
  alchCrucible: { layer: 'split' }, yarnCat: { layer: 'split' },
  yarnHorse: { layer: 'split' }, paintHorse: { layer: 'split' },
};

export function drawMount(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: MountId,
  pose: CharacterPose,
  pass: MountPass = 'all',
): void {
  if (id === 'none') return;
  const rig = MOUNT_RIG[id] ?? MOUNT_RIG_DEFAULT;
  // 按叠放层裁剪这一遍该不该下笔
  if (pass === 'back' && rig.layer === 'front') return;
  if (pass === 'front' && rig.layer === 'behind') return;
  const part: 'main' | 'overlay' = rig.layer === 'split' ? (pass === 'front' ? 'overlay' : 'main') : 'main';
  // 需要的话把坐骑整体下移，让它的顶面正好落在脚底
  const p: CharacterPose = rig.lift ? { ...pose, feetY: pose.feetY + rig.lift } : pose;
  const x = p.x;
  const y = p.feetY;
  const f = p.facing;
  const color = MOUNT_COLORS[id];
  /** 悬浮类坐骑的上下浮动 */
  const bob = Math.sin(now / 420) * 3;

  // 主题坐骑：逐款独立画（draw/mounts-theme/），命中就不再走 6-family 模板
  if (drawMountCustom(g, now, id, p, part)) return;
  // 兜底：还没迁完的主题坐骑走 themeart 的通用画法（beast / glider / wheeled…）
  if (THEME_MOUNTS[id]) {
    drawThemeMount(g, now, id, p);
    drawMountFlair(g, now, id, p);
    return;
  }

  switch (id) {
    // ---- 滑板：翘头板面 + 砂纸 + 桥与轮 ------------------------------------
    case 'board': {
      const by = y + 4;
      // 尾部地影
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(x, by + 9, 60, 8);
      // 两个轮子（带轮毂）
      for (const wx of [-22, 22]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, by + 5, 6);
        g.fillStyle(0xe8e4d8, 1);
        g.fillCircle(x + wx, by + 5, 3.4);
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, by + 5, 1.2);
      }
      // 桥（银色）
      g.fillStyle(0x8a9aa8, 1);
      for (const wx of [-22, 22]) g.fillRect(x + wx - 2, by - 1, 4, 4);
      // 板面：底色 + 翘头（两端微微上翘）
      g.fillStyle(0x2b2b33, 1);
      g.beginPath();
      g.moveTo(x - 34, by - 4);
      g.lineTo(x - 28, by - 8);
      g.lineTo(x + 28, by - 8);
      g.lineTo(x + 34, by - 4);
      g.lineTo(x + 30, by);
      g.lineTo(x - 30, by);
      g.closePath();
      g.fillPath();
      // 砂纸面
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x - 32, by - 5);
      g.lineTo(x - 27, by - 8.6);
      g.lineTo(x + 27, by - 8.6);
      g.lineTo(x + 32, by - 5);
      g.lineTo(x + 29, by - 3);
      g.lineTo(x - 29, by - 3);
      g.closePath();
      g.fillPath();
      // 砂纸高光与防滑纹
      g.fillStyle(0xffffff, 0.22);
      g.fillRoundedRect(x - 26, by - 8, 52, 1.6, 0.8);
      g.fillStyle(0x1a1a20, 0.5);
      for (let k = 0; k < 6; k++) g.fillRect(x - 24 + k * 8.4, by - 7.4, 1.6, 3);
      // 板缘描边
      g.lineStyle(1.6, 0x1a1a20, 0.8);
      g.beginPath();
      g.moveTo(x - 34, by - 4); g.lineTo(x - 28, by - 8); g.lineTo(x + 28, by - 8); g.lineTo(x + 34, by - 4);
      g.strokePath();
      break;
    }

    // ---- 泡泡：彩虹大泡泡，底缘积着水色 ------------------------------------
    case 'bubble': {
      const by = y - 10 + bob;
      const wob = 1 + Math.sin(now / 260) * 0.02;
      // 内层彩晕（底部偏彩）
      g.fillStyle(color, 0.16);
      g.fillEllipse(x, by, 47 * wob, 46 / wob);
      g.fillStyle(0xff8ad4, 0.08);
      g.fillEllipse(x - 8, by + 8, 36, 26);
      g.fillStyle(0x8ad4ff, 0.08);
      g.fillEllipse(x + 10, by + 4, 34, 24);
      // 顶部彩虹光带
      g.lineStyle(3, 0xff8ad4, 0.22);
      g.beginPath(); g.arc(x, by, 40, Math.PI * 1.15, Math.PI * 1.55); g.strokePath();
      g.lineStyle(3, 0x8ad4ff, 0.22);
      g.beginPath(); g.arc(x, by, 38, Math.PI * 1.2, Math.PI * 1.6); g.strokePath();
      // 高光：主光斑 + 副光点
      g.fillStyle(0xffffff, 0.55);
      g.fillEllipse(x - 17, by - 22, 18, 10);
      g.fillCircle(x + 14, by - 28, 3.4);
      g.fillStyle(0xffffff, 0.3);
      g.fillEllipse(x + 6, by + 26, 20, 6);
      // 底缘积聚的水色
      g.fillStyle(color, 0.28);
      g.fillEllipse(x, by + 34, 30, 9);
      // 轮廓（近亮远暗）
      g.lineStyle(2.5, 0xffffff, 0.65);
      g.beginPath(); g.arc(x, by, 46 * wob, Math.PI * 0.55, Math.PI * 1.95); g.strokePath();
      g.lineStyle(2, 0x9fe8ff, 0.35);
      g.beginPath(); g.arc(x, by, 46 * wob, Math.PI * 0.1, Math.PI * 0.6); g.strokePath();
      break;
    }

    // ---- 筋斗云：厚云底 + 蓬松云团 + 云隙光 --------------------------------
    case 'cloud': {
      const by = y + bob;
      // 底层灰蓝阴影云
      g.fillStyle(0xb8c8dc, 0.9);
      g.fillEllipse(x, by + 6, 90, 22);
      // 主云底
      g.fillStyle(0xe4eef8, 1);
      g.fillEllipse(x, by + 2, 88, 22);
      // 蓬松云团（三层，白到浅灰）
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 27, by - 2, 16);
      g.fillCircle(x + 26, by - 2, 16);
      g.fillCircle(x - 6, by - 11, 21);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + 14, by - 6, 14);
      g.fillStyle(0xf4f9ff, 0.9);
      g.fillCircle(x - 12, by - 16, 11);
      // 顶面高光
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(x - 8, by - 18, 22, 7);
      // 云隙光（从云缝里漏下来的两道）
      g.fillStyle(0xfff6d0, 0.18);
      g.fillPoints([
        { x: x - 16, y: by + 6 }, { x: x - 6, y: by + 6 }, { x: x - 2, y: by + 24 }, { x: x - 16, y: by + 24 },
      ], true);
      g.fillPoints([
        { x: x + 10, y: by + 4 }, { x: x + 18, y: by + 4 }, { x: x + 22, y: by + 22 }, { x: x + 10, y: by + 22 },
      ], true);
      break;
    }

    // ---- 御剑：开锋长剑 + 护手 + 剑穗，剑身流转剑气 ------------------------
    case 'sword': {
      const by = y + 3 + bob * 0.6;
      // 剑气光晕（呼吸）
      const glow = 0.3 + 0.22 * Math.sin(now / 260);
      g.fillStyle(0x9fe8ff, glow);
      g.fillEllipse(x, by - 10, 84, 14);
      g.fillStyle(0x9fe8ff, glow * 0.5);
      g.fillEllipse(x, by - 10, 100, 20);
      // 剑尖（左端）
      g.fillStyle(0xd8e8f0, 1);
      g.fillTriangle(x - 52, by - 2, x - 40, by - 7, x - 40, by + 1);
      // 剑身（两层：钢底 + 亮面）
      g.fillStyle(0x8fa8b8, 1);
      g.fillRoundedRect(x - 40, by - 6, 80, 8, 3);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 40, by - 5, 80, 5, 2.5);
      // 血槽与开锋高光
      g.fillStyle(0x5a7488, 0.7);
      g.fillRect(x - 36, by - 2, 68, 1.4);
      g.fillStyle(0xffffff, 0.75);
      g.fillRoundedRect(x - 36, by - 4.4, 66, 1.8, 1);
      // 流转的剑气纹
      const sweep = (now / 500) % 1;
      g.fillStyle(0x9fe8ff, 0.7 * (1 - sweep));
      g.fillRoundedRect(x - 34 + sweep * 64, by - 4, 6, 3.6, 1.8);
      // 护手（tsuba）
      g.fillStyle(0xffd45c, 1);
      g.fillRoundedRect(x + 40, by - 10, 5, 20, 2.4);
      // 柄与剑首
      g.fillStyle(0x2a2a34, 1);
      g.fillRoundedRect(x + 45, by - 3, 14, 6, 2.6);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x + 60, by, 4);
      // 剑穗
      g.lineStyle(1.6, 0xe8404a, 0.9);
      g.lineBetween(x + 61, by + 3, x + 63 + Math.sin(now / 300) * 2, by + 10);
      break;
    }

    // ---- 战马：完整马形（鬃毛 / 四蹄 / 尾巴 / 辔头） ------------------------
    case 'horse': {
      const by = y - 8;
      const dark = 0x4a2e14, light = 0x8a5c2c, mane = 0x3a2a1c;
      // 地影
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(x, by + 36, 70, 9);
      // 四条腿（两深两浅，蹄子）
      for (const [dx, lc] of [[-24, dark], [-10, dark], [12, light], [26, light]] as const) {
        g.fillStyle(lc, 1);
        g.fillRoundedRect(x + dx - 3, by + 12, 6.4, 24, 3);
        g.fillStyle(0x2a2018, 1);
        g.fillRoundedRect(x + dx - 3.4, by + 33, 7.2, 5, 2); // 蹄
      }
      // 尾巴（飘：多段折点模拟弯曲）
      g.fillStyle(mane, 1);
      g.fillPoints([
        { x: x - f * 34, y: by - 6 },
        { x: x - f * 44, y: by + 4 + Math.sin(now / 350) * 3 },
        { x: x - f * 44, y: by + 26 },
        { x: x - f * 38, y: by + 24 },
        { x: x - f * 40, y: by + 10 },
        { x: x - f * 30, y: by },
      ], true);
      // 身子（主色 + 腹部亮面）
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 6, 76, 34);
      g.fillStyle(light, 0.5);
      g.fillEllipse(x, by + 12, 58, 16);
      // 脖子（主色）
      g.fillStyle(color, 1);
      g.fillPoints([
        { x: x + f * 18, y: by + 12 },
        { x: x + f * 30, y: by - 24 },
        { x: x + f * 40, y: by - 22 },
        { x: x + f * 34, y: by + 14 },
      ], true);
      // 鬃毛（沿脖子后缘的折带）
      g.fillStyle(mane, 1);
      g.fillPoints([
        { x: x + f * 18, y: by + 8 },
        { x: x + f * 24, y: by - 16 },
        { x: x + f * 28, y: by - 27 },
        { x: x + f * 21, y: by - 28 },
        { x: x + f * 12, y: by - 10 },
        { x: x + f * 12, y: by + 8 },
      ], true);
      // 头 + 耳 + 口鼻
      g.fillStyle(color, 1);
      g.fillEllipse(x + f * 41, by - 24, 27, 16);
      g.fillTriangle(x + f * 32, by - 30, x + f * 36, by - 40, x + f * 40, by - 29); // 耳
      g.fillStyle(0xa8845a, 0.85);
      g.fillEllipse(x + f * 50, by - 22, 9, 7); // 口鼻
      g.fillStyle(0x3a2a1c, 0.9);
      g.fillEllipse(x + f * 52, by - 21, 4, 4); // 鼻孔
      // 辔头
      g.lineStyle(1.8, 0x2a2018, 0.85);
      g.strokeEllipse(x + f * 41, by - 24, 24, 14);
      // 眼睛（带高光）
      g.fillStyle(0x1c1410, 1);
      g.fillCircle(x + f * 44, by - 26, 2.6);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + f * 44.8, by - 26.8, 0.9);
      // 鞍垫
      g.fillStyle(0xc0392b, 0.95);
      g.fillRoundedRect(x - f * 8, by - 8, 20, 14, 4);
      g.fillStyle(0xffd45c, 0.8);
      g.fillRect(x - f * 8, by - 4, 20, 1.6);
      break;
    }

    // ---- 魔毯：透视飞毯 + 菱纹 + 波动 + 角落流苏 ---------------------------
    case 'carpet': {
      const by = y + bob;
      const wave = Math.sin(now / 320) * 2.4;
      // 毯底（前缘近、后缘远，透视梯形 + 波动）
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x - 52, by - 8 - wave * 0.4);
      g.lineTo(x + 52, by - 8 + wave * 0.4);
      g.lineTo(x + 44, by + 10 + wave);
      g.lineTo(x - 44, by + 10 - wave);
      g.closePath();
      g.fillPath();
      // 描边
      g.lineStyle(1.8, 0xa8845a, 0.9);
      g.beginPath();
      g.moveTo(x - 52, by - 8 - wave * 0.4);
      g.lineTo(x + 52, by - 8 + wave * 0.4);
      g.lineTo(x + 44, by + 10 + wave);
      g.lineTo(x - 44, by + 10 - wave);
      g.closePath();
      g.strokePath();
      // 金色双滚边
      g.fillStyle(0xffd45c, 0.95);
      for (const [x1, x2, yy] of [[-46, 46, by - 4.4], [-44, 44, by - 6.4], [-40, 40, by + 5], [-38, 38, by + 6.8]] as const) {
        g.fillRect(x + x1, yy, x2 - x1, 1.6);
      }
      // 中央菱纹（三枚，随波起伏）
      g.fillStyle(0xffd45c, 0.85);
      for (let k = -1; k <= 1; k++) {
        const cx = x + k * 20, cy = by + 1 + k * wave * 0.5;
        g.fillTriangle(cx, cy - 4.4, cx + 5.4, cy, cx, cy + 4.4);
        g.fillTriangle(cx, cy - 4.4, cx - 5.4, cy, cx, cy + 4.4);
      }
      // 流苏（左右各三束，随波摆动）
      g.lineStyle(1.8, 0xffd45c, 0.9);
      for (let k = 0; k < 3; k++) {
        const sw = Math.sin(now / 300 + k) * 2;
        g.lineBetween(x - 50 + k * 4, by - 8 - wave * 0.4, x - 52 + k * 4 + sw, by - 16);
        g.lineBetween(x - 40 + k * 3, by + 10 - wave, x - 41 + k * 3 + sw, by + 18);
        g.lineBetween(x + 50 - k * 4, by - 8 + wave * 0.4, x + 52 - k * 4 + sw, by - 16);
        g.lineBetween(x + 40 - k * 3, by + 10 + wave, x + 41 - k * 3 + sw, by + 18);
      }
      break;
    }

    // ---- 流星：四芒星核 + 双层尾迹 + 火花 ----------------------------------
    case 'star': {
      const by = y - 8 + bob;
      const pulse = 0.85 + 0.15 * Math.sin(now / 300);
      // 尾迹（双层渐隐，朝身后拖）
      g.fillStyle(0xffb03a, 0.22 * pulse);
      g.fillTriangle(x - f * 20, by - 9, x - f * 72, by, x - f * 20, by + 9);
      g.fillStyle(0xffd45c, 0.4 * pulse);
      g.fillTriangle(x - f * 16, by - 6, x - f * 52, by, x - f * 16, by + 6);
      // 外光晕
      g.fillStyle(0xffb03a, 0.18 * pulse);
      g.fillCircle(x, by, 22);
      // 四芒（长芒对角 + 短芒对角，缓转）
      const rot = now / 2400;
      g.fillStyle(0xffd45c, 0.9);
      for (const [len, ang0] of [[24, rot], [24, rot + Math.PI / 2], [13, rot + Math.PI / 4], [13, rot + Math.PI * 3 / 4]] as const) {
        g.fillPoints([
          { x: x + Math.cos(ang0) * len, y: by + Math.sin(ang0) * len },
          { x: x + Math.cos(ang0 + Math.PI / 2) * 3.4, y: by + Math.sin(ang0 + Math.PI / 2) * 3.4 },
          { x: x + Math.cos(ang0 + Math.PI) * len * 0.35, y: by + Math.sin(ang0 + Math.PI) * len * 0.35 },
          { x: x + Math.cos(ang0 - Math.PI / 2) * 3.4, y: by + Math.sin(ang0 - Math.PI / 2) * 3.4 },
        ], true);
      }
      // 星核（三层）
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x, by, 10);
      g.fillStyle(0xfff2b0, 1);
      g.fillCircle(x, by, 7);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x - 2, by - 2.4, 3);
      // 随机小火花
      for (let k = 0; k < 3; k++) {
        const a = now / 350 + k * 2.1;
        g.fillStyle(0xffe08a, 0.7);
        g.fillCircle(x + Math.cos(a) * 27, by + Math.sin(a) * 15, 1.8);
      }
      break;
    }

    // ---- 幼龙：有脸的小飞龙（角 / 翼膜 / 腹甲 / 尾巴） ----------------------
    case 'dragon': {
      const by = y - 12 + bob;
      const flap = Math.sin(now / 150) * 9;
      const belly = 0x8fd8b8, dark = 0x1f6e52;
      // 翅膀（膜翼：骨架三指 + 膜）
      for (const s of [-1, 1]) {
        const tipY = by - 26 + flap * s * 0.9;
        g.fillStyle(dark, 0.95);
        g.fillPoints([
          { x: x + s * 8, y: by - 4 },
          { x: x + s * 56, y: tipY },
          { x: x + s * 44, y: tipY + 12 },
          { x: x + s * 30, y: tipY + 8 },
          { x: x + s * 26, y: tipY + 20 },
          { x: x + s * 12, y: by + 12 },
        ], true);
        // 翼骨
        g.lineStyle(2, 0x2f9a78, 0.9);
        g.lineBetween(x + s * 8, by - 4, x + s * 56, tipY);
        g.lineBetween(x + s * 8, by - 4, x + s * 44, tipY + 12);
      }
      // 尾巴（向后弯，带尾鳍）
      g.fillStyle(color, 1);
      g.fillPoints([
        { x: x - f * 26, y: by + 6 },
        { x: x - f * 44, y: by + 10 + Math.sin(now / 300) * 3 },
        { x: x - f * 52, y: by + 4 },
        { x: x - f * 50, y: by + 12 },
        { x: x - f * 40, y: by + 18 },
        { x: x - f * 24, y: by + 14 },
      ], true);
      // 身子 + 腹甲
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 2, 58, 24);
      g.fillStyle(belly, 0.95);
      g.fillEllipse(x, by + 6, 44, 13);
      g.lineStyle(1.2, dark, 0.5);
      for (let k = -1; k <= 1; k++) g.strokeEllipse(x + k * 12, by + 6, 8, 11);
      // 头 + 口鼻 + 角
      g.fillStyle(color, 1);
      g.fillRoundedRect(x + f * 20, by - 16, 24, 20, 9);
      g.fillStyle(belly, 0.9);
      g.fillEllipse(x + f * 36, by - 6, 12, 8); // 口鼻
      g.fillStyle(0xffd45c, 0.95);
      g.fillTriangle(x + f * 24, by - 16, x + f * 28, by - 26, x + f * 32, by - 15);
      g.fillTriangle(x + f * 34, by - 16, x + f * 38, by - 24, x + f * 41, by - 14);
      // 眼睛（大眼 + 双层高光）
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x + f * 32, by - 9, 4);
      g.fillStyle(0x1c1410, 1);
      g.fillCircle(x + f * 33.4, by - 8.6, 2.4);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + f * 32.4, by - 10.4, 1);
      // 鼻孔
      g.fillStyle(dark, 0.9);
      g.fillCircle(x + f * 38, by - 8, 1);
      break;
    }

    // ---- 火箭：白机身 + 红鼻锥 + 舷窗 + 双翼 + 三层尾焰 --------------------
    case 'rocket': {
      const by = y + 2;
      const flame = 18 + Math.sin(now / 90) * 5;
      // 尾焰（外橙中黄内白，抖动）
      g.fillStyle(0xff9a3c, 0.85);
      g.fillTriangle(x - 12, by + 12, x + 12, by + 12, x + Math.sin(now / 70) * 3, by + 12 + flame);
      g.fillStyle(0xffe08a, 0.95);
      g.fillTriangle(x - 7, by + 12, x + 7, by + 12, x + Math.sin(now / 55 + 1) * 2, by + 12 + flame * 0.62);
      g.fillStyle(0xffffff, 0.95);
      g.fillTriangle(x - 3, by + 12, x + 3, by + 12, x, by + 12 + flame * 0.32);
      // 双翼（红，带深色前缘）
      g.fillStyle(0xd23b3b, 1);
      g.fillPoints([
        { x: x - 15, y: by + 2 }, { x: x - 30, y: by + 16 }, { x: x - 9, y: by + 12 },
      ], true);
      g.fillPoints([
        { x: x + 15, y: by + 2 }, { x: x + 30, y: by + 16 }, { x: x + 9, y: by + 12 },
      ], true);
      g.fillStyle(0x8a1f1f, 0.9);
      g.fillTriangle(x - 15, by + 2, x - 30, by + 16, x - 24, by + 16);
      g.fillTriangle(x + 15, by + 2, x + 30, by + 16, x + 24, by + 16);
      // 机身（白 + 左侧受光亮面 + 右侧灰面）
      g.fillStyle(0xe8ecf0, 1);
      g.fillRoundedRect(x - 17, by - 16, 34, 29, 12);
      g.fillStyle(0xffffff, 0.75);
      g.fillRoundedRect(x - 14, by - 16, 12, 27, 6);
      g.fillStyle(0xc8ccd4, 0.6);
      g.fillRoundedRect(x + 6, by - 16, 10, 27, 6);
      // 红鼻锥
      g.fillStyle(0xd23b3b, 1);
      g.fillTriangle(x - 15, by - 12, x + 15, by - 12, x, by - 30);
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(x - 6, by - 14, x - 1, by - 14, x - 3, by - 22);
      // 舷窗（窗框 + 玻璃高光）
      g.fillStyle(0xd23b3b, 1);
      g.fillCircle(x, by - 2, 8.4);
      g.fillStyle(0x9fe8ff, 1);
      g.fillCircle(x, by - 2, 5.8);
      g.fillStyle(0xffffff, 0.85);
      g.fillCircle(x - 1.8, by - 3.8, 2);
      // 机身红条纹
      g.fillStyle(0xd23b3b, 0.95);
      g.fillRect(x - 16, by + 6, 32, 3);
      break;
    }

    // ---- 浮空王座：金雕王座 + 绒垫 + 宝石顶饰 + 底座金光 --------------------
    case 'throne': {
      const by = y - 2 + bob;
      const wood = 0xa06a24, woodDark = 0x7a4e18, gold = 0xffd45c, goldDark = 0xc8981e;
      // 底部悬浮金光
      g.fillStyle(gold, 0.16 + 0.06 * Math.sin(now / 400));
      g.fillEllipse(x, by + 22, 84, 16);
      // 靠背两根立柱（木 + 金帽）
      g.fillStyle(wood, 1);
      g.fillRoundedRect(x - 36, by - 38, 14, 44, 5);
      g.fillRoundedRect(x + 22, by - 38, 14, 44, 5);
      g.fillStyle(woodDark, 0.8);
      g.fillRect(x - 30, by - 38, 3, 44);
      g.fillRect(x + 28, by - 38, 3, 44);
      g.fillStyle(gold, 1);
      g.fillCircle(x - 29, by - 40, 5.4);
      g.fillCircle(x + 29, by - 40, 5.4);
      // 靠背顶梁（木 + 中央尖饰 + 三颗宝石）
      g.fillStyle(wood, 1);
      g.fillRoundedRect(x - 36, by - 52, 72, 16, 6);
      g.fillStyle(gold, 1);
      g.fillTriangle(x - 8, by - 52, x + 8, by - 52, x, by - 66);
      g.fillStyle(goldDark, 0.9);
      g.fillRect(x - 36, by - 44, 72, 3);
      g.fillStyle(0xe8404a, 0.95);
      g.fillCircle(x - 20, by - 44, 2.8);
      g.fillCircle(x, by - 45, 3.2);
      g.fillCircle(x + 20, by - 44, 2.8);
      // 座面（木 + 前缘金线）
      g.fillStyle(woodDark, 1);
      g.fillRoundedRect(x - 36, by - 8, 72, 22, 6);
      g.fillStyle(wood, 0.9);
      g.fillRoundedRect(x - 36, by - 8, 72, 14, 6);
      g.fillStyle(gold, 0.85);
      g.fillRect(x - 32, by + 4, 64, 2);
      // 红绒坐垫（菱格纹 + 垂穗）
      g.fillStyle(0xc0392b, 1);
      g.fillRoundedRect(x - 24, by - 13, 48, 12, 4);
      g.lineStyle(1.2, 0xe86a5a, 0.8);
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.moveTo(x - 16 + k * 16, by - 12); g.lineTo(x - 8 + k * 16, by - 2);
        g.strokePath();
      }
      g.fillStyle(gold, 0.9);
      for (let k = 0; k < 4; k++) g.fillCircle(x - 18 + k * 12, by - 1, 1.8);
      break;
    }

    // ---- 飞碟：碟身 + 玻璃罩里的小外星人 + 绕碟一圈的灯 --------------------
    case 'ufo': {
      const by = y - 16 + bob * 1.6;
      // 朝地面投下的一束绿光
      g.fillStyle(0x6fe09a, 0.16 + 0.08 * Math.sin(now / 260));
      g.beginPath();
      g.moveTo(x - 16, by + 10);
      g.lineTo(x + 16, by + 10);
      g.lineTo(x + 46, y + 24);
      g.lineTo(x - 46, y + 24);
      g.closePath();
      g.fillPath();
      // 碟身
      g.fillStyle(0x8fa6b8, 1);
      g.fillEllipse(x, by + 4, 96, 22);
      g.fillStyle(color, 1);
      g.fillEllipse(x, by - 3, 86, 18);
      g.fillStyle(0xd8e6f0, 0.9);
      g.fillEllipse(x, by - 6, 56, 10);
      // 玻璃罩 + 里面那只小外星人
      g.fillStyle(0x9fe8ff, 0.32);
      g.fillCircle(x, by - 19, 19);
      g.fillStyle(0x6fe09a, 1);
      g.fillEllipse(x, by - 17, 16, 20);
      g.fillStyle(0x0e1a14, 1);
      g.fillEllipse(x - 4, by - 20, 5.5, 7);
      g.fillEllipse(x + 4, by - 20, 5.5, 7);
      g.lineStyle(2, 0xd8e6f0, 0.75);
      g.strokeCircle(x, by - 19, 19);
      // 绕碟一圈交替闪的灯
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + now / 300;
        g.fillStyle(k % 2 ? 0xffd45c : 0x6fe09a, 0.9);
        g.fillCircle(x + Math.cos(a) * 40, by + 3 + Math.sin(a) * 8, 2.6);
      }
      break;
    }

    // ==== 宇宙龙域限定 ========================================================
    case 'stardrake': {
      // 星渊龙驹：卧在脚下的小星龙，翅膀慢慢扇，尾尖一点金光
      const flap = Math.sin(now / 220);
      g.fillStyle(0x2a224e, 0.5);
      g.fillEllipse(x, y - 6, 54, 16);
      g.fillStyle(0x3a2f6b, 1);
      g.fillEllipse(x, y - 16 + bob, 46, 24);
      // 尾巴 + 尾尖的金光
      g.fillTriangle(
        x - f * 20, y - 18 + bob,
        x - f * 20, y - 8 + bob,
        x - f * 36 + Math.sin(now / 260) * 4, y - 14 + bob,
      );
      g.fillStyle(0xffd45c, 0.9);
      g.fillCircle(x - f * 36 + Math.sin(now / 260) * 4, y - 14 + bob, 2.6);
      // 一对星翼
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 12, y - 24 + bob);
        g.rotateCanvas(s * (0.6 + flap * 0.3));
        g.fillStyle(0x5a4a9a, 0.95);
        g.fillTriangle(0, 0, s * 20, -16, s * 22, 2);
        g.restore();
      }
      // 抬着的头（星云色的眼睛望着你）
      g.fillStyle(0x3a2f6b, 1);
      g.fillEllipse(x + f * 16, y - 26 + bob, 24, 18);
      g.fillStyle(0x9fe8ff, 1);
      g.fillCircle(x + f * 20, y - 29 + bob, 2.6);
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(x + f * 12, y - 34 + bob, x + f * 17, y - 33 + bob, x + f * 15, y - 41 + bob);
      // 背上的鞍位
      g.fillStyle(0x8f7bff, 0.7);
      g.fillEllipse(x, y - 26 + bob, 20, 8);
      break;
    }

    // ==== 金币商店那批「普通款」（1~3★）：造型简单，但各有一个小动作 ==========
    // 参考现有那批的尺度：都在 ±50 以内、贴着 feetY 画，所以不会和判定冲突。

    // ---- 滑板车：两个轮子在转 + 把手轻轻摇 --------------------------------
    case 'scooter': {
      const spin = now / 110;
      // 轮子（胎 + 轮毂 + 辐条）
      for (const wx of [-22, 22]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 8, 6.4);
        g.fillStyle(0xe8e4d8, 1);
        g.fillCircle(x + wx, y + 8, 3.2);
        g.lineStyle(1.2, 0x8fa6b8, 0.9);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 3, y + 8 + Math.sin(a) * 3);
        }
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 8, 1);
      }
      // 踏板（主色 + 顶面受光 + 底面暗缘 + 描边）
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(x, y + 12, 52, 7);
      g.fillStyle(0x1a1a20, 1);
      g.fillRoundedRect(x - 31, y - 2, 62, 9, 4.5);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 30, y - 3, 60, 7, 3.5);
      g.fillStyle(0xffffff, 0.3);
      g.fillRoundedRect(x - 26, y - 2.4, 52, 1.6, 0.8);
      // 立杆 + 把手（摇摆，带握把套）
      const sway = Math.sin(now / 520) * 2.4;
      g.fillStyle(0x8fa6b8, 1);
      g.fillRect(x + f * 24 - 2, y - 26 + sway * 0.5, 4, 26);
      g.fillStyle(0x5f7488, 0.8);
      g.fillRect(x + f * 24 - 2, y - 26 + sway * 0.5, 1.6, 26);
      g.fillStyle(0x1a1a20, 1);
      g.fillRoundedRect(x + f * 24 - 10, y - 31 + sway * 0.5, 20, 5, 2.5);
      g.fillStyle(0xe8404a, 0.9);
      g.fillRoundedRect(x + f * 24 - 10, y - 31 + sway * 0.5, 6, 5, 2.5);
      g.fillRoundedRect(x + f * 24 + 4, y - 31 + sway * 0.5, 6, 5, 2.5);
      break;
    }

    // ---- 圆木：木纹横向滚动 + 端面年轮 + 树皮暗缘 --------------------------
    case 'log': {
      // 底部暗面
      g.fillStyle(0x4a3018, 1);
      g.fillRoundedRect(x - 44, y - 6, 88, 21, 11);
      // 树皮主体
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 44, y - 14, 88, 24, 12);
      // 顶部受光
      g.fillStyle(0xffffff, 0.14);
      g.fillRoundedRect(x - 40, y - 13, 80, 5, 2.5);
      // 滚动的木纹 + 两枚树结
      const off = (now / 9) % 14;
      g.fillStyle(0x5a3f22, 0.55);
      for (let k = -3; k <= 3; k++) {
        const lx = x + k * 14 + (f > 0 ? -off : off);
        g.fillRect(lx - 1, y - 13, 2.4, 22);
      }
      g.fillStyle(0x5a3f22, 0.7);
      g.fillCircle(x - 14 + (f > 0 ? -off % 28 : off % 28), y - 3, 2.6);
      // 描边
      g.lineStyle(1.6, 0x3a2610, 0.7);
      g.strokeRoundedRect(x - 44, y - 14, 88, 24, 12);
      // 端面年轮（外圈树皮 + 三道年轮 + 中心点）
      const ex = x + f * 44;
      g.fillStyle(0x8a6238, 1);
      g.fillCircle(ex, y - 2, 13);
      g.fillStyle(0xc9a05c, 0.9);
      g.fillCircle(ex, y - 2, 10);
      g.lineStyle(1.4, 0x5a3f22, 0.85);
      g.strokeCircle(ex, y - 2, 9);
      g.strokeCircle(ex, y - 2, 5.4);
      g.strokeCircle(ex, y - 2, 2.2);
      break;
    }

    // ---- 纸箱：一路颠，两片箱盖反向翘 + 胶带 + 印章 ------------------------
    case 'box': {
      const j = Math.sin(now / 90) * 1.4;
      const flap = Math.sin(now / 260) * 0.4;
      // 地影
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(x, y + 4 + j, 58, 7);
      // 箱体（三层：暗底 / 主面 / 顶受光）
      g.fillStyle(0x9a6e3c, 1);
      g.fillRoundedRect(x - 32, y - 20 + j, 64, 23, 4);
      g.fillStyle(0xb98a52, 1);
      g.fillRoundedRect(x - 32, y - 22 + j, 64, 22, 4);
      g.fillStyle(0xa87a44, 1);
      g.fillRect(x - 32, y - 22 + j, 64, 5);
      // 箱盖（反向翘）
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 16, y - 22 + j);
        g.rotateCanvas(s * flap);
        g.fillStyle(0xc99a5c, 1);
        g.fillRect(-16, -7, 32, 8);
        g.fillStyle(0x8a6238, 0.6);
        g.fillRect(-16, -1, 32, 2);
        g.restore();
      }
      // 米色胶带（中缝 + 两侧撕口）
      g.fillStyle(0xd8c08a, 0.95);
      g.fillRect(x - 5, y - 20 + j, 10, 22);
      g.fillStyle(0xb9a06a, 0.7);
      g.fillRect(x - 5, y - 9 + j, 10, 1.4);
      // 「易碎」印章杯印
      g.lineStyle(1.6, 0x6b4a26, 0.7);
      g.strokeCircle(x - 18, y - 8 + j, 5.4);
      g.strokeCircle(x + 18, y - 8 + j, 5.4);
      // 侧面描边
      g.lineStyle(1.4, 0x7a5426, 0.6);
      g.strokeRoundedRect(x - 32, y - 22 + j, 64, 24, 4);
      break;
    }

    // ---- 弹簧：压一压弹一弹 + 顶板缓冲垫 ----------------------------------
    case 'spring': {
      const t = Math.abs(Math.sin(now / 320)); // 1 = 压到底
      const h = 8 + (1 - t) * 22;
      // 底座（金属 + 铆钉）
      g.fillStyle(0x5f7488, 1);
      g.fillRoundedRect(x - 18, y - 3, 36, 7, 3.5);
      g.fillStyle(0x8fa6b8, 1);
      g.fillRoundedRect(x - 17, y - 4, 34, 5.4, 2.7);
      g.fillStyle(0x2b2b33, 0.8);
      for (const dx of [-12, 0, 12]) g.fillCircle(x + dx, y - 1, 1.1);
      // 弹簧圈（螺旋 + 高光缘）
      g.lineStyle(4, color, 1);
      for (let k = 0; k < 4; k++) {
        g.strokeEllipse(x, y - 8 - (k / 4) * h, 26 - k, 7 - k * 0.6);
      }
      g.lineStyle(1.4, 0xffffff, 0.4);
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.ellipse(x - 4, y - 8.6 - (k / 4) * h, 9 - k * 0.3, 2.4 - k * 0.2, 0, Math.PI * 0.9, Math.PI * 1.7);
        g.strokePath();
      }
      // 顶板（踩踏板 + 高光）
      g.fillStyle(0x8fa6b8, 1);
      g.fillRoundedRect(x - 19, y - 13 - h, 38, 7, 3.5);
      g.fillStyle(0xd8e6f0, 1);
      g.fillRoundedRect(x - 18, y - 12.6 - h, 36, 4.6, 2.3);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(x - 14, y - 12 - h, 28, 1.2);
      break;
    }

    // ---- 独轮小推车：轮子转 + 车斗前后倾 + 支架 ---------------------------
    case 'cart': {
      const spin = now / 95;
      const tilt = Math.sin(now / 720) * 0.06;
      // 车斗（主色 + 内斗暗面 + 斗缘）
      g.save();
      g.translateCanvas(x, y + 7);
      g.rotateCanvas(tilt);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(-31, -19, 62, 18, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-31, -21, 62, 17, 4);
      g.fillStyle(0x000000, 0.18);
      g.fillRoundedRect(-27, -17, 54, 8, 3);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(-31, -24, 62, 4, 2);
      g.fillStyle(0xffffff, 0.25);
      g.fillRect(-27, -20, 54, 1.6);
      g.restore();
      // 轮子（胎 + 四辐条 + 轮毂）
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(x, y + 9, 10);
      g.fillStyle(0xd8c08a, 1);
      g.fillCircle(x, y + 9, 4);
      g.lineStyle(2, color, 0.95);
      for (let k = 0; k < 4; k++) {
        const a = spin + (k / 4) * Math.PI * 2;
        g.lineBetween(x, y + 9, x + Math.cos(a) * 7.6, y + 9 + Math.sin(a) * 7.6);
      }
      g.lineStyle(1.6, 0x1a1a20, 0.7);
      g.strokeCircle(x, y + 9, 10);
      // 支架腿 + 把手
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x + f * 30 - 3, y - 18, 6, 20, 3);
      g.fillStyle(0x6b4a26, 0.9);
      g.fillRect(x + f * 30 - 3 + (f > 0 ? 3 : 0), y - 18, 3, 20);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x + f * 32 - 11, y - 23, 22, 5, 2.5);
      g.fillStyle(0x1a1a20, 0.9);
      g.fillRoundedRect(x + f * 32 - 12, y - 24, 5, 7, 2);
      break;
    }

    // ---- 扫帚：帚须左右扫 + 身后扬起星尘 ---------------------------------
    case 'broom': {
      const sway = Math.sin(now / 240) * 3.4;
      // 帚柄（木纹 + 高光 + 把手缠带）
      g.fillStyle(0x6b4a26, 1);
      g.fillRoundedRect(x - 44, y - 8, 68, 7, 3.5);
      g.fillStyle(0x8a6238, 1);
      g.fillRoundedRect(x - 44, y - 9, 68, 4.4, 2.2);
      g.fillStyle(0xffffff, 0.25);
      g.fillRect(x - 40, y - 8.4, 58, 1.2);
      g.fillStyle(0x2a2a34, 0.9);
      g.fillRoundedRect(x - 46, y - 10, 8, 9, 3); // 柄尾
      // 捆扎箍（两道）
      g.fillStyle(0xc0392b, 1);
      g.fillRect(x + 16, y - 11, 5, 11);
      g.fillStyle(0xa32e2e, 0.8);
      g.fillRect(x + 16, y - 11, 5, 3);
      g.fillStyle(0xd9b45c, 0.9);
      g.fillRect(x + 23, y - 10, 3, 9);
      // 帚须（两层：暗底须 + 亮须，随摆）
      g.lineStyle(2.6, 0xc9a05c, 0.9);
      for (let k = 0; k < 6; k++) {
        const bx = x + 23 + k * 3.2;
        g.lineBetween(bx, y - 8, bx + 9 + sway * 0.4, y + 4 + k * 1.1 + sway);
      }
      g.lineStyle(2, color, 0.95);
      for (let k = 0; k < 6; k++) {
        const bx = x + 24 + k * 3;
        g.lineBetween(bx, y - 8, bx + 8 + sway * 0.3, y + 1 + k * 0.9 + sway);
      }
      // 星尘（三粒上浮渐隐）
      for (let k = 0; k < 3; k++) {
        const t = ((now / 1200 + k / 3) % 1);
        g.fillStyle(0xffe08a, 0.55 * (1 - t));
        g.fillCircle(x - f * (8 + t * 42), y - 2 - t * 16, 2.6 - t * 1.2);
      }
      break;
    }

    // ---- 小乌龟：四条腿交替划 + 脑袋一伸一缩 -----------------------------
    case 'turtle': {
      const step = Math.sin(now / 320);
      const skin = 0x6fae4f, skinDark = 0x4f8a38;
      // 地影
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(x, y + 6, 60, 8);
      // 四条腿（交替划，带爪趾）
      for (const [dx, ph] of [[-27, 1], [15, -1], [-15, -1], [5, 1]] as const) {
        const off = step * 2.4 * ph;
        g.fillStyle(skin, 1);
        g.fillRoundedRect(x + dx, y - 1 + off, 12, 8, 3.5);
        g.fillStyle(skinDark, 0.8);
        g.fillRoundedRect(x + dx, y + 3.4 + off, 12, 3.6, 1.8);
      }
      // 尾巴尖
      g.fillStyle(skin, 1);
      g.fillTriangle(x - f * 30, y - 4, x - f * 41, y, x - f * 30, y + 3);
      // 龟壳（主壳 + 盾片网格 + 壳缘一圈 + 高光）
      g.fillStyle(0x2f6b2a, 1);
      g.fillEllipse(x, y - 7.4, 64, 27);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 9, 62, 25);
      g.fillStyle(0x2f6b2a, 0.45);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 15, y - 9, 10, 13);
      g.lineStyle(1.2, 0x2f6b2a, 0.6);
      g.strokeEllipse(x, y - 9, 44, 17);
      g.fillStyle(0xffffff, 0.22);
      g.fillEllipse(x - 10, y - 15, 22, 5);
      // 头（伸缩 + 眼睛高光 + 嘴线）
      const neck = 1 + Math.sin(now / 700) * 0.4;
      g.fillStyle(skin, 1);
      g.fillEllipse(x + f * (26 + neck * 6), y - 13, 20 * neck + 6, 13);
      g.fillStyle(skinDark, 0.6);
      g.fillEllipse(x + f * (26 + neck * 6), y - 9.4, 18 * neck + 4, 5);
      g.fillStyle(0x1c2a14, 1);
      g.fillCircle(x + f * (30 + neck * 6), y - 15, 2);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + f * (30.8 + neck * 6), y - 15.8, 0.8);
      break;
    }

    // ---- 小自行车：前后轮转 + 脚踏跟着转 --------------------------------
    case 'bike': {
      const spin = now / 90;
      g.lineStyle(1.8, 0xdfe6f0, 0.95);
      for (const wx of [-24, 24]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 7, 11);
        for (let k = 0; k < 4; k++) {
          const a = spin + (k / 4) * Math.PI * 2;
          g.lineBetween(x + wx, y + 7, x + wx + Math.cos(a) * 8.5, y + 7 + Math.sin(a) * 8.5);
        }
      }
      g.lineStyle(3.4, color, 1);
      g.lineBetween(x - 24, y + 7, x - 2, y - 12);
      g.lineBetween(x - 2, y - 12, x + 24, y + 7);
      g.lineBetween(x - 2, y - 12, x + f * 16, y - 16);
      g.lineBetween(x - 24, y + 7, x - 2, y + 7);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x + f * 16 - 9, y - 21, 18, 5, 2.5);
      // 脚踏（转）
      const pa = Math.sin(spin) * 6;
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(x - 2 + pa, y + 2, 3.2);
      g.fillCircle(x - 2 - pa, y + 2, 3.2);
      break;
    }

    // ---- 悬浮板：上下浮 + 底下两股喷流 -----------------------------------
    case 'hover': {
      const hb = y - 12 + Math.sin(now / 380) * 4;
      const jet = 12 + Math.sin(now / 70) * 4;
      for (const s of [-1, 1]) {
        g.fillStyle(0x6fe3ff, 0.35);
        g.fillTriangle(
          x + s * 14 - 6,
          hb + 5,
          x + s * 14 + 6,
          hb + 5,
          x + s * 14 + Math.sin(now / 120 + s) * 3,
          hb + 5 + jet,
        );
      }
      g.fillStyle(0x3a4a5c, 1);
      g.fillRoundedRect(x - 34, hb, 68, 9, 4.5);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 32, hb - 4, 64, 6, 3);
      g.fillStyle(0x9fe8ff, 0.9 + 0.1 * Math.sin(now / 130));
      g.fillRoundedRect(x - 26, hb + 1, 52, 2.6, 1.3);
      break;
    }

    // ---- 鲨鱼：尾巴左右摆 + 两侧水花 -------------------------------------
    case 'shark': {
      const tail = Math.sin(now / 260) * 0.5;
      g.fillStyle(0x6f9fce, 0.35);
      g.fillEllipse(x, y + 4, 104, 14);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 6, 86, 26);
      g.fillEllipse(x + f * 38, y - 10, 34, 20);
      g.fillTriangle(x - f * 10, y - 18, x + f * 12, y - 20, x - f * 2, y - 32);
      g.save();
      g.translateCanvas(x - f * 40, y - 4);
      g.rotateCanvas(f * tail);
      g.fillStyle(color, 1);
      g.fillTriangle(-f * 6, 0, -f * 26, -12, -f * 24, 8);
      g.restore();
      g.fillStyle(0x0e1a24, 1);
      g.fillCircle(x + f * 44, y - 12, 2.6);
      g.fillStyle(0xffffff, 0.8);
      for (let k = 0; k < 4; k++) {
        const wx = x + f * (18 + k * 6);
        g.fillTriangle(wx, y - 16, wx + f * 3, y - 12, wx, y - 18);
      }
      break;
    }

    // ---- 小黄龙滚滚：小黄龙趴着打滚，小短腿朝天 ----------------------------
    case 'nailongRoll': {
      const by = y - 10;
      const spin = now / 260;
      // 尾巴 + 身子
      g.fillStyle(0xefb81e, 1);
      g.fillEllipse(x - f * 30, by + 6, 26, 14);
      g.fillStyle(color, 1);
      g.fillCircle(x, by + 2, 22);
      g.fillStyle(0xfff3bd, 1);
      g.fillEllipse(x, by + 8, 26, 20);
      // 脑袋
      g.fillStyle(color, 1);
      g.fillCircle(x + f * 26, by - 10, 16);
      g.fillStyle(0xefb81e, 1);
      g.fillCircle(x + f * 20, by - 24, 4.5);
      g.fillCircle(x + f * 32, by - 24, 4.5);
      g.fillStyle(0x3a2a06, 1);
      g.fillCircle(x + f * 22, by - 12, 3);
      g.fillCircle(x + f * 32, by - 12, 3);
      g.fillStyle(0x8a3a2a, 1);
      g.fillEllipse(x + f * 28, by - 4, 7, 5);
      // 朝天的小短腿（跟着转）
      g.fillStyle(0xefb81e, 1);
      for (let k = 0; k < 2; k++) {
        const a = spin + k * Math.PI;
        g.fillCircle(x + Math.cos(a) * 14, by - 16 + Math.sin(a) * 4, 5);
      }
      break;
    }

    // ==== 主题宝箱专属坐骑（每个主题一只，见 game/chest.ts 的 CHEST_THEMES）=======

    // ---- 小海豚：拱着背跃出水面，底下一汪水花 ------------------------------
    case 'dolphin': {
      const hop = Math.abs(Math.sin(now / 500)) * 6;
      const dy = y - 10 - hop;
      g.fillStyle(0x9fd8f0, 0.5);
      g.fillEllipse(x, y + 2, 80, 12);
      g.fillStyle(color, 1);
      g.fillEllipse(x, dy, 70, 24);
      g.fillEllipse(x + f * 34, dy - 6, 26, 18);
      g.fillTriangle(x - f * 4, dy - 12, x + f * 12, dy - 10, x + f * 2, dy - 24);
      g.save();
      g.translateCanvas(x - f * 34, dy + 2);
      g.rotateCanvas(f * Math.sin(now / 260) * 0.5);
      g.fillTriangle(0, 0, -f * 20, -10, -f * 18, 8);
      g.restore();
      g.fillStyle(0xd8f0ff, 1);
      g.fillEllipse(x + f * 12, dy + 2, 26, 8);
      g.fillStyle(0x0e1a24, 1);
      g.fillCircle(x + f * 40, dy - 8, 2.4);
      break;
    }

    // ---- 南瓜车：小南瓜安上轮子，车灯一闪一闪 ------------------------------
    case 'pumpkincart': {
      const spin = now / 120;
      g.lineStyle(1.6, 0x6b4a26, 0.95);
      for (const wx of [-22, 22]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 8, 7);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 5.4, y + 8 + Math.sin(a) * 5.4);
        }
      }
      // 南瓜车斗：几瓣鼓起来
      g.fillStyle(color, 1);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 13, y - 8, 18, 26);
      g.fillStyle(0x4a7a2a, 1);
      g.fillRect(x - 2, y - 24, 4, 6);
      // 车灯（会闪的南瓜眼）
      const glow = 0.6 + 0.4 * Math.sin(now / 240);
      g.fillStyle(0xffd45c, glow);
      g.fillTriangle(x + f * 8, y - 12, x + f * 16, y - 12, x + f * 12, y - 18);
      g.fillTriangle(x - f * 4, y - 12, x - f * 12, y - 12, x - f * 8, y - 18);
      break;
    }

    // ---- 齿轮机车：一台小蒸汽机车，烟囱冒烟、连杆在动 ----------------------
    case 'gearbike': {
      const spin = now / 90;
      g.fillStyle(0x2b2b33, 1);
      for (const wx of [-20, 14]) {
        g.fillCircle(x + wx, y + 8, 8);
      }
      g.lineStyle(1.6, 0xd8e0ea, 0.9);
      for (const wx of [-20, 14]) {
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 6, y + 8 + Math.sin(a) * 6);
        }
      }
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 34, y - 14, 62, 20, 5);
      g.fillStyle(0x59657a, 1);
      g.fillRect(x - 34, y - 2, 62, 4);
      // 驾驶室 + 烟囱（冒烟）
      g.fillStyle(0x59657a, 1);
      g.fillRoundedRect(x + f * 14, y - 30, 16, 18, 3);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - f * 26 - 4, y - 28, 10, 16, 3);
      for (let k = 0; k < 3; k++) {
        const t = (now / 900 + k / 3) % 1;
        g.fillStyle(0xdfe6f0, 0.5 * (1 - t));
        g.fillCircle(x - f * 22 + Math.sin(t * 6) * 4, y - 32 - t * 22, 4 + t * 5);
      }
      break;
    }

    // ---- 小狮子：金鬃毛的大猫，尾巴尖一撮毛晃来晃去 ------------------------
    case 'lion': {
      const breath = Math.sin(now / 500);
      g.lineStyle(4, color, 1);
      g.beginPath();
      g.moveTo(x - f * 26, y - 10);
      g.lineTo(x - f * 40, y - 16);
      g.strokePath();
      g.fillStyle(0x8a5a2a, 1);
      g.fillCircle(x - f * 42, y - 17, 4);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 8 + breath * 0.8, 60, 28);
      for (const dx of [-18, -6, 8, 20]) g.fillRoundedRect(x + dx - 3, y - 2, 6, 10, 3);
      // 鬃毛（一圈锯齿）+ 脸
      g.fillStyle(0xb8822a, 1);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        g.fillCircle(x + f * 24 + Math.cos(a) * 13, y - 18 + Math.sin(a) * 13, 5.4);
      }
      g.fillStyle(color, 1);
      g.fillCircle(x + f * 24, y - 18, 11);
      g.fillStyle(0x3a2a10, 1);
      g.fillCircle(x + f * 20, y - 20, 1.8);
      g.fillCircle(x + f * 28, y - 20, 1.8);
      g.fillTriangle(x + f * 22, y - 14, x + f * 26, y - 14, x + f * 24, y - 11);
      break;
    }

    // ---- 春风纸鸢：一只燕子风筝，飘在脚下、飘带跟着风摆 --------------------
    case 'kite': {
      const dy = y - 14 + Math.sin(now / 420) * 4;
      const sway = Math.sin(now / 380) * 4;
      g.save();
      g.translateCanvas(x, dy);
      g.rotateCanvas(Math.sin(now / 620) * 0.1);
      // 菱形风筝面
      g.fillStyle(color, 1);
      g.fillTriangle(0, -24, -20, 0, 0, 24);
      g.fillTriangle(0, -24, 20, 0, 0, 24);
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(0, -24, -20, 0, 0, 0);
      g.fillStyle(0x8a4a6a, 0.8);
      g.fillTriangle(0, -8, -8, 0, 8, 0);
      g.restore();
      // 骨架 + 两条飘带
      g.lineStyle(1.6, 0x5a3a4a, 0.8);
      g.lineBetween(x, dy - 24, x, dy + 24);
      g.lineBetween(x - 20, dy, x + 20, dy);
      g.lineStyle(2.4, 0xffd45c, 0.95);
      g.lineBetween(x, dy + 24, x + sway, dy + 40);
      g.lineBetween(x + sway, dy + 40, x - sway * 0.6, dy + 54);
      break;
    }

    // ---- 弯月舟：坐进一弯月牙里，星星围着你转 ------------------------------
    case 'crescent': {
      const dy = y - 12 + Math.sin(now / 440) * 4;
      g.fillStyle(color, 1);
      // 月牙：大圆减出弧形——用两个圆近似
      g.fillCircle(x, dy, 26);
      g.fillStyle(0x2a3a8a, 0.0);
      g.fillCircle(x + f * 12, dy - 6, 20);
      g.fillStyle(0x3a2a10, 0.0);
      g.fillEllipse(x, dy, 1, 1);
      // 弧面上的月斑
      g.fillStyle(0xd8b870, 0.7);
      g.fillCircle(x - f * 10, dy + 6, 3.4);
      g.fillCircle(x + f * 2, dy + 12, 2.6);
      g.fillCircle(x + f * 12, dy + 2, 2.2);
      // 上弦的内弧阴影
      g.fillStyle(0xc9a44a, 0.45);
      g.fillEllipse(x + f * 14, dy - 10, 22, 10);
      // 绕着转的小星星
      for (const s of [0, Math.PI, Math.PI / 2]) {
        const a = now / 500 + s;
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(x + Math.cos(a) * 34, dy + Math.sin(a) * 16 - 4, 2);
      }
      break;
    }

    // ---- 烈焰火轮：一只烧着的火轮滚在脚下，火星乱蹦 ------------------------
    case 'firewheel': {
      const spin = now / 70;
      const dy = y - 4;
      // 外焰（锯齿火苗跟着转）
      for (let k = 0; k < 8; k++) {
        const a = spin + (k / 8) * Math.PI * 2;
        const len = 26 + Math.sin(now / 130 + k) * 5;
        g.fillStyle(0xff7a2a, 0.9);
        g.fillTriangle(
          x + Math.cos(a) * 18, dy + Math.sin(a) * 18,
          x + Math.cos(a + 0.22) * 18, dy + Math.sin(a + 0.22) * 18,
          x + Math.cos(a + 0.11) * len, dy + Math.sin(a + 0.11) * len,
        );
      }
      // 轮盘 + 辐条
      g.fillStyle(color, 1);
      g.fillCircle(x, dy, 17);
      g.fillStyle(0x8a1a08, 1);
      g.fillCircle(x, dy, 8);
      g.lineStyle(2.4, 0xffd45c, 0.9);
      for (let k = 0; k < 4; k++) {
        const a = spin + (k / 4) * Math.PI * 2;
        g.lineBetween(x, dy, x + Math.cos(a) * 15, dy + Math.sin(a) * 15);
      }
      // 身后蹦出的火星
      for (let k = 0; k < 3; k++) {
        const t = (now / 500 + k / 3) % 1;
        g.fillStyle(0xffd45c, 0.7 * (1 - t));
        g.fillCircle(x - f * (20 + t * 26), dy - 8 - t * 14, 2.4 - t);
      }
      break;
    }

    // ---- 雪原熊：白白胖胖的北极熊，走路一晃一晃 ----------------------------
    case 'polarbear': {
      const step = Math.sin(now / 340);
      const dy = y - 12;
      g.fillStyle(color, 1);
      // 四条腿（交替迈）
      g.fillRoundedRect(x - 24, dy + 8 + step * 2, 11, 14, 5);
      g.fillRoundedRect(x + 12, dy + 8 - step * 2, 11, 14, 5);
      g.fillRoundedRect(x - 12, dy + 8 - step * 2, 10, 13, 5);
      g.fillRoundedRect(x + 2, dy + 8 + step * 2, 10, 13, 5);
      // 身子 + 圆头 + 小耳朵
      g.fillEllipse(x, dy, 62, 34);
      g.fillCircle(x + f * 26, dy - 10, 14);
      g.fillCircle(x + f * 20, dy - 22, 5);
      g.fillCircle(x + f * 32, dy - 22, 5);
      // 黑鼻头 + 眯眼
      g.fillStyle(0x2a3a44, 1);
      g.fillEllipse(x + f * 34, dy - 10, 6, 5);
      g.fillCircle(x + f * 24, dy - 12, 1.8);
      g.fillCircle(x + f * 31, dy - 12, 1.8);
      break;
    }

    // ---- 小恐龙：绿皮小恐龙驮着你，背刺跟呼吸起伏 --------------------------
    case 'dino': {
      const br = Math.sin(now / 480);
      const dy = y - 12;
      g.fillStyle(color, 1);
      // 尾巴 + 身子 + 四条短腿
      g.fillTriangle(x - f * 26, dy + 6, x - f * 26, dy - 10, x - f * 44, dy + 4);
      g.fillEllipse(x, dy + 2, 58, 30);
      for (const dx of [-20, -6, 8, 20]) g.fillRoundedRect(x + dx - 3.4, dy + 10, 7, 12, 3.4);
      // 背刺一排（跟着呼吸）
      g.fillStyle(0x2f7a4a, 1);
      for (let k = 0; k < 4; k++) {
        g.fillTriangle(x - f * 18 + k * 11, dy - 10, x - f * 10 + k * 11, dy - 10, x - f * 14 + k * 11, dy - 18 - br * 2);
      }
      // 抬着的头 + 白肚皮 + 眼睛
      g.fillStyle(color, 1);
      g.fillEllipse(x + f * 28, dy - 12, 26, 20);
      g.fillStyle(0xd8f0d0, 1);
      g.fillEllipse(x, dy + 10, 40, 12);
      g.fillStyle(0x0e1a14, 1);
      g.fillCircle(x + f * 32, dy - 16, 2.2);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x + f * 33, dy - 17, 0.8);
      break;
    }

    // ---- 霓虹摩托：一台发光的低趴摩托，轮子转、车尾喷霓虹 ------------------
    case 'laserbike': {
      const spin = now / 80;
      g.lineStyle(1.8, color, 0.95);
      for (const wx of [-24, 24]) {
        g.fillStyle(0x1a1a20, 1);
        g.fillCircle(x + wx, y + 8, 9);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 7, y + 8 + Math.sin(a) * 7);
        }
      }
      // 车身（低趴楔形）+ 发光描边
      g.fillStyle(0x2a2a34, 1);
      g.fillRoundedRect(x - 28, y - 8, 60, 12, 5);
      g.fillStyle(color, 0.9 + 0.1 * Math.sin(now / 150));
      g.fillRoundedRect(x - 26, y - 6, 56, 4, 2);
      // 车头 + 车尾喷的霓虹尾迹
      g.fillStyle(0x2a2a34, 1);
      g.fillRoundedRect(x + f * 22 - 4, y - 22, 8, 16, 3);
      g.fillStyle(color, 0.9);
      g.fillCircle(x + f * 26, y - 24, 3);
      for (let k = 0; k < 4; k++) {
        const t = (now / 400 + k / 4) % 1;
        g.fillStyle(color, 0.5 * (1 - t));
        g.fillEllipse(x - f * (30 + t * 40), y + 2, 16 - t * 8, 5 - t * 2);
      }
      break;
    }
  }
  drawMountFlair(g, now, id, p);
}

/**
 * ★4~5 坐骑专属华彩：31 款高星坐骑在造型之上再叠粒子 / 辉光 / 环绕光点 / 尾迹，
 * 各款配色与运动不同，让高星坐骑一眼比低星更隆重。
 */
function drawMountFlair(
  g: Phaser.GameObjects.Graphics, now: number, id: MountId, pose: CharacterPose,
): void {
  const x = pose.x;
  const y = pose.feetY;
  const f = pose.facing;
  const pulse = 0.5 + 0.5 * Math.sin(now / 460);
  /** 身周呼吸柔光 */
  const glow = (c: number, rx: number, ry: number, al: number): void => {
    g.fillStyle(c, al * (0.6 + 0.4 * pulse));
    g.fillEllipse(x, y - 12, rx, ry);
  };
  /** 向上飘的粒子 */
  const rise = (c: number, n: number, spread: number, period: number, r: number): void => {
    for (let k = 0; k < n; k++) {
      const ph = (now / period + k / n) % 1;
      g.fillStyle(c, 0.7 * (1 - ph));
      g.fillCircle(x + Math.sin(now / 700 + k * 2.1) * spread, y - ph * 70, r * (1 - ph * 0.4));
    }
  };
  /** 环绕坐骑的光点 */
  const orbit = (c: number, n: number, rx: number, ry: number, speed: number, r: number): void => {
    for (let k = 0; k < n; k++) {
      const a = now / speed + (k / n) * Math.PI * 2;
      const px = x + Math.cos(a) * rx;
      const py = y - 14 + Math.sin(a) * ry;
      g.fillStyle(0xffffff, 0.55);
      g.fillCircle(px, py, r * 0.5);
      g.fillStyle(c, 0.85);
      g.fillCircle(px, py, r);
    }
  };
  /** 身后拖的一串尘 */
  const trail = (c: number, n: number): void => {
    for (let k = 0; k < n; k++) {
      const t = (now / 380 + k / n) % 1;
      g.fillStyle(c, 0.5 * (1 - t));
      g.fillCircle(x - f * (18 + t * 48), y - 8 - t * 10, 3.2 * (1 - t) + 0.6);
    }
  };
  switch (id) {
    case 'stardrake': rise(0x9fe8ff, 7, 24, 1100, 2.2); orbit(0xffd45c, 4, 30, 12, 1200, 2.2); break;
    case 'dolphin': trail(0x9fd8f0, 5); glow(0x9fd8f0, 60, 20, 0.14); break;
    case 'pumpkincart': glow(0xffb347, 52, 20, 0.16); rise(0xff9a3c, 6, 22, 1200, 2); break;
    case 'gearbike': rise(0xdfe6f0, 6, 22, 1000, 2.4); glow(0x8fa6b8, 54, 18, 0.12); break;
    case 'lion': glow(0xd08a3a, 54, 22, 0.14); rise(0xffd45c, 5, 22, 1300, 2); break;
    case 'kite': rise(0xffd45c, 6, 26, 1300, 2); trail(0xffd45c, 4); break;
    case 'crescent': orbit(0xffffff, 5, 34, 14, 900, 2.2); glow(0xffe08a, 52, 20, 0.14); break;
    case 'firewheel': rise(0xff7a2a, 9, 24, 700, 2.8); glow(0xff5a2a, 54, 20, 0.18); break;
    case 'polarbear': rise(0xdcf4ff, 6, 24, 1400, 2.2); glow(0xffffff, 54, 20, 0.1); break;
    case 'dino': rise(0x7ed957, 6, 24, 1200, 2.2); glow(0x2f7a4a, 54, 20, 0.12); break;
    case 'laserbike': trail(0x5ac8ff, 6); orbit(0x5ac8ff, 4, 32, 12, 700, 2.4); break;
    case 'sword': orbit(0x9fe8ff, 4, 34, 12, 900, 2.4); glow(0x9fe8ff, 54, 18, 0.14); break;
    case 'horse': trail(0xd8c8a0, 5); glow(0x6f4620, 54, 20, 0.1); break;
    case 'carpet': orbit(0xffd45c, 4, 36, 12, 1100, 2.4); rise(0xffd45c, 5, 24, 1300, 2); break;
    case 'desCamel': rise(0xd08a3a, 6, 24, 1200, 2.2); glow(0xffb347, 54, 20, 0.14); break;
    case 'nimbCloud': glow(0x9ad4ff, 60, 22, 0.14); rise(0xffffff, 6, 24, 1400, 2.2); break;
    case 'confCake': rise(0xffb7d5, 7, 24, 1200, 2.2); glow(0xff8ad4, 52, 20, 0.14); break;
    case 'bigtBall': orbit(0xffd45c, 5, 32, 14, 900, 2.4); glow(0xff5a5a, 52, 20, 0.14); break;
    case 'aegisSteed': glow(0xffd45c, 56, 22, 0.16); orbit(0xffd45c, 5, 34, 14, 1200, 2.4); break;
    case 'chanBoat': rise(0x9fe8b0, 6, 24, 1300, 2.2); glow(0x9effd0, 54, 20, 0.12); break;
    case 'arcanOrb': orbit(0x9a7bff, 5, 32, 14, 900, 2.4); glow(0x5a3aa0, 54, 20, 0.16); break;
    case 'relicBone': rise(0xd8c8a0, 6, 24, 1500, 2); glow(0x8a6a2a, 54, 20, 0.14); break;
    case 'playHorse': rise(0xffd45c, 5, 24, 1200, 2); glow(0x8fa6b8, 54, 20, 0.12); break;
    case 'yuanBoat': rise(0xff5a2a, 7, 24, 900, 2.4); glow(0xff7a2a, 54, 20, 0.16); break;
    case 'shanMountKun': glow(0x5a8ab0, 60, 24, 0.16); orbit(0x9fe8ff, 5, 34, 14, 1100, 2.4); break;
    case 'star': orbit(0xffd45c, 6, 34, 14, 900, 2.6); rise(0xffd45c, 8, 24, 900, 2.4); glow(0xffb03a, 56, 20, 0.16); break;
    case 'dragon': orbit(0x2f9a78, 5, 34, 14, 1000, 2.4); glow(0x2f9a78, 56, 22, 0.14); break;
    case 'rocket': trail(0xff9a3c, 7); rise(0xffe08a, 6, 20, 700, 2.4); glow(0xff9a3c, 50, 18, 0.16); break;
    case 'throne': glow(0xffd45c, 60, 24, 0.16); orbit(0xffd45c, 6, 36, 14, 1100, 2.6); rise(0xffd45c, 6, 26, 1400, 2); break;
    case 'nailongRoll': rise(0xffd45c, 8, 26, 1000, 2.4); glow(0xffd45c, 54, 20, 0.16); orbit(0xefb81e, 4, 32, 12, 900, 2.2); break;
    case 'ufo': orbit(0x6fe09a, 6, 34, 14, 700, 2.6); glow(0x6fe09a, 56, 22, 0.16); rise(0x6fe09a, 6, 24, 1000, 2.2); break;
    // 第三批新主题宝箱的 4★ 坐骑
    case 'pirateMount': trail(0x5fd0c0, 6); glow(0x8a5a2a, 54, 20, 0.14); rise(0xe8c86a, 5, 24, 1200, 2); break;
    case 'steamMount': trail(0x8fd8ff, 6); rise(0xdfe6f0, 6, 22, 1000, 2.4); glow(0xd8a24a, 54, 20, 0.14); break;
    case 'astroMount': orbit(0x9fd8ff, 5, 34, 14, 900, 2.4); glow(0xffb03a, 54, 20, 0.16); trail(0xffb03a, 5); break;
    case 'juraMount': trail(0x7ed957, 5); rise(0x9fe86a, 6, 24, 1200, 2.2); glow(0x395f2a, 54, 20, 0.14); break;
    case 'mushMount': rise(0xa8ff7a, 7, 24, 1300, 2.2); glow(0x8a6a4a, 54, 20, 0.12); break;
    case 'tropicMount': trail(0x5fe8d0, 5); rise(0xbfe8f0, 6, 24, 1400, 2); glow(0x4aa88a, 54, 20, 0.14); break;
    case 'cryptMount': rise(0x9fd8a0, 6, 24, 1500, 2); glow(0x4a4a5a, 54, 20, 0.16); trail(0x9fd8a0, 4); break;
    case 'festivMount': rise(0xffffff, 7, 26, 1200, 2.2); glow(0xffd45c, 54, 20, 0.16); break;
    case 'sushiMount': rise(0xffffff, 5, 22, 1300, 2.2); glow(0x8a6238, 54, 20, 0.12); orbit(0xff8a6a, 4, 32, 12, 1000, 2.2); break;
    case 'wildMount': trail(0xd8c8a0, 6); rise(0xffb03a, 6, 24, 1000, 2.4); glow(0x8a5a2a, 54, 20, 0.14); break;
    default: break;
  }
}
