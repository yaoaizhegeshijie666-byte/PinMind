import unittest

from evals.run_live_eval import run_live


class LiveEvalRunnerTests(unittest.TestCase):
    def test_outputs_are_keyed_by_sample_id(self):
        fixtures = {"sources": [{
            "id": "A01", "title": "测试", "input_type": "eval_fixture",
            "content": "测试来源内容", "completeness": "complete",
        }]}
        def fake_generate(sources, library):
            return {"knowledge_items": [{
                "headline": "测试知识", "graph_label": "测试",
                "sections": [{"kind": "overview", "level": 0, "title": "核心结论",
                              "content": "测试来源包含明确内容", "items": []}],
                "source_ids": ["A01"], "related_knowledge_ids": [],
                "topic_names": ["测试"], "tags": [], "content_completeness": "complete",
            }]}
        outputs = run_live(fixtures, fake_generate)
        self.assertIn("A01", outputs)
        self.assertEqual(outputs["A01"]["knowledge_items"][0]["headline"], "测试知识")


if __name__ == "__main__":
    unittest.main()
