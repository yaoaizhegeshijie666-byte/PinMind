import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "android/app/src/main/assets"

class AndroidReleaseContractTest(unittest.TestCase):
    def test_apk_has_no_static_web_demo_layer(self):
        index = (ASSETS / "index.html").read_text(encoding="utf-8")
        styles = (ASSETS / "styles.css").read_text(encoding="utf-8")
        self.assertNotIn("demo-data.js", index)
        self.assertFalse((ASSETS / "demo-data.js").exists())
        self.assertNotIn("demo-banner", styles)
        for path in ASSETS.glob("*"):
            if path.is_file():
                text = path.read_text(encoding="utf-8")
                self.assertNotIn("Web Demo", text)

    def test_apk_real_import_and_generation_use_online_backend(self):
        api = (ASSETS / "api-client.js").read_text(encoding="utf-8")
        self.assertIn("https://pinmind-api.onrender.com", api)
        self.assertIn("this.request('/api/sources'", api)
        self.assertIn("this.request('/api/digests/generate'", api)
        self.assertNotIn("PinMindDemo", api)
        server = (ROOT / "backend/server.py").read_text(encoding="utf-8")
        for rule in ("核心结论", "删除“本文、本篇", "保留数字、比例、阈值", "区分事实、观点与预测"):
            self.assertIn(rule, server)

    def test_apk_waiting_and_history_behavior(self):
        app = (ASSETS / "app.js").read_text(encoding="utf-8")
        pages = (ASSETS / "pages.js").read_text(encoding="utf-8")
        styles = (ASSETS / "styles.css").read_text(encoding="utf-8")
        self.assertNotIn(" · ${time}", app)
        waiting = next(line for line in app.splitlines() if "function showDigestWaiting" in line)
        self.assertEqual(waiting.count("intro.textContent"), 1)
        self.assertIn(".intro[hidden]{display:none!important}", styles)
        self.assertIn("if(!items.length)return", pages)
        self.assertNotIn("if(!items.length||PinMindState.isRead", pages)
        self.assertIn("read&&window.viewingToday!==false", app)
        self.assertIn("if(introSection)introSection.hidden=false", app)

    def test_apk_capture_waits_for_schedule_and_keeps_client_identity(self):
        api = (ASSETS / "api-client.js").read_text(encoding="utf-8")
        activity = (ROOT / "android/app/src/main/java/com/pinmind/beta/MainActivity.java").read_text(encoding="utf-8")
        receiver = (ROOT / "android/app/src/main/java/com/pinmind/beta/NotificationReceiver.java").read_text(encoding="utf-8")
        upload = api.split("async function uploadScreenshot", 1)[1].split("window.uploadScreenshot", 1)[0]
        self.assertNotIn("PinMindAPI.generate()", upload)
        self.assertIn("window.PinMindNative?.getClientId?.()", api)
        self.assertIn("public String getClientId()", activity)
        self.assertIn("DigestJobService.enqueue(context)", receiver)
        self.assertNotIn("if(!enabled){DailyNotification.cancel", receiver)
    def test_android_release_version(self):
        gradle = (ROOT / "android/app/build.gradle.kts").read_text(encoding="utf-8")
        self.assertIn("versionCode = 51", gradle)
        self.assertIn('versionName = "0.7.8"', gradle)

    def test_apk_keeps_capture_actions_after_read_and_has_history_fallback(self):
        app = (ASSETS / "app.js").read_text(encoding="utf-8")
        pages = (ASSETS / "pages.js").read_text(encoding="utf-8")
        index = (ASSETS / "index.html").read_text(encoding="utf-8")
        seed = (ASSETS / "apk-history-seed.js").read_text(encoding="utf-8")
        self.assertIn("hidden = window.viewingToday===false", app)
        self.assertIn("document.querySelector('.intro').hidden=false", app)
        self.assertIn("window.PinMindApkHistory?.()", pages)
        self.assertIn("PinMindAPI.history().catch", pages)
        self.assertIn('src="apk-history-seed.js"', index)
        self.assertIn("demo_new_k1", seed)
        self.assertIn("demo_new_k5", seed)
    def test_android_release_uses_stable_signing(self):
        gradle = (ROOT / "android/app/build.gradle.kts").read_text(encoding="utf-8")
        workflow = (ROOT / ".github/workflows/android-release.yml").read_text(encoding="utf-8")
        self.assertIn('create("release")', gradle)
        self.assertIn('PINMIND_KEYSTORE_PATH', gradle)
        self.assertIn(':app:assembleRelease', workflow)
        self.assertIn('secrets.PINMIND_KEYSTORE_BASE64', workflow)
        self.assertIn('apksigner', workflow)
        self.assertNotIn(':app:assembleDebug', workflow)
if __name__ == "__main__":
    unittest.main()
