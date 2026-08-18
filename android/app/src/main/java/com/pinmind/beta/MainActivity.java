package com.pinmind.beta;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Set;

public class MainActivity extends Activity {
    private WebView webView;
    private boolean pageReady;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView=new WebView(this);
        WebSettings settings=webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        webView.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){pageReady=true;syncCaptures();}
        });
        webView.addJavascriptInterface(new NativeBridge(),"PinMindNative");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
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
