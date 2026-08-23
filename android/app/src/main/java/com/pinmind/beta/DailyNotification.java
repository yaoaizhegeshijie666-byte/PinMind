package com.pinmind.beta;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import java.util.Calendar;

public final class DailyNotification {
    static final String CHANNEL_ID="pinmind_daily_v2";
    static final int ALARM_ID=2200;
    private DailyNotification(){}
    public static void schedule(Context context,String value){
        String[] parts=(value==null?"22:00":value).split(":");int hour=parts.length>0?number(parts[0],22):22,minute=parts.length>1?number(parts[1],0):0;
        context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).edit().putString("daily_time",String.format("%02d:%02d",hour,minute)).apply();
        Intent intent=new Intent(context,NotificationReceiver.class).setAction("com.pinmind.beta.DAILY_READY");int flags=PendingIntent.FLAG_UPDATE_CURRENT|(Build.VERSION.SDK_INT>=23?PendingIntent.FLAG_IMMUTABLE:0);PendingIntent pending=PendingIntent.getBroadcast(context,ALARM_ID,intent,flags);
        AlarmManager alarms=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);if(alarms==null)return;Calendar time=Calendar.getInstance();time.set(Calendar.HOUR_OF_DAY,hour);time.set(Calendar.MINUTE,minute);time.set(Calendar.SECOND,0);time.set(Calendar.MILLISECOND,0);if(time.getTimeInMillis()<=System.currentTimeMillis())time.add(Calendar.DAY_OF_YEAR,1);
        if(Build.VERSION.SDK_INT<31||alarms.canScheduleExactAlarms())alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time.getTimeInMillis(),pending);else alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time.getTimeInMillis(),pending);
    }
    public static void cancel(Context context){Intent intent=new Intent(context,NotificationReceiver.class).setAction("com.pinmind.beta.DAILY_READY");int flags=PendingIntent.FLAG_UPDATE_CURRENT|(Build.VERSION.SDK_INT>=23?PendingIntent.FLAG_IMMUTABLE:0);PendingIntent pending=PendingIntent.getBroadcast(context,ALARM_ID,intent,flags);AlarmManager alarms=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);if(alarms!=null)alarms.cancel(pending);}
    public static void ensureChannel(Context context){if(Build.VERSION.SDK_INT>=26){NotificationManager manager=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);if(manager!=null){NotificationChannel channel=new NotificationChannel(CHANNEL_ID,"今日知识提醒",NotificationManager.IMPORTANCE_HIGH);channel.enableVibration(true);manager.createNotificationChannel(channel);}}}
    public static boolean canNotify(Context context){
        if(Build.VERSION.SDK_INT>=33&&context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return false;NotificationManager manager=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);if(manager==null||!manager.areNotificationsEnabled())return false;
        if(Build.VERSION.SDK_INT>=26){ensureChannel(context);NotificationChannel channel=manager.getNotificationChannel(CHANNEL_ID);return channel!=null&&channel.getImportance()!=NotificationManager.IMPORTANCE_NONE;}return true;
    }
    public static boolean canScheduleExactly(Context context){AlarmManager manager=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);return manager!=null&&(Build.VERSION.SDK_INT<31||manager.canScheduleExactAlarms());}
    public static void show(Context context,String title,String message,boolean ongoing){
        ensureChannel(context);if(!canNotify(context))return;NotificationManager manager=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);if(manager==null)return;
        Intent open=new Intent(context,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);int flags=PendingIntent.FLAG_UPDATE_CURRENT|(Build.VERSION.SDK_INT>=23?PendingIntent.FLAG_IMMUTABLE:0);PendingIntent pending=PendingIntent.getActivity(context,0,open,flags);android.app.Notification.Builder builder=Build.VERSION.SDK_INT>=26?new android.app.Notification.Builder(context,CHANNEL_ID):new android.app.Notification.Builder(context);
        builder.setSmallIcon(R.drawable.ic_launcher).setContentTitle(title).setContentText(message).setAutoCancel(!ongoing).setOngoing(ongoing).setContentIntent(pending).setPriority(android.app.Notification.PRIORITY_HIGH);manager.notify(ALARM_ID,builder.build());
    }
    private static int number(String value,int fallback){try{return Integer.parseInt(value);}catch(Exception ignored){return fallback;}}
}
