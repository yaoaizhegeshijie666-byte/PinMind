package com.pinmind.beta;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class NotificationReceiver extends BroadcastReceiver {
    private static final ExecutorService NETWORK=Executors.newSingleThreadExecutor();
    @Override public void onReceive(Context context,Intent intent){
        boolean enabled=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getBoolean("notifications_enabled",true);
        if(!enabled)return;
        String time=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("daily_time","22:00");
        DailyNotification.schedule(context,time);
        if(Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))return;
        PendingResult pending=goAsync();Context app=context.getApplicationContext();
        NETWORK.execute(()->{try{if(generate(app)&&enabled)DailyNotification.show(app);}finally{pending.finish();}});
    }
    private static boolean generate(Context context){
        String base=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("api_base","");
        if(base==null||base.trim().isEmpty())base="https://pinmind-api.onrender.com";
        HttpURLConnection connection=null;
        try{
            connection=(HttpURLConnection)new URL(base.replaceAll("/+$","")+"/api/digests/generate").openConnection();
            connection.setRequestMethod("POST");connection.setConnectTimeout(60000);connection.setReadTimeout(180000);
            connection.setDoOutput(true);connection.setRequestProperty("Content-Type","application/json");
            connection.getOutputStream().write("{}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            int status=connection.getResponseCode();return status>=200&&status<300;
        }catch(Exception ignored){return false;}finally{if(connection!=null)connection.disconnect();}
    }
}
