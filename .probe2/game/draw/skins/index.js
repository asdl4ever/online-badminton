import { zhuLong, xiangLiu, qiongQi, taoTie, taoWu, hunDun, jiuweiHu, baShe, guDiao, yuYu, } from './shanhai.js';
import { shnSpirit, mcaSpirit } from './batch2.js';
import { otmSpirit, kjuSpirit } from './batch3.js';
import { xySpirit, sgmSpirit } from './batch4.js';
import { wxSpirit, norseSpirit } from './batch5.js';
import { egSpirit, njaSpirit } from './batch6.js';
import { cybSpirit, dgSpirit, chronoSpirit } from './batch7.js';
import { dunSpirit, aztSpirit, angSpirit } from './batch8.js';
import { taleSpirit, dinSpirit, catSpirit } from './batch9.js';
import { esportSpirit, wasteSpirit, idolSpirit } from './batch10.js';
import { slimeSpirit, nekSpirit, btlSpirit } from './batch11.js';
import { tfSpirit, spdSpirit, bstSpirit } from './batch12.js';
/**
 * 皮肤覆盖层总入口：按 ref 提供重绘后的 painter。
 * `drawCharacter` 在画皮肤前先查这张表——命中就完全走这里的新画法，
 * 未命中的皮肤走原有的 else-if 链 / THEME_SKIN_ART。
 */
export const SKIN_OVERRIDES = {
    // 🗺️ 山海十怪（重绘批一）
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
    // 法老秘葬 / 暗部忍道（批六）
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
    // 变形机甲 / 蛛网游侠 / 钢铁巨兽（批十二）
    tfSpirit, spdSpirit, bstSpirit,
};
