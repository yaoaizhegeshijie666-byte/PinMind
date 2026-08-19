package com.pinmind.beta;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        if(!context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getBoolean("notifications_enabled",true))return;
        if(!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))DailyNotification.show(context);
        String time=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("daily_time","22:00");
        DailyNotification.schedule(context,time);
    }
}
