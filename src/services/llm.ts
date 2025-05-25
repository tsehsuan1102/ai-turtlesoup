import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// const openai = new OpenAIApi(configuration);

export async function askLLM({
  puzzle,
  question,
}: {
  puzzle: string;
  question: string;
}) {
  // prompt 設計：請 LLM 只回「是」、「否」或「不相關」
  const prompt = `你是一個邏輯推理遊戲的 AI 助手。請根據以下湯底（背景故事）判斷玩家的提問，並只用「是」、「否」或「不相關」三種回覆。

湯底：${puzzle}
玩家提問：${question}
請直接回答：`;

  const completion = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "你只允許回覆「是」、「否」或「不相關」。" },
      { role: "user", content: prompt },
    ],
    // max_tokens: 10,
    // temperature: 0,
  });

  // 只允許三種答案
  const raw = completion.output_text; //[0].message?.content?.trim() || "";
  let answer = "不相關";
  if (/^是/.test(raw)) answer = "是";
  else if (/^否/.test(raw)) answer = "否";
  else if (/不相關/.test(raw)) answer = "不相關";

  return { answer, raw };
}
