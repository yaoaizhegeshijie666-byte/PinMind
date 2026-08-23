import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from evals.eval_generation import evaluate
from server import ai_generate, validate_items
FIXTURES = ROOT / "source_fixtures.json"
SAMPLES = ROOT / "generation_samples.json"


def run_live(fixtures, generate=ai_generate):
    outputs = {}
    for source in fixtures["sources"]:
        result = generate([source], [])
        items = validate_items(result, [source], [])
        outputs[source["id"]] = {"knowledge_items": items}
        print(f'{source["id"]}: generated {len(items)} item(s)', flush=True)
    return outputs


def main():
    parser = argparse.ArgumentParser(description="真实重跑 A01-A05 并生成评分报告")
    parser.add_argument("--fixtures", default=str(FIXTURES))
    parser.add_argument("--samples", default=str(SAMPLES))
    parser.add_argument("--output", default=str(ROOT / "latest_outputs.json"))
    parser.add_argument("--report", default=str(ROOT / "latest_report.json"))
    args = parser.parse_args()
    if not os.getenv("OPENROUTER_API_KEY"):
        raise SystemExit("OPENROUTER_API_KEY_NOT_CONFIGURED")
    fixtures = json.loads(Path(args.fixtures).read_text(encoding="utf-8"))
    config = json.loads(Path(args.samples).read_text(encoding="utf-8"))
    outputs = run_live(fixtures)
    report = evaluate(outputs, config)
    Path(args.output).write_text(json.dumps(outputs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"average_score": report["average_score"], "passed": report["passed"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
