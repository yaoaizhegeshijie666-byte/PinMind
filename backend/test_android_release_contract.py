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

    def test_android_release_version(self):
        gradle = (ROOT / "android/app/build.gradle.kts").read_text(encoding="utf-8")
        self.assertIn("versionCode = 46", gradle)
        self.assertIn('versionName = "0.7.3"', gradle)

if __name__ == "__main__":
    unittest.main()
