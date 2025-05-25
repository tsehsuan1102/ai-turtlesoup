import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// const openai = new OpenAIApi(configuration);
const GPT_MODEL = "gpt-4o-mini";

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
  const prompt = `你是一個邏輯推理遊戲的 AI 助手。請根據以下湯底（背景故事）和玩家目前已經獲得的線索，判斷玩家的提問：

1. 只允許回答「是」、「否」或「不相關」。
2. 如果這個提問問到一個新線索，請用一句話描述這個線索（否則回空字串）。
3. 請根據目前所有線索，判斷是否已經足以推理出答案（true/false）。

湯底：${puzzle}
目前線索：${clues.length > 0 ? clues.join("；") : "（無）"}
玩家提問：${question}

請用 JSON 格式回覆，例如：
{"answer": "是", "clue": "這個問題問到了兇手的動機。", "canReveal": false}

如果沒有新線索，clue 請回空字串。`;

  const completion = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "你只允許回覆 JSON 格式，answer 只能是「是」、「否」或「不相關」。",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 200,
    temperature: 0,
  });

  const raw = completion.choices[0].message?.content?.trim() || "";
  let answer = "不相關";
  let clue = "";
  let canReveal = false;
  try {
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw);
    if (json.answer) answer = json.answer;
    if (typeof json.clue === "string") clue = json.clue;
    if (typeof json.canReveal === "boolean") canReveal = json.canReveal;
  } catch (e) {
    console.error(e);
    // fallback: 只回 answer
    if (/^是/.test(raw)) answer = "是";
    else if (/^否/.test(raw)) answer = "否";
    else if (/不相關/.test(raw)) answer = "不相關";
  }
  return { answer, raw, clue, canReveal };
}
