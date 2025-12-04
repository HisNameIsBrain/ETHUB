#!/usr/bin/env node
import OpenAI from "openai";
import chalk from "chalk";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
const userColor = chalk.greenBright;
const assistantColor = chalk.cyanBright;
const dim = chalk.dim;

const banner = () => {
  const title = accent.bold(" MCP ChatGPT Terminal Agent ");
  const border = accent("═").repeat(title.length + 2);
  console.log(accent(`╔${border}╗`));
  console.log(accent(`║`) + " " + title + " " + accent(`║`));
  console.log(accent(`╚${border}╝`));
  console.log(
    dim(
      "Interactive, MCP-inspired chat in your terminal. Type `exit` to quit."
    )
  );
  console.log(dim(`Model: ${model}`));
  console.log();
};

const instructions = `You are an MCP-style assistant optimized for terminal use. Keep responses concise, use markdown where helpful, and format code fences with the correct language when possible.`;

const messages = [{ role: "system", content: instructions }];

const rl = readline.createInterface({ input, output });

const promptLabel = () => userColor.bold("You ");

const renderAssistantPrefix = () => assistantColor.bold("Assistant ");

const renderDivider = () => console.log(dim("-".repeat(60)));

const handleUserInput = async () => {
  const line = await rl.question(`${promptLabel()}${dim("› ")}`);

  if (!line.trim()) {
    return true;
  }

  if (["exit", "quit", "q"].includes(line.trim().toLowerCase())) {
    return false;
  }

  messages.push({ role: "user", content: line });
  renderDivider();
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

  messages.push({ role: "assistant", content: assistantMessage });
  console.log();
  renderDivider();
  return true;
};

const main = async () => {
  banner();

  let keepGoing = true;
  while (keepGoing) {
    try {
      keepGoing = await handleUserInput();
    } catch (error) {
      console.error(chalk.red("\nFailed to fetch a response:"), error);
      renderDivider();
    }
  }

  rl.close();
  console.log(dim("Goodbye!"));
};

main();
