package com.mutarjim.tv;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * شاشة التطبيق: تطلب إذن «العرض فوق التطبيقات» وتشغّل/توقف طبقة الترجمة.
 * كل شي ثاني (الرمز، الاتصال بالجوال، شكل الترجمة) تسويه صفحة الموقع داخل الطبقة.
 */
public class MainActivity extends Activity {

    private TextView status;
    private Button permission;
    private Button toggle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.BLACK);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        int pad = dp(48);
        root.setPadding(pad, pad, pad, pad);

        TextView title = text("مترجم TV", 40, true);
        TextView sub = text("الترجمة العربية فوق صورة السوني، من موقع مترجم", 20, false);
        sub.setTextColor(0xFF9A9A96);
        status = text("", 18, false);
        status.setTextColor(0xFFF3F2EC);

        permission = button("السماح بالعرض فوق التطبيقات");
        permission.setOnClickListener(v -> openPermission());

        toggle = button("تشغيل الترجمة فوق الشاشة");
        toggle.setOnClickListener(v -> toggleOverlay());

        root.addView(title);
        root.addView(sub);
        root.addView(space());
        root.addView(status);
        root.addView(space());
        root.addView(permission);
        root.addView(toggle);
        setContentView(root);
    }

    @Override
    protected void onResume() {
        super.onResume();
        refresh();
    }

    private boolean canDraw() {
        return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(this);
    }

    private void refresh() {
        boolean allowed = canDraw();
        permission.setVisibility(allowed ? View.GONE : View.VISIBLE);
        toggle.setEnabled(allowed);
        if (!allowed) {
            status.setText("أول مرة بس: اضغط الزر تحت وفعّل «العرض فوق التطبيقات» لتطبيق مترجم TV، وارجع هنا.");
            permission.requestFocus();
        } else if (OverlayService.running) {
            status.setText("الترجمة شغالة فوق الشاشة. حوّل التلفزيون على مدخل السوني (HDMI).");
            toggle.setText("إيقاف الترجمة");
            toggle.requestFocus();
        } else {
            status.setText("جاهز. شغّل الترجمة، وبعدين حوّل التلفزيون على مدخل السوني واكتب الرمز اللي يطلع في الجوال.");
            toggle.setText("تشغيل الترجمة فوق الشاشة");
            toggle.requestFocus();
        }
    }

    private void openPermission() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            // بعض أنظمة التلفزيون ما فيها هالشاشة مباشرة: نفتح الإعدادات ونشرح المكان
            status.setText("افتح: الإعدادات ← التطبيقات ← وصول خاص للتطبيقات ← العرض فوق التطبيقات الأخرى ← مترجم TV ← سماح.");
            try {
                startActivity(new Intent(Settings.ACTION_SETTINGS));
            } catch (ActivityNotFoundException ignored) {
            }
        }
    }

    private void toggleOverlay() {
        Intent service = new Intent(this, OverlayService.class);
        if (OverlayService.running) {
            stopService(service);
            OverlayService.running = false;
            refresh();
            return;
        }
        if (Build.VERSION.SDK_INT >= 26) startForegroundService(service);
        else startService(service);
        OverlayService.running = true;
        refresh();
        // نرجع للشاشة الرئيسية عشان المستخدم يحوّل على مدخل السوني
        moveTaskToBack(true);
    }

    private TextView text(String s, int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextColor(Color.WHITE);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private Button button(String s) {
        Button b = new Button(this);
        b.setText(s);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        b.setAllCaps(false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(520), LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(12);
        lp.gravity = Gravity.CENTER_HORIZONTAL;
        b.setLayoutParams(lp);
        return b;
    }

    private View space() {
        View v = new View(this);
        v.setLayoutParams(new LinearLayout.LayoutParams(1, dp(24)));
        return v;
    }

    private int dp(int v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }
}
