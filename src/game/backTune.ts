/**
 * 背部装饰（single 背挂物件）的**逐件微调**持久化：
 * - `front`：画在角色身前（不被躯干挡住）还是身后（默认，更符合「背挂」）；
 * - `ox`：横向偏移（负 = 更靠左/身后，正 = 更靠身前），在默认肩锚偏移上叠加。
 *
 * 存 localStorage（`bmt-back-tune`），键是物品 ref。所有绘制路径（游戏场景 /
 * 大地图 / 图鉴 / 预览）共用同一份 drawCharacter，所以调一次处处生效。
 */

export interface BackTune {
  front: boolean;
  ox: number;
}

const KEY = 'bmt-back-tune';

let cache: Record<string, BackTune> | null = null;

function load(): Record<string, BackTune> {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, BackTune>;
  } catch {
    cache = {};
  }
  return cache!;
}

export function getBackTune(ref: string): BackTune {
  return load()[ref] ?? { front: false, ox: 0 };
}

export function setBackTune(ref: string, tune: BackTune): void {
  const all = load();
  all[ref] = tune;
  cache = all;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* 存不上就算了（隐私模式等），内存里仍然生效 */
  }
}

/** 单件默认的水平偏移（肩锚向身后偏，避免被躯干挡住），逐件 ox 叠加在其上 */
export const BACK_DEFAULT_OX = -14;
