import { summarizeWithMockAi } from "./mockAiService.js";

export async function summarizeMeeting(text, options = {}) {
  // 后续可以在这里接入真实大模型 API。
  // API Key 不应写死在代码或前端中，应通过 .env 环境变量读取。
  return summarizeWithMockAi(text, options);
}
