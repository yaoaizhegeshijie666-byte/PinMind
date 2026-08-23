import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SAMPLES_PATH = ROOT / "generation_samples.json"


def flatten(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return "\n".join(flatten(v) for v in value.values())
    if isinstance(value, list):
        return "\n".join(flatten(v) for v in value)
    return str(value or "")


def normalize(text):
    text = text.replace("至", "-").replace("到", "-")
    return re.sub(r"[\s（）()，,。；;：:—_-]+", "", text).lower()


def score_sample(sample, output, forbidden, low_value):
    text = flatten(output)
    normalized = normalize(text)
    groups = sample["required_groups"]
    hits = [any(normalize(alias) in normalized for alias in group) for group in groups]
    missing = [group for group, hit in zip(groups, hits) if not hit]
    forbidden_hits = [phrase for phrase in forbidden if phrase in text]
    lines = [x.strip(" •-*\t") for x in text.splitlines()]
    low_value_hits = sorted({x for x in lines if x in low_value})
    coverage = sum(hits) / len(hits) if hits else 1
    has_content = bool(text.strip())
    score = round(coverage * 70 + (15 if has_content and not forbidden_hits else 0) + (15 if has_content and not low_value_hits else 0), 1)
    return {
        "id": sample["id"], "score": score, "coverage": round(coverage * 100, 1),
        "covered_groups": sum(hits), "total_groups": len(hits),
        "missing_groups": missing, "forbidden_hits": forbidden_hits,
        "low_value_hits": low_value_hits,
        "passed": score >= 85 and coverage >= 0.8,
    }


def evaluate(outputs, config):
    results = []
    for sample in config["samples"]:
        results.append(score_sample(
            sample, outputs.get(sample["id"], ""),
            config["forbidden_phrases"], set(config["low_value_items"]),
        ))
    average = round(sum(x["score"] for x in results) / len(results), 1)
    return {"average_score": average, "passed": all(x["passed"] for x in results), "results": results}


def main():
    parser = argparse.ArgumentParser(description="评测 PinMind A01-A05 生成结果")
    parser.add_argument("outputs", help="JSON 文件：键为 A01-A05，值为生成文本或结构化结果")
    parser.add_argument("--samples", default=str(SAMPLES_PATH))
    parser.add_argument("--report", help="可选：写出 JSON 报告")
    args = parser.parse_args()
    config = json.loads(Path(args.samples).read_text(encoding="utf-8"))
    outputs = json.loads(Path(args.outputs).read_text(encoding="utf-8"))
    report = evaluate(outputs, config)
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    print(rendered)
    if args.report:
        Path(args.report).write_text(rendered + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
