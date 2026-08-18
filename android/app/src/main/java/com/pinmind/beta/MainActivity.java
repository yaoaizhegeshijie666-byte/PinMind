package com.pinmind.beta;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Scanner;
import java.util.Set;

public class MainActivity extends Activity {
    private WebView webView;
    private TextView statusView;
    private boolean pageReady;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView=new WebView(this);
        webView.setLayerType(View.LAYER_TYPE_SOFTWARE,null);
        WebSettings settings=webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        WebView.setWebContentsDebuggingEnabled(true);
        statusView=new TextView(this);
        statusView.setText("PinMind 加载失败");
        statusView.setVisibility(TextView.GONE);
        statusView.setTextColor(Color.rgb(91,86,78));
        statusView.setTextSize(12);
        statusView.setBackgroundColor(Color.rgb(247,246,242));
        statusView.setPadding(32,18,24,18);
        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.addView(statusView,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(webView,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1));
        webView.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){
                pageReady=true;
                syncCaptures();
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()){statusView.setVisibility(TextView.VISIBLE);statusView.setText("PinMind 加载失败 · "+error.getDescription());}
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onConsoleMessage(ConsoleMessage message){
                if(message.messageLevel()==ConsoleMessage.MessageLevel.ERROR){statusView.setVisibility(TextView.VISIBLE);statusView.setText("页面脚本错误 · "+message.message());}
                return true;
            }
        });
        webView.addJavascriptInterface(new NativeBridge(),"PinMindNative");
        setContentView(root);
        try{
            Scanner scanner=new Scanner(getAssets().open("index.html"),"UTF-8").useDelimiter("\\A");
            String html=scanner.hasNext()?scanner.next():"";
            scanner.close();
            if(html.trim().isEmpty())throw new IllegalStateException("index.html 内容为空");
            webView.loadUrl("file:///android_asset/index.html");
        }catch(Exception error){
            statusView.setVisibility(TextView.VISIBLE);statusView.setText("PinMind 加载失败 · "+error.getClass().getSimpleName()+": "+error.getMessage());
        }
    }
    private void syncCaptures(){webView.evaluateJavascript("if(typeof syncNativeCaptures==='function')syncNativeCaptures()",null);}
    @Override protected void onResume(){super.onResume();if(pageReady)syncCaptures();}
    @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    public class NativeBridge {
        @JavascriptInterface public String getCaptures(){
            JSONArray result=new JSONArray();Set<String> rows=getSharedPreferences("pinmind_sources",MODE_PRIVATE).getStringSet("captures",null);if(rows==null)return result.toString();
            for(String row:rows){try{String[] p=row.split("\\t",-1);JSONObject item=new JSONObject();String mime=p.length>1?p[1]:"text/plain";String text=p.length>3?p[3]:"";String streams=p.length>4?p[4]:"";item.put("input_type",mime.startsWith("image/")?"screenshot":"selected_text");item.put("title",p.length>2?p[2]:"");item.put("content",text.isEmpty()?streams:text);String url=findUrl(text);if(!url.isEmpty())item.put("url",url);result.put(item);}catch(Exception ignored){}}
            return result.toString();
        }
        @JavascriptInterface public void clearCaptures(){getSharedPreferences("pinmind_sources",MODE_PRIVATE).edit().remove("captures").apply();}
        @JavascriptInterface public void setApiBase(String value){getSharedPreferences("pinmind_config",MODE_PRIVATE).edit().putString("api_base",value).apply();}
        private String findUrl(String text){for(String part:text.split("\\s+"))if(part.startsWith("http://")||part.startsWith("https://"))return part;return "";}
    }
}
