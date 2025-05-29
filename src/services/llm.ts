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

const GPT_MODEL = "gpt-4o-mini";

// 定義回答 schema
const TurtleSoupAnswer = z.object({
  answer: z.enum(["是", "否", "不相關"]),
  clue: z.string(),
  canReveal: z.boolean(),
});

export async function askLLM({
  puzzle,
  question,
  clues = [],
}: {
  puzzle: string;
  question: string;
  clues?: string[];
}) {
  // prompt 設計：請 LLM 回答是/否/不相關，判斷是否有新線索，並判斷目前線索是否足以推理出答案
  const prompt = `
你是一個邏輯推理遊戲的 AI 助手。請根據以下湯底（背景故事）和玩家目前已經獲得的線索，判斷玩家的提問，並嚴格依照以下規則回答：

1. 如果玩家的問題和湯底有直接關聯，請回答「是」或「否」。
2. 如果問題和湯底完全無關，或無法從湯底與線索推理出答案，才回答「不相關」。
3. 如果這個提問問到一個新線索，請用一句話描述這個線索（否則回空字串）。
4. 請根據目前所有線索，判斷是否已經足以推理出答案（true/false），並回傳 canReveal 的值，如果線索已經足夠，請回傳 true，否則回傳 false。

【範例】
湯底：一個人死在密室裡，門窗緊閉，地上有一灘水。
線索：無
玩家提問：「他是被人殺的嗎？」→「否」
玩家提問：「他是因為溺水死的嗎？」→「不相關」
玩家提問：「他是自殺嗎？」→「是」

請用 JSON 格式回覆，例如：
{"answer": "是", "clue": "死者是自殺的", "canReveal": false}

湯底：${puzzle}
目前線索：${clues.length > 0 ? clues.join("；") : "（無）"}
玩家提問：${question}


如果沒有新線索，clue 請回空字串。
`;

  // Debug: 確認有呼叫到 openai
  console.log("Calling openai.responses.parse...");

  const response = await openai.responses.parse({
    model: GPT_MODEL,
    input: [
      {
        role: "system",
        content:
          "你只允許回覆 JSON 格式，answer 只能是「是」、「否」或「不相關」。",
      },
      { role: "user", content: prompt },
    ],
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
    input: prompt,
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
