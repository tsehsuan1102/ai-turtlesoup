import OpenAI from "openai";
import { Langfuse } from "langfuse";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

// 主動初始化 Langfuse
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GPT_MODEL = "gpt-4.1-mini";

// 定義回答 schema
const TurtleSoupAnswer = z.object({
  answer: z.enum(["是", "否", "不相關"]),
  clue: z.string(),
  canReveal: z.boolean(),
});

export async function askLLM({
  puzzle,
  answer,
  question,
  clues = [],
}: {
  puzzle: string;
  answer: string;
  question: string;
  clues?: string[];
}) {
  // 取得 production prompt 內容
  const prompt = await langfuse.getPrompt("turtlesoup-qa");
  const compiledPrompt = prompt.compile({
    puzzle,
    answer,
    question,
    clues: clues.length > 0 ? clues.join("；") : "（無）",
  });
  console.log(
    "%c 🏪: compiledPrompt ",
    "font-size:16px;background-color:#2588d5;color:white;",
    compiledPrompt
  );

  // Debug: 確認有呼叫到 openai
  console.log("Calling openai.responses.parse...");

  const response = await openai.responses.parse({
    model: GPT_MODEL,
    input: compiledPrompt,
    text: {
      format: zodTextFormat(TurtleSoupAnswer, "answer"),
    },
    // max_tokens: 200,
    temperature: 0,
  });

  const result = response.output_parsed;

  // Langfuse 追蹤：每次問答都建立一個 trace + generation
  const trace = langfuse.trace({
    name: "TurtleSoup LLM QA",
    metadata: { puzzle, question, clues },
    input: compiledPrompt,
    output: result,
  });
  trace
    .generation({
      name: "llm-ask",
      model: GPT_MODEL,
      input: prompt,
      output: result?.answer,
      metadata: result,
    })
    .end();
  await langfuse.shutdownAsync(); // 確保 event 送出

  return result;
}
