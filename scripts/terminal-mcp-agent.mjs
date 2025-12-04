#!/usr/bin/env node
import chalk from "chalk";
import OpenAI from "openai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const apiKey = process.env.OPENAI_API_KEY;
const initialModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!apiKey) {
  console.error(
    chalk.red(
      "Missing OPENAI_API_KEY. Set it in your environment before running the agent."
    )
  );
  process.exit(1);
}

const client = new OpenAI({ apiKey });

const accent = chalk.hex("#00c2ff");
const accentAlt = chalk.hex("#ff7a00");
const userColor = chalk.greenBright;
const assistantColor = chalk.cyanBright;
const dim = chalk.dim;

const defaultSystemPrompt = `You are an MCP-style assistant optimized for terminal use.
- Answer succinctly with helpful markdown (headings, lists, code fences).
- Format code fences with the correct language.
- Avoid noisy preambles—get to the point while staying friendly.`;

let model = initialModel;
let systemPrompt = defaultSystemPrompt;
let messages = [{ role: "system", content: systemPrompt }];

const rl = readline.createInterface({ input, output });

const promptLabel = () => userColor.bold("You ");
const renderAssistantPrefix = () => assistantColor.bold("Assistant ");
const renderDivider = () => console.log(dim("-".repeat(60)));

const banner = () => {
  const title = accent.bold(" MCP ChatGPT Terminal Agent ");
  const border = accent("═").repeat(title.length + 2);
  console.log(accent(`╔${border}╗`));
  console.log(accent(`║`) + " " + title + " " + accent(`║`));
  console.log(accent(`╚${border}╝`));
  console.log(
    dim(
      "Interactive, MCP-inspired chat. Type /help for commands or /exit to quit."
    )
  );
  console.log(dim(`Model: ${model}`));
  console.log();
};

const resetConversation = (newSystemPrompt = systemPrompt) => {
  systemPrompt = newSystemPrompt;
  messages = [{ role: "system", content: systemPrompt }];
};

const printHelp = () => {
  console.log(accentAlt("Commands:"));
  console.log(`${accent("/help")}${dim(" — show this menu")}`);
  console.log(`${accent("/clear")}${dim(" — reset conversation state")}`);
  console.log(`${accent("/system <prompt>")}${dim(" — update system prompt and reset")}`);
  console.log(`${accent("/model <name>")}${dim(" — switch OpenAI model for future turns")}`);
  console.log(`${accent("/exit")}${dim(" — quit the agent")}`);
  renderDivider();
};

const streamAssistant = async () => {
  process.stdout.write(`${renderAssistantPrefix()}${dim("› ")}`);

  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  let assistantMessage = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    assistantMessage += content;
    process.stdout.write(assistantColor(content));
  }

  messages.push({ role: "assistant", content: assistantMessage.trim() });
  console.log();
  renderDivider();
};

const handleCommand = (line) => {
  const [command, ...rest] = line.trim().split(" ");

  switch (command) {
    case "/exit":
    case "/quit":
    case "/q":
      return { shouldContinue: false };
    case "/help":
      printHelp();
      return { shouldContinue: true };
    case "/clear":
      resetConversation();
      console.log(dim("Conversation cleared."));
      renderDivider();
      return { shouldContinue: true };
    case "/system": {
      const nextPrompt = rest.join(" ").trim();
      if (!nextPrompt) {
        console.log(chalk.red("Please provide a system prompt."));
        renderDivider();
        return { shouldContinue: true };
      }
      resetConversation(nextPrompt);
      console.log(dim("System prompt updated and conversation reset."));
      renderDivider();
      return { shouldContinue: true };
    }
    case "/model": {
      const nextModel = rest.join(" ").trim();
      if (!nextModel) {
        console.log(chalk.red("Please provide a model name."));
        renderDivider();
        return { shouldContinue: true };
      }
      model = nextModel;
      console.log(dim(`Model set to ${accent(nextModel)}.`));
      renderDivider();
      return { shouldContinue: true };
    }
    default:
      console.log(chalk.red("Unknown command. Type /help for options."));
      renderDivider();
      return { shouldContinue: true };
  }
};

const handleUserInput = async () => {
  const line = await rl.question(`${promptLabel()}${dim("› ")}`);

  if (!line.trim()) {
    return true;
  }

  if (line.trim().startsWith("/")) {
    const { shouldContinue } = handleCommand(line);
    return shouldContinue;
  }

  messages.push({ role: "user", content: line });
  renderDivider();

  try {
    await streamAssistant();
  } catch (error) {
    console.error(chalk.red("\nFailed to fetch a response:"), error.message);
    renderDivider();
  }

  return true;
};

const main = async () => {
  banner();
  printHelp();

  let keepGoing = true;
  while (keepGoing) {
    keepGoing = await handleUserInput();
  }

  rl.close();
  console.log(dim("Goodbye!"));
};

main();
