import express from "express";
import { addMemory } from "../store/memoryDataStore.js";
import { addEvent } from "../store/eventLogStore.js";

const router = express.Router();

const DEFAULT_TRANSCRIBE_CONTENT =
  "今天我们讨论瞬忆项目，需要优化 APP 交互，并准备 ESP32 硬件联动演示。";

const DEFAULT_POLISH_TEXT =
  "那个今天就是我们要弄一下那个 APP，然后硬件那边也要接一下。";

function getEventSource(req) {
  return req.get("x-shunyi-source") === "android_app" ? "android_app" : "server";
}

function normalizeText(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function polishText(text) {
  const normalized = normalizeText(text, DEFAULT_POLISH_TEXT);

  if (normalized.includes("APP") || normalized.includes("硬件")) {
    return "今天的任务是优化瞬忆 APP，并准备 ESP32 硬件接入测试。";
  }

  return normalized
    .replaceAll("那个", "")
    .replaceAll("就是", "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^今天/, "今天的任务是");
}

router.post("/voice-transcribe", (req, res) => {
  const rawContent = normalizeText(req.body?.content, DEFAULT_TRANSCRIBE_CONTENT);
  const memory = addMemory({
    type: "voice",
    title: "语音转写记录",
    rawContent,
    aiSummary: "完成了一段会议语音的文字转写。",
    keyPoints: ["APP 交互需要优化", "准备 ESP32 硬件联动演示"],
    todos: ["检查 APP 功能入口交互", "准备硬件联动演示素材"],
    tags: ["语音", "转写", "会议"],
    source: "android_app",
    importance: 92,
  });

  addEvent({
    event: "feature_voice_transcribe",
    source: getEventSource(req),
    detail: `voice transcribe saved: memoryId=${memory.id}`,
  });
  addEvent({
    event: "memory_added",
    source: getEventSource(req),
    detail: `memory added by voice transcribe: id=${memory.id}, type=${memory.type}`,
  });

  res.json({
    success: true,
    memory,
  });
});

router.post("/ai-polish", (req, res) => {
  const before = normalizeText(req.body?.text, DEFAULT_POLISH_TEXT);
  const after = polishText(before);
  const memory = addMemory({
    type: "text",
    title: "AI 修正记录",
    rawContent: before,
    aiSummary: after,
    keyPoints: ["优化瞬忆 APP", "准备 ESP32 硬件接入测试"],
    todos: ["整理 APP 优化任务", "准备硬件接入测试"],
    tags: ["AI 修正", "APP", "硬件"],
    source: "android_app",
    importance: 90,
  });

  addEvent({
    event: "feature_ai_polish",
    source: getEventSource(req),
    detail: `ai polish saved: memoryId=${memory.id}`,
  });
  addEvent({
    event: "memory_added",
    source: getEventSource(req),
    detail: `memory added by ai polish: id=${memory.id}, type=${memory.type}`,
  });

  res.json({
    success: true,
    before,
    after,
    memory,
  });
});

export default router;
