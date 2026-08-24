package com.pinmind.beta;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        boolean enabled=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getBoolean("notifications_enabled",true);
        String time=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("daily_time","22:00");DailyNotification.schedule(context,time);if(Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))return;
        if(enabled)DailyNotification.show(context,"到了今日知识复习时间","PinMind 正在整理上次生成后保存的内容。",true);DigestJobService.enqueue(context);
    }
}
