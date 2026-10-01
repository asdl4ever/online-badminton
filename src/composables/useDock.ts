import { useLocalStorage } from '@vueuse/core';

/**
 * 左上角「模式设置」面板的展开状态。
 *
 * 按钮长在外壳上（`PageShell`），面板本身是 `SideDock`，两个组件必须共享同一个
 * 状态，所以放在这里做一个模块级单例（`useLocalStorage` 保证刷新后还记得）。
 */
export const dockOpen = useLocalStorage('bmt-dock-open', false);

export function toggleDock(): void {
  dockOpen.value = !dockOpen.value;
}

export function closeDock(): void {
  dockOpen.value = false;
}
