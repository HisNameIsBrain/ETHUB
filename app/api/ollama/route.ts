import { spawn } from "child_process";

export async function POST(req: Request) {
  const { prompt, model } = await req.json();

  const child = spawn("node", ["ollama-mcp/dist/index.js"], {
    stdio: ["pipe", "pipe", "pipe"]
  });

  child.stdin.write(JSON.stringify({
    method: "tools/ollama_generate",
    params: { prompt, model }
  }) + "\n");

  child.stdin.end();

  const data = await new Promise<string>((resolve) => {
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.on("close", () => resolve(output));
  });

  return new Response(data, { status: 200 });
}
