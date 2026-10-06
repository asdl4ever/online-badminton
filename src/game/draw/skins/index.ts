import {
  zhuLong, xiangLiu, qiongQi, taoTie, taoWu,
  hunDun, jiuweiHu, baShe, guDiao, yuYu,
} from './shanhai';
import { shnSpirit, mcaSpirit } from './batch2';
import { otmSpirit, kjuSpirit } from './batch3';
import { xySpirit, sgmSpirit } from './batch4';

/**
 * 皮肤覆盖层总入口：按 ref 提供重绘后的 painter。
 * `drawCharacter` 在画皮肤前先查这张表——命中就完全走这里的新画法，
 * 未命中的皮肤走原有的 else-if 链 / THEME_SKIN_ART。
 */
export const SKIN_OVERRIDES: Record<string, import('./shared').SkinPainter> = {
  // 🗺️ 山海十怪（重绘批一）
  // 上古神话 / 重装机甲（重绘批二）
  shnSpirit, mcaSpirit,
  // 光之巨人 / 怪兽之王（批三）
  otmSpirit, kjuSpirit,
  // 西游降魔 / 三国烽火（批四）
  xySpirit, sgmSpirit,
};
