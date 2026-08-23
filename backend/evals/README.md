# PinMind 生成质量评测

## 样本

`generation_samples.json` 固化 A01—A05 的必保留信息、禁止话术和低信息点。

## 输入格式

准备一个 JSON 文件，键为文章编号，值可以是纯文本，也可以是 PinMind 返回的结构化 JSON：

```json
{
  "A01": "生成结果",
  "A02": {"knowledge_items": []},
  "A03": "生成结果",
  "A04": "生成结果",
  "A05": "生成结果"
}
```

## 运行

在 `backend` 目录执行：

```powershell
python evals\eval_generation.py outputs.json --report evals\latest_report.json
```

## 评分

- 关键事实覆盖率：70 分。
- 不含模板化元话语：15 分。
- 不含孤立低信息点：15 分。
- 单篇达到 85 分且关键事实覆盖率不低于 80% 才通过。
- 五篇全部通过，才视为本轮提示词修改通过。

## 真实模型重跑

`source_fixtures.json` 是依据用户确认的必保留信息建立的回归来源，不代替完整原文。配置 `OPENROUTER_API_KEY` 后，在 `backend` 目录手动执行：

```powershell
python evals\run_live_eval.py
```

脚本将逐篇生成并写出 `latest_outputs.json` 与 `latest_report.json`。终审模型默认关闭；只有显式设置 `PINMIND_REPAIR_PASS=1` 才会增加第三次模型请求。
