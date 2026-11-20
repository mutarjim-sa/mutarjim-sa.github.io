package com.mutarjim.tv;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * طبقة شفافة بحجم الشاشة فوق كل شي (حتى صورة HDMI)، فيها صفحة الموقع بوضع #overlay.
 * الطبقة ما تاخذ تركيز ولا لمس، فريموت التلفزيون ويد السوني يشتغلون عادي.
 */
public class OverlayService extends Service {

    static volatile boolean running = false;

    private static final String CHANNEL = "overlay";
    private WindowManager windowManager;
    private WebView web;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate() {
        super.onCreate();
        running = true;
        startForeground(1, notification());
        showOverlay();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void showOverlay() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        web = new WebView(this);
        web.setBackgroundColor(Color.TRANSPARENT);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        web.setFocusable(false);
        web.setFocusableInTouchMode(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // لو النت تأخر أول ما يشتغل التلفزيون، نعيد المحاولة بعد 5 ثواني
                if (request.isForMainFrame()) handler.postDelayed(view::reload, 5000);
            }
        });

        int type = Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                type,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                PixelFormat.TRANSLUCENT);

        try {
            windowManager.addView(web, lp);
        } catch (RuntimeException e) {
            // ما فيه إذن «العرض فوق التطبيقات»، أو النظام رفض الطبقة
            web.destroy();
            web = null;
            stopSelf();
            return;
        }
        web.loadUrl(BuildConfig.SITE_URL + "#overlay");
    }

    private Notification notification() {
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "طبقة الترجمة", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(this, CHANNEL);
        } else {
            b = new Notification.Builder(this);
        }
        return b.setContentTitle("مترجم TV")
                .setContentText("الترجمة شغالة فوق الشاشة")
                .setSmallIcon(R.drawable.ic_stat)
                .setOngoing(true)
                .build();
    }

    @Override
    public void onDestroy() {
        running = false;
        handler.removeCallbacksAndMessages(null);
        if (web != null) {
            try {
                windowManager.removeView(web);
            } catch (IllegalArgumentException ignored) {
            }
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
