import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatTime } from "../utils/formatTime.js";
import { readJson, writeJson } from "../utils/jsonStore.js";

const MAX_MEMORIES = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEMORY_DATA_FILE = path.resolve(__dirname, "../data/memories.json");

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

function pickField(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "boolean") {
      return value;
    }
  }

  return fallback;
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
  const aiSummary = normalizeText(
    pickField(memory, ["summary", "aiSummary", "aiContent"]),
    "暂无摘要",
  );
  const rawContent = normalizeText(
    pickField(memory, ["rawText", "rawContent", "content", "text"]),
    aiSummary,
  );
  const keyPoints = normalizeList(memory.points || memory.keyPoints || memory.highlights);
  const tags = normalizeList(memory.tags || memory.autoTags || memory.tag);
  const createdAt = normalizeText(
    pickField(memory, ["createdAt", "updatedAt"]),
    new Date().toISOString(),
  );

  return {
    id: normalizeText(memory.id, `memory-${randomUUID()}`),
    type: normalizeText(memory.type, "text"),
    title: normalizeText(pickField(memory, ["title", "name"]), "未命名记忆"),
    rawContent,
    content: rawContent,
    rawText: rawContent,
    aiSummary,
    summary: aiSummary,
    keyPoints,
    points: keyPoints,
    todos: normalizeList(memory.todos || memory.tasks || memory.todoItems),
    tags,
    autoTags: tags,
    source: normalizeText(pickField(memory, ["source", "from"]), "android_app"),
    time: normalizeText(memory.time, formatTime()),
    createdAt,
    updatedAt: normalizeText(memory.updatedAt, createdAt),
    importance: normalizeImportance(pickField(memory, ["importance", "score"], 88)),
    archived: Boolean(memory.archived ?? memory.isArchived),
    category: normalizeText(memory.category, ""),
  };
}

function cloneMemory(memory) {
  return {
    ...memory,
    keyPoints: [...memory.keyPoints],
    points: [...memory.points],
    todos: [...memory.todos],
    tags: [...memory.tags],
    autoTags: [...memory.autoTags],
  };
}

function loadMemories() {
  const loaded = readJson(MEMORY_DATA_FILE, []);

  if (!Array.isArray(loaded)) {
    writeJson(MEMORY_DATA_FILE, []);
    return [];
  }

  const normalized = loaded.slice(0, MAX_MEMORIES).map(normalizeMemory);
  writeJson(MEMORY_DATA_FILE, normalized);
  return normalized;
}

function saveMemories() {
  writeJson(MEMORY_DATA_FILE, memories);
}

const memories = loadMemories();

export function getMemories() {
  return memories.map(cloneMemory);
}

export function addMemory(memory) {
  const entry = normalizeMemory(memory);
  memories.unshift(entry);

  if (memories.length > MAX_MEMORIES) {
    memories.splice(MAX_MEMORIES);
  }

  saveMemories();
  return cloneMemory(entry);
}

export function deleteMemory(id) {
  const index = memories.findIndex((memory) => memory.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = memories.splice(index, 1);
  saveMemories();
  return cloneMemory(deleted);
}

export function archiveMemories(options = {}) {
  const categories = {};
  const targetId = typeof options.id === "string" ? options.id : "";
  const requestedArchived =
    typeof options.archived === "boolean" ? options.archived : true;

  if (targetId) {
    const target = memories.find((memory) => memory.id === targetId);

    if (!target) {
      return {
        notFound: true,
        archivedCount: memories.filter((memory) => memory.archived).length,
        categories,
        memories: getMemories(),
      };
    }

    const category = inferCategory(target);
    target.archived = requestedArchived;
    target.updatedAt = new Date().toISOString();

    if (requestedArchived) {
      target.category = category;

      if (!target.tags.includes(category)) {
        target.tags.push(category);
        target.autoTags = [...target.tags];
      }
    }

    memories.forEach((memory) => {
      if (memory.archived) {
        const itemCategory = memory.category || inferCategory(memory);
        categories[itemCategory] = (categories[itemCategory] || 0) + 1;
      }
    });

    saveMemories();

    return {
      archivedCount: memories.filter((memory) => memory.archived).length,
      categories,
      memory: cloneMemory(target),
      memories: getMemories(),
    };
  }

  memories.forEach((memory) => {
    const category = inferCategory(memory);
    memory.archived = true;
    memory.category = category;
    memory.updatedAt = new Date().toISOString();

    if (!memory.tags.includes(category)) {
      memory.tags.push(category);
      memory.autoTags = [...memory.tags];
    }

    categories[category] = (categories[category] || 0) + 1;
  });

  saveMemories();

  return {
    archivedCount: memories.length,
    categories,
    memories: getMemories(),
  };
}

export function getLatestMemory() {
  const latest = memories[0];
  return latest ? cloneMemory(latest) : null;
}
