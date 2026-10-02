/**
 * 好友邀请的「自动建房」辅助：邀请时如果没有房间，就调页面自己的建房流程，
 * 然后轮询等房号出来（建房是异步的，服务端分配房间号需要一点时间）。
 */
export async function waitForRoomCode(get: () => string, timeoutMs = 10000): Promise<string> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const code = get();
    if (code) return code;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('建房超时，稍后再试');
}
