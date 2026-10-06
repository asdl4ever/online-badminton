/**
 * 你画我猜的内置词库：画不出来的抽象词不要，全部是可以两三笔画个大概的具体名词。
 * 每轮从里面随机抽 4 个不重复的给画家挑。
 */
export const PAINT_WORDS: string[] = [
  // 羽毛球 / 运动
  '羽毛球', '球拍', '球场', '发球', '扣杀', '裁判', '奖杯', '金牌', '篮球', '足球',
  '乒乓球', '游泳', '滑板', '自行车', '跳绳', '举重', '攀岩', '瑜伽',
  // 动物
  '猫', '狗', '兔子', '大象', '长颈鹿', '熊猫', '企鹅', '鲨鱼', '章鱼', '螃蟹',
  '蝴蝶', '蜜蜂', '蜗牛', '乌龟', '恐龙', '鲸鱼', '孔雀', '蝙蝠', '刺猬', '海星',
  // 食物
  '西瓜', '香蕉', '苹果', '草莓', '葡萄', '菠萝', '汉堡', '披萨', '寿司', '火锅',
  '冰淇淋', '蛋糕', '面条', '饺子', '棒棒糖', '爆米花', '烤串', '奶茶',
  // 物品 / 生活
  '雨伞', '眼镜', '帽子', '鞋子', '书包', '牙刷', '剪刀', '钥匙', '台灯', '闹钟',
  '电话', '电视', '冰箱', '洗衣机', '吉他', '钢琴', '耳机', '气球', '蜡烛', '口罩',
  '火箭', '直升机', '帆船', '热气球', '红绿灯', '桥', '滑梯', '秋千', '风筝', '雪人',
  '圣诞树', '灯泡', '锤子', '梯子', '拖把', '垃圾桶', '望远镜', '指南针',
  // 自然 / 场景
  '太阳', '月亮', '星星', '彩虹', '闪电', '火山', '瀑布', '沙漠', '海岛', '山',
  '云朵', '大树', '仙人掌', '蘑菇', '花朵',
  // 游戏 / 想象
  '奥特曼', '机器人', '外星人', '幽灵', '恐龙化石', '宝箱', '皇冠', '魔法棒',
  '城堡', '飞碟', '僵尸', '美人鱼', '天使', '海盗船', '独角兽',
];

/** 随机抽 n 个不重复的词（默认 4 选 1） */
export function pickWords(n = 4, exclude: ReadonlySet<string> = new Set()): string[] {
  const pool = PAINT_WORDS.filter((w) => !exclude.has(w));
  const src = pool.length >= n ? pool : PAINT_WORDS.slice();
  const out: string[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < src.length) {
    const i = Math.floor(Math.random() * src.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(src[i]);
  }
  return out;
}

/** 判答案：去空格 + 忽略大小写 */
export function guessMatches(guess: string, word: string): boolean {
  return guess.trim().toLowerCase().replace(/\s+/g, '') === word.trim().toLowerCase().replace(/\s+/g, '');
}
