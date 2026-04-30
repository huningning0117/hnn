import { randomUUID } from "node:crypto";
import { formatTime } from "../utils/formatTime.js";

const DEFAULT_TEXT =
  "瞬忆项目会议讨论了 APP 界面优化、ESP32 麦克风采集、技能节比赛演示、AI 自动整理会议重点，以及硬件联动展示流程。";

function normalizeText(text) {
  if (typeof text !== "string") {
    return DEFAULT_TEXT;
  }

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_TEXT;
}

function buildTitle(rawContent, source) {
  if (source === "audio-demo") {
    return "瞬忆音频演示会议纪要";
  }

  if (source === "mock") {
    return "瞬忆项目联调会议纪要";
  }

  if (rawContent.includes("技能节")) {
    return "瞬忆技能节展示准备会议";
  }

  if (rawContent.includes("ESP32") || rawContent.includes("硬件")) {
    return "瞬忆硬件联动方案会议";
  }

  return "瞬忆会议整理结果";
}

export async function summarizeWithMockAi(text, options = {}) {
  const source = options.source || "mock";
  const rawContent = normalizeText(text);

  return {
    id: `meeting-${randomUUID()}`,
    type: "meeting",
    title: buildTitle(rawContent, source),
    rawContent,
    aiSummary:
      "本次会议围绕瞬忆项目的 APP 体验、ESP32 数据采集、AI 会议整理能力和技能节现场演示流程展开。团队明确先用 mock AI 跑通后端链路，再逐步接入真实语音识别和大模型总结能力。",
    keyPoints: [
      "后端先提供稳定的会议整理接口，APP 后续可优先请求后端并保留本地 mock 兜底。",
      "ESP32 侧预留文本和音频上传链路，当前阶段先验证数据格式和接口连通性。",
      "技能节展示重点放在硬件采集、APP 展示、AI 自动归纳重点的完整闭环。",
      "真实大模型 API 后续统一放在后端 services/aiService.js 中接入，API Key 从环境变量读取。",
    ],
    todos: [
      {
        text: "完成 APP 请求后端的配置开关和失败兜底逻辑",
        owner: "前端",
        done: false,
      },
      {
        text: "验证 ESP32 上传文本到 /api/meeting/text 的数据格式",
        owner: "硬件",
        done: false,
      },
      {
        text: "准备技能节现场演示用的会议样例和硬件联动脚本",
        owner: "项目组",
        done: false,
      },
    ],
    tags: ["瞬忆", "会议整理", "ESP32", "技能节", "AI 总结"],
    source,
    time: formatTime(),
    importance: 9.2,
  };
}
