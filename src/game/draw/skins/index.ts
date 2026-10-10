import {
  zhuLong, xiangLiu, qiongQi, taoTie, taoWu,
  hunDun, jiuweiHu, baShe, guDiao, yuYu,
} from './shanhai';
import { shnSpirit, mcaSpirit } from './batch2';
import { otmSpirit, kjuSpirit } from './batch3';
import { xySpirit, sgmSpirit } from './batch4';
import { wxSpirit, norseSpirit } from './batch5';
import { egSpirit, njaSpirit } from './batch6';
import { cybSpirit, dgSpirit, chronoSpirit } from './batch7';
import { dunSpirit, aztSpirit, angSpirit } from './batch8';
import { taleSpirit, dinSpirit, catSpirit } from './batch9';
import { esportSpirit, wasteSpirit, idolSpirit } from './batch10';
import { slimeSpirit, nekSpirit, btlSpirit } from './batch11';
import { tfSpirit, spdSpirit, bstSpirit } from './batch12';
import { lochSpirit, boonSpirit, bigfSpirit, boonTwo, boonQiang } from './batch13';
import { nianSpirit, wolfSpirit, zombSpirit, toilSpirit } from './batch14';
import { ghidSpirit, mthrSpirit, tksSpirit, titanSpirit, leviSpirit } from './batch15';
import { vdaDeity, takAmaterasu, celtDruid, mesoMarduk, cthCthulhu } from './batch16';
import { slavBaba, persSimurgh, incaInti, polyMaui, auzRainbowSerpent } from './batch17';
import { nanoQueen, dataPrism, warpPilot, marsPioneer, forerGuardian } from './batch18';
import { glacLeviathan, fridAngler, walrKing, dimDevourer, hadalLurefish } from './batch19';
import { cretTyrant, swampCroc, iceageSaber, yorShango, kalVain, banKing, memeFrog, officeSlacker, gnomeElder, trashKing } from './batch20';
import { dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse } from './batch21';
import { scpStatue, keterFlesh, shyGiant, rakeThing, wendiStag, mothmSeer, gbeastPrime, crawCrawler, mutoQueen, beheTitan } from './batch22';

/**
 * 皮肤覆盖层总入口：�?ref 提供重绘后的 painter�?
 * `drawCharacter` 在画皮肤前先查这张表——命中就完全走这里的新画法，
 * 未命中的皮肤走原有的 else-if �?/ THEME_SKIN_ART�?
 */
export const SKIN_OVERRIDES: Record<string, import('./shared').SkinPainter> = {
  // 🗺�?山海十怪（重绘批一�?
  zhuLong, xiangLiu, qiongQi, taoTie, taoWu,
  hunDun, jiuweiHu, baShe, guDiao, yuYu,
  // 上古神话 / 重装机甲（重绘批二）
  shnSpirit, mcaSpirit,
  // 光之巨人 / 怪兽之王（批三）
  otmSpirit, kjuSpirit,
  // 西游降魔 / 三国烽火（批四）
  xySpirit, sgmSpirit,
  // 武侠江湖 / 北欧神域（批五）
  wxSpirit, norseSpirit,
  // 法老秘�?/ 暗部忍道（批六）
  egSpirit, njaSpirit,
  // 赛博都市 / 东海龙宫 / 时空旅行（批七）
  cybSpirit, dgSpirit, chronoSpirit,
  // 敦煌飞天 / 羽蛇神殿 / 圣辉天界（批八）
  dunSpirit, aztSpirit, angSpirit,
  // 童话王国 / 深夜食堂 / 猫咖物语（批九）
  taleSpirit, dinSpirit, catSpirit,
  // 电竞赛场 / 末日废土 / 星光偶像（批十）
  esportSpirit, wasteSpirit, idolSpirit,
  slimeSpirit, nekSpirit, btlSpirit,
  // 变形机甲 / 蛛网游侠 / 钢铁巨兽（批十二�?
  tfSpirit, spdSpirit, bstSpirit,
  // 尼斯湖水�?/ 熊大 / 大脚怪（批十三）
  lochSpirit, boonSpirit, bigfSpirit,
  // 熊出没追加：熊二 / 光头�?
  boonTwo, boonQiang,
  // 年兽 / 狼王 / 丧尸�?/ 大便人（批十四）
  nianSpirit, wolfSpirit, zombSpirit, toilSpirit,
  // 基多�?/ 魔斯�?/ 合体机甲 / 火山泰坦 / 深海巨妖（批十五�?
  ghidSpirit, mthrSpirit, tksSpirit, titanSpirit, leviSpirit,
  // 三相�?/ 天照 / 大德鲁伊 / 马尔杜克 / 克苏鲁（批十�?神话�?
  vdaDeity, takAmaterasu, celtDruid, mesoMarduk, cthCthulhu,
  // 芭芭雅嘎 / 西摩�?/ 因蒂 / 毛伊 / 虹蛇（第六批 民俗神话�?
  slavBaba, persSimurgh, incaInti, polyMaui, auzRainbowSerpent,
  // 纳米女皇 / 超级AI / 领航�?/ 开拓�?/ 先行者（第七�?宇宙科幻�?
  nanoQueen, dataPrism, warpPilot, marsPioneer, forerGuardian,
  // 冰海利维�?/ 极夜鮟鱇 / 海象�?/ 维度吞噬�?/ 虚空灯笼鱼神（第八批 海洋怪兽�?
  glacLeviathan, fridAngler, walrKing, dimDevourer, hadalLurefish,
  // 恐龙 / 史前 / 神话 / 恶搞（第九批）
  cretTyrant, swampCroc, iceageSaber, yorShango, kalVain, banKing, memeFrog, officeSlacker, gnomeElder, trashKing,
  // 梦境 / 微观 / 炼金 / 毛线 / 画中世界（第十批）
  scpStatue,
  keterFlesh,
  shyGiant,
  rakeThing,
  wendiStag,
  mothmSeer,
  gbeastPrime,
  crawCrawler,
  mutoQueen,
  beheTitan,
  dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse,
};
