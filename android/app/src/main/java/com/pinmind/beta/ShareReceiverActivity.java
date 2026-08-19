package com.pinmind.beta;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;

public class ShareReceiverActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Intent intent=getIntent();String action=intent.getAction();
        String mime=intent.getType()==null?"text/plain":intent.getType();
        String title=value(intent.getStringExtra(Intent.EXTRA_SUBJECT));
        String text=value(intent.getStringExtra(Intent.EXTRA_TEXT));
        StringBuilder files=new StringBuilder();
        if(mime.startsWith("image/")){
            ClipData clip=intent.getClipData();
            if(Intent.ACTION_SEND_MULTIPLE.equals(action)&&clip!=null){
                for(int i=0;i<clip.getItemCount();i++)append(files,copyImage(clip.getItemAt(i).getUri()));
            }else append(files,copyImage(intent.getParcelableExtra(Intent.EXTRA_STREAM)));
        }
        saveCapture(mime,title,text,files.toString());
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);panel.setPadding(48,56,48,56);
        TextView heading=new TextView(this);heading.setText("已保存至 PinMind");heading.setTextSize(21);heading.setGravity(Gravity.CENTER);
        TextView note=new TextView(this);note.setText("将在你设置的时间为你整理");note.setTextSize(15);note.setGravity(Gravity.CENTER);note.setPadding(0,18,0,0);
        panel.addView(heading);panel.addView(note);setContentView(panel);new Handler().postDelayed(this::finish,1500);
    }
    private String copyImage(Uri uri){
        if(uri==null)return "";
        File directory=new File(getFilesDir(),"captures");if(!directory.exists()&&!directory.mkdirs())return "";
        File target=new File(directory,"capture_"+System.nanoTime()+".img");
        try(InputStream input=getContentResolver().openInputStream(uri);FileOutputStream output=new FileOutputStream(target)){
            if(input==null)return "";byte[] buffer=new byte[16384];int read,total=0;
            while((read=input.read(buffer))!=-1){total+=read;if(total>8_000_000)throw new IllegalStateException("image_too_large");output.write(buffer,0,read);}
            return target.getAbsolutePath();
        }catch(Exception ignored){target.delete();return "";}
    }
    private void saveCapture(String mime,String title,String text,String files){
        SharedPreferences prefs=getSharedPreferences("pinmind_sources",MODE_PRIVATE);
        Set<String> saved=new HashSet<>(prefs.getStringSet("captures",new HashSet<>()));
        saved.add(System.currentTimeMillis()+"\t"+clean(mime)+"\t"+clean(title)+"\t"+clean(text)+"\t"+clean(files));
        prefs.edit().putStringSet("captures",saved).apply();
    }
    private static void append(StringBuilder out,String value){if(!value.isEmpty()){if(out.length()>0)out.append('|');out.append(value);}}
    private static String value(String value){return value==null?"":value;}
    private static String clean(String value){return value(value).replace("\t"," ").replace("\n"," ");}
}
