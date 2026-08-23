import os
import unittest
from unittest.mock import patch

from server import clean_learning_text, repair_digest, useful_learning_item, validate_items


class GenerationQualityTests(unittest.TestCase):
    def test_filters_meta_summary_language(self):
        self.assertEqual(clean_learning_text("本文通过介绍智能体的构成展开说明"), "")
        self.assertEqual(clean_learning_text("文章是作者针对秋招面试的思考记录"), "")
        self.assertEqual(clean_learning_text("智能体由五部分组成"), "智能体由五部分组成")

    def test_filters_isolated_or_generic_items(self):
        for value in ("思考", "决策", "能力扩展"):
            self.assertEqual(useful_learning_item(value), "")
        self.assertEqual(
            useful_learning_item("大模型负责理解问题并决定下一步行动"),
            "大模型负责理解问题并决定下一步行动",
        )

    def test_repair_pass_is_disabled_by_default(self):
        draft = {"knowledge_items": []}
        with patch.dict(os.environ, {}, clear=True), patch("server.openrouter_json") as call:
            self.assertIs(repair_digest("key", {"documents": []}, draft), draft)
            call.assert_not_called()

    def test_repair_pass_can_be_explicitly_enabled(self):
        repaired = {"knowledge_items": [{"headline": "修复结果"}]}
        with patch.dict(os.environ, {"PINMIND_REPAIR_PASS": "1"}), patch(
            "server.openrouter_json", return_value=repaired
        ) as call:
            result = repair_digest("key", {"documents": []}, {"knowledge_items": []})
        self.assertEqual(result, repaired)
        self.assertEqual(call.call_args.args[2], "pinmind_digest_repaired")

    def test_validate_items_cleans_sections(self):
        result = {"knowledge_items": [{
            "headline": "智能体的构成与功能",
            "graph_label": "智能体",
            "source_ids": ["s1"],
            "related_knowledge_ids": [],
            "topic_names": ["AI"],
            "sections": [{
                "kind": "explanation", "level": 1, "title": "智能体定义",
                "content": "本文通过介绍智能体说明其构成",
                "items": ["思考", "决策", "知识库为智能体提供长期记忆"],
            }],
        }]}
        cleaned = validate_items(result, [{"id": "s1"}], [])[0]
        self.assertEqual(cleaned["sections"][0]["content"], "")
        self.assertEqual(cleaned["sections"][0]["items"], ["知识库为智能体提供长期记忆"])


if __name__ == "__main__":
    unittest.main()
