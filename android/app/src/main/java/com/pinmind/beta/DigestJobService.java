package com.pinmind.beta;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DigestJobService extends JobService {
    private static final int JOB_ID=2201;
    private static final ExecutorService NETWORK=Executors.newSingleThreadExecutor();
    public static void enqueue(Context context){
        JobScheduler scheduler=(JobScheduler)context.getSystemService(Context.JOB_SCHEDULER_SERVICE);if(scheduler==null)return;
        JobInfo job=new JobInfo.Builder(JOB_ID,new ComponentName(context,DigestJobService.class))
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setOverrideDeadline(0)
            .setBackoffCriteria(60_000L,JobInfo.BACKOFF_POLICY_LINEAR).build();
        scheduler.schedule(job);
    }
    @Override public boolean onStartJob(JobParameters params){
        NETWORK.execute(()->{Result result=generate(this);boolean enabled=getSharedPreferences("pinmind_config",MODE_PRIVATE).getBoolean("notifications_enabled",true);
            if(enabled)DailyNotification.show(this,result.title,result.message,false);jobFinished(params,!result.success);});
        return true;
    }
    @Override public boolean onStopJob(JobParameters params){return true;}
    private static Result generate(Context context){
        String base=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("api_base","");
        if(base==null||base.trim().isEmpty())base="https://pinmind-api.onrender.com";
        HttpURLConnection connection=null;
        try{
            connection=(HttpURLConnection)new URL(base.replaceAll("/+$","")+"/api/digests/generate").openConnection();
            connection.setRequestMethod("POST");connection.setConnectTimeout(60_000);connection.setReadTimeout(420_000);
            connection.setDoOutput(true);connection.setRequestProperty("Content-Type","application/json");
            String client=context.getSharedPreferences("pinmind_config",Context.MODE_PRIVATE).getString("client_id","");
            if(client!=null&&!client.isEmpty())connection.setRequestProperty("X-PinMind-Client",client);
            connection.getOutputStream().write("{}".getBytes(StandardCharsets.UTF_8));
            int status=connection.getResponseCode();String body=read(status<400?connection.getInputStream():connection.getErrorStream());
            if(status>=200&&status<300){int count=number(body,"generated_count");return new Result(true,"PinMind 今日知识已准备好","已根据内容密度整理 "+count+" 条知识。");}
            if(status==409&&body.contains("no_new_ready_sources"))return new Result(true,"今天没有新增知识","上次生成后没有新保存的有效内容。");
            if(status==422)return new Result(true,"今天没有可提炼的知识","已检查新增内容，没有发现适合沉淀的知识。");
            return new Result(false,"今日知识整理暂未完成","网络或服务暂时不可用，PinMind 会在联网后重试。");
        }catch(Exception ignored){return new Result(false,"今日知识整理暂未完成","网络暂时不可用，PinMind 会在联网后重试。");}
        finally{if(connection!=null)connection.disconnect();}
    }
    private static String read(InputStream stream){if(stream==null)return "";try(InputStream input=stream){return new String(input.readAllBytes(),StandardCharsets.UTF_8);}catch(Exception ignored){return "";}}
    private static int number(String body,String key){try{String marker="\""+key+"\"";int start=body.indexOf(marker);if(start<0)return 0;start=body.indexOf(':',start)+1;while(start<body.length()&&Character.isWhitespace(body.charAt(start)))start++;int end=start;while(end<body.length()&&Character.isDigit(body.charAt(end)))end++;return Integer.parseInt(body.substring(start,end));}catch(Exception ignored){return 0;}}
    private static final class Result{final boolean success;final String title,message;Result(boolean success,String title,String message){this.success=success;this.title=title;this.message=message;}}
}

