import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class DemoContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.demo = (ROOT / "demo-data.js").read_text(encoding="utf-8")
        cls.api = (ROOT / "api-client.js").read_text(encoding="utf-8")

    def test_before_generation_time_is_empty_and_after_time_has_demo_card(self):
        self.assertIn("knowledge_items:active?[PINMIND_DEMO_CURATED_KNOWLEDGE[3]]:[]", self.demo)
        self.assertIn("window.PinMindDemo?.enabled?window.dailyTimeReached?.(now)", self.api)
        self.assertNotIn("window.PinMindDemo?.enabled?true", self.api)

    def test_waiting_state_owns_the_date_label(self):
        app = (ROOT / "app.js").read_text(encoding="utf-8")
        pages = (ROOT / "pages.js").read_text(encoding="utf-8")
        self.assertIn("等待生成 · ", app)
        self.assertIn("正在生成 · ", app)
        today_nav = pages.split("if(item.dataset.page==='today')", 1)[1]
        self.assertLess(today_nav.index("window.showDigestWaiting?.()"), today_nav.index("window.loadLiveDigest?.()"))
        self.assertEqual(app, (ROOT / "backend/web/app.js").read_text(encoding="utf-8"))
        self.assertEqual(pages, (ROOT / "backend/web/pages.js").read_text(encoding="utf-8"))

    def test_history_has_three_groups_with_two_or_three_items(self):
        line = next(line for line in self.demo.splitlines() if "const historyGroups=" in line)
        payload = line.split("const historyGroups=[[", 1)[1].split("]],uncollectedItems=", 1)[0]
        groups = payload.split("],[")
        sizes = [len(re.findall(r"PINMIND_DEMO_CURATED_KNOWLEDGE\[\d+\]", group)) for group in groups]
        self.assertEqual([3, 2, 3], sizes)
        for offset in (1, 2, 3):
            self.assertIn(f"digest_date:dateKey({offset})", self.demo)

    def test_curated_content_contract_and_web_copy_sync(self):
        curated = self.demo.split("const PINMIND_DEMO_CURATED_SOURCES=", 1)[1]
        self.assertNotIn("本文", curated)
        self.assertNotIn("本篇", curated)
        for expected in ("60%、边缘场景30%、红队测试10%", "1—2小时", "两亿日活", "节目嘉宾的行业判断"):
            self.assertIn(expected, curated)
        self.assertEqual(self.demo, (ROOT / "backend/web/demo-data.js").read_text(encoding="utf-8"))
        self.assertEqual(self.api, (ROOT / "backend/web/api-client.js").read_text(encoding="utf-8"))

if __name__ == "__main__":
    unittest.main()
