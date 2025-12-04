# Terminal MCP ChatGPT Agent

This lightweight CLI lets you chat with OpenAI models from your terminal in an MCP-inspired, colorized experience. It uses the existing `openai` dependency, streams responses with live updates, and keeps conversation context in memory.

## Prerequisites
- Node.js 18.18+ (matches the project requirement)
- An `OPENAI_API_KEY` environment variable set in your shell
- Optional: `OPENAI_MODEL` to override the default `gpt-4o-mini`

## Usage
```bash
# From the repository root
OPENAI_API_KEY=sk-... npm run mcp:terminal
```

Once running:
- Type your prompt after the green **You** prompt.
- Enter `exit`, `quit`, or `q` to end the session.
- Responses stream in cyan with a divider between turns.

## Commands
- `/help` – show the command list
- `/clear` – reset the conversation state
- `/system <prompt>` – update the system prompt (conversation resets)
- `/model <name>` – switch the OpenAI model for future turns
- `/exit` – quit the agent

## Notes
- Output uses ANSI colors (via `chalk`); if you copy logs to a file, pipe through `sed 's/\x1b\[[0-9;]*m//g'` to strip them.
