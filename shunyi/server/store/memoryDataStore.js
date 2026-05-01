import { randomUUID } from "node:crypto";
import { formatTime } from "../utils/formatTime.js";

const MAX_MEMORIES = 100;
const memories = [];

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item.text === "string") {
        return item.text.trim();
      }

      return "";
    })
    .filter(Boolean);
}

function normalizeImportance(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 88;
  }

  return Math.max(0, Math.min(100, numericValue <= 10 ? numericValue * 10 : numericValue));
}

function inferCategory(memory) {
  const searchText = [
    memory.title,
    memory.rawContent,
    memory.aiSummary,
    memory.tags?.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  if (/esp32|硬件|麦克风/.test(searchText)) {
    return "硬件";
  }

  if (/会议|讨论|任务/.test(searchText)) {
    return "会议";
  }

  if (/app|页面|前端/.test(searchText)) {
    return "开发";
  }

  if (/灵感|想法|方案/.test(searchText)) {
    return "灵感";
  }

  return "生活";
}

function normalizeMemory(memory = {}) {
  const aiSummary = normalizeText(memory.aiSummary || memory.aiContent, "已保存一条记忆片段。");
  const rawContent = normalizeText(memory.rawContent || memory.content, aiSummary);
  const tags = normalizeList(memory.tags || memory.tag);

  return {
    id: normalizeText(memory.id, `memory-${randomUUID()}`),
    type: normalizeText(memory.type, "text"),
    title: normalizeText(memory.title, "未命名记忆"),
    rawContent,
    aiSummary,
    keyPoints: normalizeList(memory.keyPoints),
    todos: normalizeList(memory.todos),
    tags,
    source: normalizeText(memory.source, "android_app"),
    time: normalizeText(memory.time, formatTime()),
    importance: normalizeImportance(memory.importance),
    archived: Boolean(memory.archived),
    category: normalizeText(memory.category, ""),
  };
}

export function getMemories() {
  return memories.map((memory) => ({
    ...memory,
    keyPoints: [...memory.keyPoints],
    todos: [...memory.todos],
    tags: [...memory.tags],
  }));
}

export function addMemory(memory) {
  const entry = normalizeMemory(memory);
  memories.unshift(entry);

  if (memories.length > MAX_MEMORIES) {
    memories.splice(MAX_MEMORIES);
  }

  return {
    ...entry,
    keyPoints: [...entry.keyPoints],
    todos: [...entry.todos],
    tags: [...entry.tags],
  };
}

export function deleteMemory(id) {
  const index = memories.findIndex((memory) => memory.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = memories.splice(index, 1);
  return {
    ...deleted,
    keyPoints: [...deleted.keyPoints],
    todos: [...deleted.todos],
    tags: [...deleted.tags],
  };
}

export function archiveMemories() {
  const categories = {};

  memories.forEach((memory) => {
    const category = inferCategory(memory);
    memory.archived = true;
    memory.category = category;
    if (!memory.tags.includes(category)) {
      memory.tags.push(category);
    }
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    archivedCount: memories.length,
    categories,
    memories: getMemories(),
  };
}

export function getLatestMemory() {
  const latest = memories[0];
  return latest
    ? {
        ...latest,
        keyPoints: [...latest.keyPoints],
        todos: [...latest.todos],
        tags: [...latest.tags],
      }
    : null;
}
