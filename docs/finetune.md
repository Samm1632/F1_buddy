## Fine-tuning guide

This project includes example JSONL datasets in `data/finetune/` formatted for OpenAI chat fine-tuning.

### Format (JSONL)
Each line is a JSON object with a `messages` array of role/content pairs:
```json
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
```

### Tips
- Keep answers concise and include numbered citations to official sources.
- Include diverse topics: I‑20, SEVIS, OPT, STEM extension, CPT, visa interview, DS‑160, financial docs, travel, grace period, status maintenance.
- Use consistent phrasing to help the model learn the style.

### Command (example)
Refer to OpenAI docs for the latest CLI/API. Example (subject to change):
```bash
openai files create -f data/finetune/training.jsonl -p fine-tune
openai files create -f data/finetune/validation.jsonl -p fine-tune
openai fine_tuning.jobs create -t <training_file_id> -v <validation_file_id> -m gpt-4o-mini
```

### Safety
- Only use public, non-copyrighted content from official sources.
- Avoid including private or personal data.