"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const langfuse_1 = require("langfuse");
const langfuse = new langfuse_1.Langfuse({
    secretKey: "sk-lf-4af02351-1e21-4fb1-a624-b8fa25c05096",
    publicKey: "pk-lf-035a2bc7-df86-4a13-95cc-66da5b86a9dd",
    baseUrl: "https://us.cloud.langfuse.com",
    // _projectId: "cmb4p0ece01d9ad07go3f6n4h", // 用 _projectId
});
async function main() {
    const trace = langfuse.trace({
        name: "JS SDK Manual Trace",
        userId: "js_test_user",
        metadata: { env: "local" },
        tags: ["manual"],
    });
    // 假設這是你 LLM 的 prompt 和 response
    const prompt = "Tell me a joke.";
    const response = "Why did the scarecrow win an award? Because he was outstanding in his field!";
    // 建立一個 generation（AI 回答）
    const generation = trace.generation({
        name: "chat-completion",
        model: "gpt-4o",
        modelParameters: {
            temperature: 0.7,
            maxTokens: 100,
        },
        input: prompt,
        output: response,
    });
    generation.end();
    // 結束 trace（可選，確保 event 送出）
    await langfuse.shutdownAsync();
    console.log("Trace created:", trace.id);
}
main();
