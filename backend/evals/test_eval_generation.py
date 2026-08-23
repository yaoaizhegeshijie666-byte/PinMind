import json
import unittest
from pathlib import Path

from evals.eval_generation import evaluate, score_sample


class EvalGenerationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads(
            (Path(__file__).parent / "generation_samples.json").read_text(encoding="utf-8")
        )

    def test_complete_sentence_covers_required_group(self):
        sample = {"id": "X", "required_groups": [["知识库", "长期记忆"]]}
        result = score_sample(sample, "知识库是智能体的长期记忆。", [], set())
        self.assertEqual(result["coverage"], 100.0)
        self.assertEqual(result["score"], 100.0)

    def test_numeric_range_variants_are_equivalent(self):
        sample = {"id": "X", "required_groups": [["1-2小时内送达"]]}
        result = score_sample(sample, "商品在1至2小时内送达", [], set())
        self.assertEqual(result["coverage"], 100.0)

    def test_forbidden_and_low_value_content_are_reported(self):
        sample = {"id": "X", "required_groups": [["智能体"]]}
        result = score_sample(sample, "本文介绍智能体\n思考", ["本文"], {"思考"})
        self.assertEqual(result["forbidden_hits"], ["本文"])
        self.assertEqual(result["low_value_hits"], ["思考"])
        self.assertEqual(result["score"], 70.0)

    def test_five_samples_can_be_evaluated_together(self):
        outputs = {sample["id"]: "" for sample in self.config["samples"]}
        report = evaluate(outputs, self.config)
        self.assertEqual(len(report["results"]), 5)
        self.assertEqual(report["average_score"], 0.0)


if __name__ == "__main__":
    unittest.main()
