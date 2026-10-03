import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 配置：把 `npm run build` 产出的 `dist/` 套进一个 Android 壳里出 APK。
 *
 * 常用命令：
 *   npm run build            # 先出 web 产物
 *   npx cap sync android     # 把 dist/ 与插件同步进 android 工程
 *   npx cap open android     # 用 Android Studio 打开（然后 Run / Build APK）
 *
 * 联机说明：装成 App 后页面的 origin 是 `https://localhost`，中继地址不再能从
 * `location.host` 推出来，**必须在打包前显式指定**（见 src/net/relay.ts）：
 *   PowerShell:  $env:VITE_RELAY_URL="wss://你的域名/relay"; npm run build; npx cap sync android
 * 不设置的话，版本会退化成纯单机：联机入口点了会提示「当前版本未配置联机服务器」。
 */
const config: CapacitorConfig = {
  /** 安装后的包名（想改就改这里，改完重新 `npx cap add android`） */
  appId: 'com.badminton.game',
  /** 桌面上显示的应用名 */
  appName: '羽毛球',
  /** vite 的输出目录 */
  webDir: 'dist',
  /** 启动瞬间的背景色，避免白屏闪一下 */
  backgroundColor: '#0f1620',
  android: {
    /** 联机走 wss，没有混用 https 里加载 http 的需求 */
    allowMixedContent: false,
    /**
     * 关掉 Capacitor 对 edge-to-edge 的自动加边距：Android 15+ 强制全屏后，
     * 横屏时手势导航栏的内缩会被算成 WebView 的**左边距**——画面左侧就露出
     * 一条竖着的黑条。MainActivity 已经自己在做沉浸式全屏（藏系统栏 + shortEdges），
     * 这里禁用即可让画面铺满整块屏幕。
     */
    adjustMarginsForEdgeToEdge: 'disable',
    /** 允许用 chrome://inspect 调试 WebView（上线前可以删掉这行） */
    webContentsDebuggingEnabled: true,
  },
  server: {
    /** 让页面跑在 https://localhost：localStorage / WebRTC / 音频的行为和正式网页一致 */
    androidScheme: 'https',
  },
};

export default config;
