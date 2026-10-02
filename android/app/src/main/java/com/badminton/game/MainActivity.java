package com.badminton.game;

import android.os.Bundle;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * 主 Activity：沉浸式全屏。
 *
 * 这是横版羽毛球游戏，不希望顶部被状态栏、底部被导航栏各占掉一条（手机横过来时
 * 状态栏会把比分挡住）。三处都调一次 `goImmersive()` 是有必要的：
 * - onCreate：Activity 刚建好
 * - onResume：从后台回来（有些系统会把系统栏恢复出来）
 * - onWindowFocusChanged：切主题 / 弹对话框之后重新拿到焦点时
 *
 * 从屏幕边缘上划/下滑仍可临时唤出系统栏（BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE），
 * 配合主题里的 windowLayoutInDisplayCutoutMode=shortEdges，画面能一直铺到屏幕边缘。
 */
public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    goImmersive();
  }

  @Override
  public void onResume() {
    super.onResume();
    goImmersive();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      goImmersive();
    }
  }

  /** 让内容铺满整块屏幕（含系统栏与刘海区域），再把两条系统栏藏起来 */
  private void goImmersive() {
    Window window = getWindow();
    WindowCompat.setDecorFitsSystemWindows(window, false);
    WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(window, window.getDecorView());
    controller.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    controller.hide(WindowInsetsCompat.Type.systemBars());
  }
}
