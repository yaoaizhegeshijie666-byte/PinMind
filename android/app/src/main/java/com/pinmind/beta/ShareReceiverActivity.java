package com.pinmind.beta;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.HashSet;
import java.util.Set;

public class ShareReceiverActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Intent intent=getIntent();
        String action=intent.getAction();
        String mime=intent.getType()==null?"text/plain":intent.getType();
        String title=value(intent.getStringExtra(Intent.EXTRA_SUBJECT));
        String text=value(intent.getStringExtra(Intent.EXTRA_TEXT));
        StringBuilder streams=new StringBuilder();
        if(Intent.ACTION_SEND_MULTIPLE.equals(action)&&intent.getClipData()!=null){
            for(int i=0;i<intent.getClipData().getItemCount();i++)append(streams,intent.getClipData().getItemAt(i).getUri());
        }else{
            Uri uri=intent.getParcelableExtra(Intent.EXTRA_STREAM);append(streams,uri);
        }
        saveCapture(mime,title,text,streams.toString());
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);panel.setPadding(48,56,48,56);
        TextView heading=new TextView(this);heading.setText("已保存至 PinMind");heading.setTextSize(21);heading.setGravity(Gravity.CENTER);
        TextView note=new TextView(this);note.setText("今晚将为你整理\n\n☆ 标为星标");note.setTextSize(15);note.setGravity(Gravity.CENTER);note.setPadding(0,18,0,0);
        panel.addView(heading);panel.addView(note);setContentView(panel);new Handler().postDelayed(this::finish,1800);
    }
    private void saveCapture(String mime,String title,String text,String streams){
        SharedPreferences prefs=getSharedPreferences("pinmind_sources",MODE_PRIVATE);
        Set<String> saved=new HashSet<>(prefs.getStringSet("captures",new HashSet<>()));
        saved.add(System.currentTimeMillis()+"\t"+clean(mime)+"\t"+clean(title)+"\t"+clean(text)+"\t"+clean(streams));
        prefs.edit().putStringSet("captures",saved).apply();
    }
    private static void append(StringBuilder out,Uri uri){if(uri!=null){if(out.length()>0)out.append('|');out.append(uri);}}
    private static String value(String value){return value==null?"":value;}
    private static String clean(String value){return value(value).replace("\t"," ").replace("\n"," ");}
}
