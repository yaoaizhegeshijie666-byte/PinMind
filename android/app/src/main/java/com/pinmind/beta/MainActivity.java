package com.pinmind.beta;

import android.app.Activity;
import android.Manifest;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Set;

public class MainActivity extends Activity {
    private WebView webView;
    private TextView statusView;
    private boolean pageReady;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        configureSystemBars();
        DailyNotification.schedule(this,getSharedPreferences("pinmind_config",MODE_PRIVATE).getString("daily_time","22:00"));
        if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},2200);
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
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return openExternal(request.getUrl());}
            @Override public boolean shouldOverrideUrlLoading(WebView view,String url){return openExternal(Uri.parse(url));}            @Override public void onPageFinished(WebView view,String url){
                pageReady=true;
                syncCaptures();
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()){statusView.setVisibility(TextView.VISIBLE);statusView.setText("PinMind 加载失败 · "+error.getDescription());}
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
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
    private boolean openExternal(Uri uri){if(uri==null||!("http".equals(uri.getScheme())||"https".equals(uri.getScheme())))return false;try{startActivity(new Intent(Intent.ACTION_VIEW,uri));return true;}catch(Exception ignored){return false;}}
    private void configureSystemBars(){
        Window window=getWindow();int background=Color.rgb(247,246,242);
        window.setStatusBarColor(background);window.setNavigationBarColor(background);
        int flags=View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;if(Build.VERSION.SDK_INT>=26)flags|=View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        window.getDecorView().setSystemUiVisibility(flags);
        if(Build.VERSION.SDK_INT>=29){window.setStatusBarContrastEnforced(false);window.setNavigationBarContrastEnforced(false);}
        if(Build.VERSION.SDK_INT>=30)window.setDecorFitsSystemWindows(true);
    }
    @Override protected void onResume(){super.onResume();if(pageReady){syncCaptures();webView.evaluateJavascript("if(typeof checkClipboardLink==='function')checkClipboardLink()",null);}}
    @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    public class NativeBridge {
        @JavascriptInterface public String getCaptures(){
            JSONArray result=new JSONArray();Set<String> rows=getSharedPreferences("pinmind_sources",MODE_PRIVATE).getStringSet("captures",null);if(rows==null)return result.toString();
            for(String row:rows){try{String[] p=row.split("\\t",-1);JSONObject item=new JSONObject();String mime=p.length>1?p[1]:"text/plain";String text=p.length>3?p[3]:"";String files=p.length>4?p[4]:"";boolean image=mime.startsWith("image/");item.put("input_type",image?"screenshot":"selected_text");item.put("title",p.length>2?p[2]:"");item.put("content",text);item.put("starred",p.length>5&&"1".equals(p[5]));if(image){String encoded=encodeImage(files);if(!encoded.isEmpty()){item.put("image_data",encoded);item.put("content_mime","image/jpeg");}}String url=findUrl(text);if(!url.isEmpty())item.put("url",url);result.put(item);}catch(Exception ignored){}}
            return result.toString();
        }
        @JavascriptInterface public void clearCaptures(){deleteCaptureFiles();getSharedPreferences("pinmind_sources",MODE_PRIVATE).edit().remove("captures").apply();}
        @JavascriptInterface public String getClipboardText(){try{ClipboardManager clipboard=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);if(clipboard==null||!clipboard.hasPrimaryClip())return "";ClipData clip=clipboard.getPrimaryClip();if(clip==null||clip.getItemCount()==0)return "";CharSequence text=clip.getItemAt(0).coerceToText(MainActivity.this);return text==null?"":text.toString();}catch(Exception ignored){return "";}}
        @JavascriptInterface public void setApiBase(String value){getSharedPreferences("pinmind_config",MODE_PRIVATE).edit().putString("api_base",value).apply();}
        @JavascriptInterface public void setDailyTime(String value){runOnUiThread(()->DailyNotification.schedule(MainActivity.this,value));}
        @JavascriptInterface public void setNotificationsEnabled(boolean enabled){getSharedPreferences("pinmind_config",MODE_PRIVATE).edit().putBoolean("notifications_enabled",enabled).apply();runOnUiThread(()->DailyNotification.schedule(MainActivity.this,getSharedPreferences("pinmind_config",MODE_PRIVATE).getString("daily_time","22:00")));}
        @JavascriptInterface public void copyText(String value){ClipboardManager clipboard=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);if(clipboard!=null)clipboard.setPrimaryClip(ClipData.newPlainText("PinMind Markdown",value==null?"":value));}
        @JavascriptInterface public void openUrl(String value){runOnUiThread(()->openExternal(Uri.parse(value)));}
        private String encodeImage(String paths){
            String path=paths==null?"":paths.split("\\|",2)[0];File file=new File(path);if(!file.isFile())return "";
            try{
                BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeFile(path,bounds);
                int sample=1;while(bounds.outWidth/sample>1800||bounds.outHeight/sample>1800)sample*=2;
                BitmapFactory.Options options=new BitmapFactory.Options();options.inSampleSize=sample;Bitmap bitmap=BitmapFactory.decodeFile(path,options);if(bitmap==null)return "";
                ByteArrayOutputStream output=new ByteArrayOutputStream();bitmap.compress(Bitmap.CompressFormat.JPEG,82,output);bitmap.recycle();
                return Base64.encodeToString(output.toByteArray(),Base64.NO_WRAP);
            }catch(Exception ignored){return "";}
        }
        private void deleteCaptureFiles(){
            Set<String> rows=getSharedPreferences("pinmind_sources",MODE_PRIVATE).getStringSet("captures",null);if(rows==null)return;
            String root=new File(getFilesDir(),"captures").getAbsolutePath();
            for(String row:rows){String[] parts=row.split("\\t",-1);if(parts.length<5)continue;for(String path:parts[4].split("\\|")){File file=new File(path);if(file.getAbsolutePath().startsWith(root))file.delete();}}
        }        private String findUrl(String text){for(String part:text.split("\\s+"))if(part.startsWith("http://")||part.startsWith("https://"))return part;return "";}
    }
}
