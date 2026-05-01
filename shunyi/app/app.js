const DEFAULT_API_BASE_URL = "http://10.67.191.156:3000";
const API_BASE_URL_STORAGE_KEY = "shunyi_api_base_url";
const MEETING_MOCK_PATH = "/api/meeting/mock";
const APP_STATE_PATH = "/api/app/state";
const MEMORIES_PATH = "/api/memories";
const DEFAULT_AI_POLISH_TEXT = "那个今天就是我们要弄一下那个 APP，然后硬件那边也要接一下。";

const settingEndpointMap = {
  pause: "/api/settings/pause",
  encryption: "/api/settings/encryption",
  lowPower: "/api/settings/low-power"
};

function normalizeApiBaseUrl(url) {
  if (typeof url !== "string") {
    return "";
  }

  return url.trim().replace(/\/+$/, "");
}

function getApiBaseUrl() {
  try {
    const savedUrl = normalizeApiBaseUrl(localStorage.getItem(API_BASE_URL_STORAGE_KEY) || "");
    return savedUrl || DEFAULT_API_BASE_URL;
  } catch (error) {
    console.warn("Failed to read backend base URL from localStorage", error);
    return DEFAULT_API_BASE_URL;
  }
}

function setApiBaseUrl(url) {
  const normalized = normalizeApiBaseUrl(url);

  try {
    localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalized);
  } catch (error) {
    console.warn("Failed to save backend base URL to localStorage", error);
  }
}

function resetApiBaseUrl() {
  try {
    localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear backend base URL from localStorage", error);
  }
}

const typeConfig = {
  voice: { label: "语音", icon: "mic", tone: "语音转写" },
  text: { label: "文字", icon: "edit", tone: "手动记录" },
  clipboard: { label: "剪贴板", icon: "clip", tone: "剪贴板模拟" },
  todo: { label: "待办", icon: "check", tone: "待办整理" },
  idea: { label: "灵感", icon: "spark", tone: "灵感捕捉" },
  meeting: { label: "会议", icon: "cpu", tone: "ESP32 硬件采集" }
};

const mockMemories = [
  {
    id: "m001",
    type: "voice",
    title: "项目答辩创新点提醒",
    rawContent: "老师说那个项目答辩要突出创新点，然后最好能说清楚用户痛点。",
    aiContent: "项目答辩需要重点突出创新点，并清楚说明目标用户的痛点和解决方案。",
    tag: ["语音", "项目答辩", "创新点"],
    time: "08:35",
    location: "教学楼 302",
    importance: 94
  },
  {
    id: "m002",
    type: "idea",
    title: "时间线式记忆灵感",
    rawContent: "我感觉这个记忆 APP 可以像时间线一样把一天串起来。",
    aiContent: "APP 可以采用时间线设计，将一天内产生的碎片记忆自动串联成完整回顾。",
    tag: ["灵感", "时间线", "产品设计"],
    time: "10:10",
    location: "图书馆 2F",
    importance: 88
  },
  {
    id: "m003",
    type: "clipboard",
    title: "项目核心关键词",
    rawContent: "软硬结合、AI归档、隐私可控、碎片记忆",
    aiContent: "项目核心关键词包括软硬结合、AI 自动归档、隐私可控和碎片记忆管理。",
    tag: ["剪贴板", "项目答辩", "关键词"],
    time: "13:20",
    location: "实验室 B204",
    importance: 91
  },
  {
    id: "m004",
    type: "todo",
    title: "路演稿与首页 UI 待办",
    rawContent: "晚上改一下路演稿，还有首页 UI 要好看点。",
    aiContent: "待办事项：今晚优化路演稿，并提升 APP 首页 UI 的视觉表现。",
    tag: ["待办", "路演", "UI 优化"],
    time: "18:40",
    location: "宿舍",
    importance: 86
  },
  {
    id: "m005",
    type: "text",
    title: "校园导航算法学习",
    rawContent: "Dijkstra 算法可以用在校园导航里面算最短路径。",
    aiContent: "Dijkstra 算法可用于校园导航场景，根据地点节点和路径权重计算最短路线。",
    tag: ["学习", "算法", "校园导航"],
    time: "20:15",
    location: "自习室 A1",
    importance: 82
  }
];

const aiFixPreview = {
  memoryId: "m001",
  actions: ["去口语化", "提炼重点", "答辩要点"],
  score: "A+"
};

const categoryStats = [
  { name: "灵感", count: 1 },
  { name: "学习", count: 1 },
  { name: "答辩", count: 2 },
  { name: "UI", count: 1 },
  { name: "待办", count: 1 },
  { name: "剪贴板", count: 1 }
];

const timeline = [
  { time: "20:15", title: "学习碎片已归档", detail: "Dijkstra 算法已归入学习分类。" },
  { time: "18:40", title: "待办事项已生成", detail: "路演稿和首页 UI 优化已整理为行动项。" },
  { time: "13:20", title: "剪贴板关键词已整理", detail: "项目关键词已生成答辩素材。" },
  { time: "10:10", title: "灵感碎片进入时间线", detail: "时间线式记忆想法已加入产品设计分类。" }
];

const meetingFlowSteps = [
  {
    key: "hardware",
    title: "硬件采集中",
    desc: "ESP32 端已触发采集，正在上传测试文本",
    progress: 34
  },
  {
    key: "ai",
    title: "AI 整理中",
    desc: "正在生成摘要、重点、待办和标签",
    progress: 72
  },
  {
    key: "complete",
    title: "整理完成",
    desc: "会议结果已生成并保存到记忆舱",
    progress: 100
  }
];

const mockMeetingContent = {
  rawContent:
    "今天小组讨论了瞬忆 AI 记忆助手的比赛展示方案。硬件端用 ESP32 模拟采集触发，APP 首页需要突出开始会议记录流程，后端先返回 mock AI 结果。答辩时要强调软硬件联动、隐私边界和后续接入真实大模型的计划。",
  summary:
    "本次会议明确了瞬忆 Demo 的比赛展示路径：先用 ESP32 触发采集和 mock AI 数据打通闭环，APP 负责展示会议整理结果，后续再接入真实语音识别和大模型接口。",
  keyPoints: ["ESP32 负责演示采集触发", "APP 增加会议记录流程入口", "后端优先返回稳定 mock AI 结果", "答辩强调软硬件联动和隐私边界"],
  todos: ["完善首页开始会议记录交互", "准备 ESP32 上传测试文本接口", "补充答辩中的安全边界说明"],
  tags: ["会议", "ESP32", "AI 整理", "比赛演示"]
};

const state = {
  tab: "home",
  filter: "all",
  query: "",
  expandedId: "m003",
  backendOffline: false,
  syncMessage: "",
  activePanel: "",
  appState: {
    paused: false,
    encryptionEnabled: false,
    lowPowerMode: false,
    privacyMode: true,
    lastAction: "",
    updatedAt: ""
  },
  featureStatus: {
    voice: "idle",
    archive: "idle",
    delete: "idle"
  },
  requestDebug: {},
  backendConfig: {
    input: getApiBaseUrl(),
    current: getApiBaseUrl(),
    testing: false
  },
  voiceResult: null,
  archiveResult: null,
  deleteListLoaded: false,
  deleteMemories: [],
  aiPolish: {
    status: "idle",
    text: DEFAULT_AI_POLISH_TEXT,
    before: "",
    after: "",
    memory: null
  },
  meeting: {
    status: "idle",
    progress: 0,
    resultId: "",
    backendStatus: "idle",
    backendDetail: "",
    diagnostic: {
      status: "idle",
      output: ""
    }
  }
};

const app = document.querySelector("#app");
const navButtons = document.querySelectorAll(".nav-item");
const splashScreen = document.querySelector("#splash-screen");
let meetingTimerIds = [];
let backendSyncTimerId = 0;

const icons = {
  mic: '<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/><path d="M18 10.5a6 6 0 0 1-12 0M12 18v3M9 21h6"/>',
  edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="m13.5 7.5 3 3"/>',
  clip: '<path d="M8 7h8M8 12h8M8 17h5"/><path d="M6 3h12a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 6 3z"/>',
  check: '<path d="m5 12 4 4L19 6"/><path d="M4 20h16"/>',
  spark: '<path d="M12 3l1.4 5.2L18 10l-4.6 1.8L12 17l-1.4-5.2L6 10l4.6-1.8z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/>',
  archive: '<path d="M4 7h16v13H4z"/><path d="M3 4h18v3H3zM9 11h6"/>',
  shield: '<path d="M12 3 5 6v5c0 4.2 2.8 7.8 7 10 4.2-2.2 7-5.8 7-10V6z"/><path d="m9 12 2 2 4-5"/>',
  search: '<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"/><path d="m16 16 4 4"/>',
  cloud: '<path d="M7 18h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4-1.8A4.8 4.8 0 0 0 7 18z"/>',
  phone: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M10.5 18h3"/>',
  cpu: '<path d="M8 8h8v8H8z"/><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"/>',
  lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3"/><path d="M6 11h12v9H6z"/>',
  pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>',
  leaf: '<path d="M5 19c9 0 14-5 14-14-7 0-14 4-14 14z"/><path d="M5 19c3-6 7-9 14-14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.4-.2-.1a1.8 1.8 0 0 0-2 .4l-.2.2h-4l-.2-.2a1.8 1.8 0 0 0-2-.4l-.2.1-2-3.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H5v-4h.9a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2L7 6.9l2-3.4.2.1a1.8 1.8 0 0 0 2-.4l.2-.2h4l.2.2a1.8 1.8 0 0 0 2 .4l.2-.1 2 3.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1h.9v4h-.9a1.8 1.8 0 0 0-1.5 1z"/>'
};

function icon(name, className = "") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatImportance(importance) {
  const numericValue = Number(importance);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  const normalized = numericValue <= 10 ? numericValue : numericValue / 10;
  return normalized.toFixed(1).replace(/\.0$/, "");
}

function getMeetingStepIndex(status) {
  return meetingFlowSteps.findIndex((step) => step.key === status);
}

function getMeetingStatusMeta() {
  return meetingFlowSteps.find((step) => step.key === state.meeting.status) || {
    key: "idle",
    title: "待命中",
    desc: "点击开始后模拟 ESP32 采集与 AI 整理",
    progress: 0
  };
}

function formatCurrentTime() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function pickTextValue(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeMeetingList(value, fallback) {
  if (!Array.isArray(value) || value.length === 0) {
    return [...fallback];
  }

  const normalized = value
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

  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeMeetingImportance(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 96;
  }

  return numericValue <= 10 ? Math.round(numericValue * 10) : Math.round(numericValue);
}

function getBackendErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Network request failed";
}

function formatErrorDetail(error) {
  const name = error instanceof Error && error.name ? error.name : typeof error;
  const message = error instanceof Error && error.message ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? error.stack : "";

  return [
    `error.name: ${name}`,
    `error.message: ${message}`,
    stack ? `error.stack: ${stack}` : "error.stack: "
  ].join("\n");
}

async function readResponseText(response) {
  try {
    const text = await response.text();
    return text.length > 500 ? `${text.slice(0, 500)}...` : text;
  } catch (error) {
    return `读取响应失败\n${formatErrorDetail(error)}`;
  }
}

function buildApiUrl(path, baseUrl = getApiBaseUrl()) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${normalizeApiBaseUrl(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

async function apiRequest(path, options = {}) {
  const { baseUrl, headers, ...fetchOptions } = options;
  const url = buildApiUrl(path, baseUrl);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        "X-ShunYi-Source": "android_app",
        ...(headers || {})
      }
    });
    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      error.name = "HttpError";
      error.requestUrl = url;
      error.responseData = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.requestUrl) {
      throw error;
    }

    const wrapped = new Error(`${url} 请求失败：${error.message}`);
    wrapped.name = error.name || "RequestError";
    wrapped.requestUrl = url;
    throw wrapped;
  }
}

function createDebugSummary(data) {
  if (!data) {
    return "";
  }

  if (data.memory) {
    return [
      `memory.id: ${data.memory.id}`,
      `title: ${data.memory.title}`,
      `rawContent: ${data.memory.rawContent || ""}`,
      `aiSummary: ${data.memory.aiSummary || data.memory.aiContent || ""}`
    ].join("\n");
  }

  if (typeof data.archivedCount !== "undefined") {
    return [
      `archivedCount: ${data.archivedCount}`,
      `categories: ${JSON.stringify(data.categories || {})}`
    ].join("\n");
  }

  if (data.state) {
    return [
      `paused: ${data.state.paused}`,
      `encryptionEnabled: ${data.state.encryptionEnabled}`,
      `lowPowerMode: ${data.state.lowPowerMode}`,
      `lastAction: ${data.state.lastAction || ""}`
    ].join("\n");
  }

  if (data.service || data.message || data.aiMode || data.esp32Status) {
    return [
      `service: ${data.service || ""}`,
      `message: ${data.message || ""}`,
      `aiMode: ${data.aiMode || ""}`,
      `esp32Status: ${data.esp32Status || ""}`
    ].join("\n");
  }

  if (Array.isArray(data.memories)) {
    return `memories.length: ${data.memories.length}`;
  }

  return JSON.stringify(data, null, 2).slice(0, 700);
}

function setRequestDebug(key, patch) {
  state.requestDebug[key] = {
    ...(state.requestDebug[key] || {}),
    ...patch
  };
}

function startRequestDebug(key, path, baseUrl) {
  setRequestDebug(key, {
    url: buildApiUrl(path, baseUrl),
    status: "正在请求",
    errorName: "",
    errorMessage: "",
    result: ""
  });
}

function completeRequestDebug(key, data) {
  setRequestDebug(key, {
    status: "请求成功",
    errorName: "",
    errorMessage: "",
    result: createDebugSummary(data)
  });
}

function failRequestDebug(key, error) {
  setRequestDebug(key, {
    url: error.requestUrl || state.requestDebug[key]?.url || "",
    status: "请求失败",
    errorName: error.name || "Error",
    errorMessage: error.message || String(error),
    result: ""
  });
}

function renderRequestDebug(key) {
  const debug = state.requestDebug[key];

  if (!debug) {
    return "";
  }

  return `
    <div class="request-debug ${debug.status === "请求失败" ? "is-error" : ""}">
      <span class="content-label">接口</span>
      <code>${escapeHtml(debug.url || "")}</code>
      <span class="content-label">请求状态</span>
      <strong>${escapeHtml(debug.status || "待请求")}</strong>
      ${debug.errorMessage ? `
        <span class="content-label">错误</span>
        <pre>error.name: ${escapeHtml(debug.errorName || "Error")}\nerror.message: ${escapeHtml(debug.errorMessage)}\nrequest.url: ${escapeHtml(debug.url || "")}</pre>
      ` : ""}
      ${debug.result ? `
        <span class="content-label">后端返回</span>
        <pre>${escapeHtml(debug.result)}</pre>
      ` : ""}
    </div>
  `;
}

function notifyRequestFailure(label, key, error) {
  failRequestDebug(key, error);

  const url = error.requestUrl || state.requestDebug[key]?.url || "";
  const name = error.name || "Error";
  const message = error.message || String(error);

  window.alert?.([
    `${label}请求失败`,
    `接口：${url}`,
    `error.name：${name}`,
    `error.message：${message}`
  ].join("\n"));
  showToast(`${label}失败：${message}`);
}

function getBackendConfigCandidateUrl() {
  return normalizeApiBaseUrl(state.backendConfig.input || state.backendConfig.current || DEFAULT_API_BASE_URL);
}

function validateApiBaseUrl(url) {
  const normalized = normalizeApiBaseUrl(url);

  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error("后端地址必须以 http:// 或 https:// 开头");
  }

  return normalized;
}

function syncBackendConfigState() {
  const current = getApiBaseUrl();
  state.backendConfig.current = current;

  if (!state.backendConfig.input) {
    state.backendConfig.input = current;
  }
}

function normalizeAppState(nextState = {}) {
  return {
    paused: Boolean(nextState.paused),
    encryptionEnabled: Boolean(nextState.encryptionEnabled),
    lowPowerMode: Boolean(nextState.lowPowerMode),
    privacyMode: nextState.privacyMode !== false,
    lastAction: pickTextValue(nextState.lastAction, ""),
    updatedAt: pickTextValue(nextState.updatedAt, "")
  };
}

function setAppState(nextState) {
  state.appState = normalizeAppState({
    ...state.appState,
    ...nextState
  });
  scheduleBackendSync();
}

function normalizeMemoryTags(memory) {
  const tags = normalizeMeetingList(memory.tags || memory.tag, []);
  const category = pickTextValue(memory.category, "");

  if (category && !tags.includes(category)) {
    tags.push(category);
  }

  return tags.length > 0 ? tags : ["后端记忆"];
}

function normalizeBackendMemory(memory = {}) {
  const tags = normalizeMemoryTags(memory);
  const aiContent = pickTextValue(
    memory.aiContent,
    pickTextValue(memory.aiSummary, pickTextValue(memory.summary, "已保存一条记忆片段。"))
  );

  return {
    id: pickTextValue(memory.id, `memory-${Date.now()}`),
    type: pickTextValue(memory.type, "text"),
    title: pickTextValue(memory.title, "后端记忆片段"),
    rawContent: pickTextValue(memory.rawContent, aiContent),
    aiContent,
    keyPoints: normalizeMeetingList(memory.keyPoints, []),
    todos: normalizeMeetingList(memory.todos, []),
    tag: tags,
    time: pickTextValue(memory.time, formatCurrentTime()),
    location: pickTextValue(memory.location, pickTextValue(memory.category, "后端记忆舱")),
    source: pickTextValue(memory.source, "Node.js 后端"),
    importance: normalizeMeetingImportance(memory.importance),
    archived: Boolean(memory.archived),
    category: pickTextValue(memory.category, "")
  };
}

function setMemoriesFromBackend(memories) {
  const normalized = Array.isArray(memories) ? memories.map(normalizeBackendMemory) : [];
  mockMemories.splice(0, mockMemories.length, ...normalized);

  if (normalized.length > 0 && !mockMemories.some((memory) => memory.id === state.expandedId)) {
    state.expandedId = normalized[0].id;
  }
}

function upsertMemoryFromBackend(memory) {
  const normalized = normalizeBackendMemory(memory);
  const index = mockMemories.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    mockMemories.splice(index, 1);
  }

  mockMemories.unshift(normalized);
  state.expandedId = normalized.id;
  return normalized;
}

async function loadAppState({ silent = false } = {}) {
  const nextState = await apiRequest(APP_STATE_PATH);
  setAppState(nextState);
  state.backendOffline = false;
  state.syncMessage = "";

  if (!silent) {
    showToast("已同步后端状态");
  }

  return nextState;
}

async function loadMemories({ silent = false } = {}) {
  const payload = await apiRequest(MEMORIES_PATH);
  setMemoriesFromBackend(payload.memories);
  state.backendOffline = false;
  state.syncMessage = "";

  if (!silent) {
    showToast("已同步后端记忆");
  }

  return payload.memories;
}

async function syncBackendData({ silent = true } = {}) {
  const [stateResult, memoriesResult] = await Promise.allSettled([
    loadAppState({ silent: true }),
    loadMemories({ silent: true })
  ]);

  if (stateResult.status === "rejected" && memoriesResult.status === "rejected") {
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";

    if (!silent) {
      showToast("后端离线，已使用本地兜底数据");
    }
  } else if (!silent) {
    showToast("后端状态与记忆已同步");
  }

  render();
}

function scheduleBackendSync() {
  window.clearInterval(backendSyncTimerId);
  const intervalMs = state.appState.lowPowerMode ? 90000 : 30000;
  backendSyncTimerId = window.setInterval(() => {
    syncBackendData({ silent: true });
  }, intervalMs);
}

function createMeetingMemory(meetingResult = mockMeetingContent) {
  const time = pickTextValue(meetingResult.time, formatCurrentTime());
  const aiContent = pickTextValue(
    meetingResult.aiContent,
    pickTextValue(
      meetingResult.aiSummary,
      pickTextValue(meetingResult.summary, mockMeetingContent.summary)
    )
  );

  return {
    id: pickTextValue(meetingResult.id, `meeting-${Date.now()}`),
    type: "meeting",
    title: pickTextValue(meetingResult.title, "ESP32 会议整理结果"),
    rawContent: pickTextValue(meetingResult.rawContent, mockMeetingContent.rawContent),
    aiContent,
    keyPoints: normalizeMeetingList(meetingResult.keyPoints, mockMeetingContent.keyPoints),
    todos: normalizeMeetingList(meetingResult.todos, mockMeetingContent.todos),
    tag: normalizeMeetingList(meetingResult.tag || meetingResult.tags, mockMeetingContent.tags),
    time,
    location: pickTextValue(meetingResult.location, "演示现场"),
    source: pickTextValue(meetingResult.source, "ESP32 硬件采集"),
    importance: normalizeMeetingImportance(meetingResult.importance)
  };
}

function clearMeetingTimers() {
  meetingTimerIds.forEach((timerId) => window.clearTimeout(timerId));
  meetingTimerIds = [];
}

function setMeetingStatus(status) {
  const meta = meetingFlowSteps.find((step) => step.key === status);
  state.meeting.status = status;
  state.meeting.progress = meta?.progress || 0;
  render();
}

function setBackendStatus(status, detail = "") {
  state.meeting.backendStatus = status;
  state.meeting.backendDetail = detail;
  render();
}

async function reportEvent(event, detail) {
  try {
    const payload = {
      event,
      source: "android_app"
    };

    if (typeof detail === "string" && detail.trim().length > 0) {
      payload.detail = detail.trim().slice(0, 300);
    }

    await apiRequest("/api/log/event", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("Failed to report user activity", error);
  }
}

async function requestMeetingMock() {
  console.log("正在请求后端");
  void reportEvent("request_meeting_start");

  const result = await apiRequest(MEETING_MOCK_PATH, {
    method: "POST",
    body: JSON.stringify({})
  });
  console.log("后端请求成功");
  void reportEvent("request_meeting_success");
  return result;
}

function setDiagnosticOutput(status, output) {
  state.meeting.diagnostic = { status, output };
  render();
}

async function runDiagnosticRequest(label, url, options) {
  const lines = [`${label}: 请求中`];

  try {
    const response = await fetch(url, options);
    const text = await readResponseText(response);

    lines[0] = `${label}: ${response.ok ? "成功" : "失败"}`;
    lines.push(`status: ${response.status} ${response.statusText}`);

    if (text) {
      lines.push(`response: ${text}`);
    }
  } catch (error) {
    lines[0] = `${label}: 失败`;
    lines.push(formatErrorDetail(error));
  }

  return lines.join("\n");
}

async function runBackendDiagnostics() {
  if (state.meeting.diagnostic.status === "running") {
    return;
  }

  const currentApiBaseUrl = getApiBaseUrl();

  setDiagnosticOutput("running", `当前后端地址: ${currentApiBaseUrl}\n正在执行后端连接诊断...`);

  const lines = [`当前后端地址: ${currentApiBaseUrl}`, ""];

  lines.push(await runDiagnosticRequest("GET /api/status", buildApiUrl("/api/status"), {
    method: "GET"
  }));
  lines.push("");
  lines.push(await runDiagnosticRequest("POST /api/meeting/mock", buildApiUrl(MEETING_MOCK_PATH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  }));
  lines.push("");
  lines.push(await runDiagnosticRequest("GET /api/app/state", buildApiUrl(APP_STATE_PATH), {
    method: "GET",
    headers: {
      "X-ShunYi-Source": "android_app"
    }
  }));
  lines.push("");
  lines.push(await runDiagnosticRequest("POST /api/features/voice-transcribe", buildApiUrl("/api/features/voice-transcribe"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ShunYi-Source": "android_app"
    },
    body: JSON.stringify({})
  }));

  setDiagnosticOutput("complete", lines.join("\n"));
}

function completeMeetingRecord(meetingResult = mockMeetingContent) {
  const meetingMemory = createMeetingMemory(meetingResult);
  mockMemories.unshift(meetingMemory);
  state.meeting.status = "complete";
  state.meeting.progress = 100;
  state.meeting.resultId = meetingMemory.id;
  state.expandedId = meetingMemory.id;
  render();
  showToast("已保存到记忆舱");
}

async function startMeetingRecord() {
  void reportEvent("start_meeting_click");

  if (state.appState.paused) {
    showToast("当前已暂停，恢复运行后才能开始会议记录");
    return;
  }

  if (state.meeting.status === "hardware" || state.meeting.status === "ai") {
    return;
  }

  clearMeetingTimers();
  state.meeting.resultId = "";
  state.meeting.backendStatus = "connecting";
  state.meeting.backendDetail = "";
  setMeetingStatus("hardware");

  meetingTimerIds = [
    window.setTimeout(() => setMeetingStatus("ai"), 1300)
  ];

  let meetingResult;

  try {
    meetingResult = await requestMeetingMock();
    setBackendStatus("success");
  } catch (error) {
    console.log("后端请求失败，使用本地 mock");
    console.error(error);
    setBackendStatus("error", getBackendErrorMessage(error));
    void reportEvent("request_meeting_failed", getBackendErrorMessage(error));
    meetingResult = mockMeetingContent;
  }

  if (state.meeting.status === "hardware") {
    setMeetingStatus("ai");
  }

  meetingTimerIds.push(
    window.setTimeout(() => {
      completeMeetingRecord(meetingResult);
      clearMeetingTimers();
    }, 700)
  );
}

function getRunningText() {
  return state.appState.paused ? "已暂停" : "运行中";
}

function getOnOffText(value) {
  return value ? "已开启" : "已关闭";
}

function getFeatureAction(title) {
  return {
    语音转写: "voice-transcribe",
    "AI 修正": "ai-polish",
    自动归档: "archive",
    隐私控制: "privacy"
  }[title] || "";
}

function getPrivacyAction(title) {
  return {
    一键暂停: "pause",
    本地加密: "encryption",
    片段删除: "delete",
    低耗模式: "low-power"
  }[title] || "";
}

function renderSyncNotice() {
  if (!state.backendOffline && !state.syncMessage) {
    return "";
  }

  return `
    <div class="sync-notice ${state.backendOffline ? "is-offline" : ""}" role="status">
      ${escapeHtml(state.syncMessage || "已连接后端")}
    </div>
  `;
}

function renderStateStrip() {
  return `
    <section class="app-state-strip" aria-label="后端状态同步">
      <div>
        <span>采集状态</span>
        <strong>${escapeHtml(getRunningText())}</strong>
      </div>
      <div>
        <span>本地加密</span>
        <strong>${escapeHtml(getOnOffText(state.appState.encryptionEnabled))}</strong>
      </div>
      <div>
        <span>低耗模式</span>
        <strong>${escapeHtml(getOnOffText(state.appState.lowPowerMode))}</strong>
      </div>
      <div>
        <span>隐私模式</span>
        <strong>${escapeHtml(getOnOffText(state.appState.privacyMode))}</strong>
      </div>
    </section>
  `;
}

function renderFeaturePanel() {
  if (state.activePanel === "voice") {
    return renderVoicePanel();
  }

  if (state.activePanel === "ai-polish") {
    return renderAiPolishPanel();
  }

  if (state.activePanel === "archive") {
    return renderArchivePanel();
  }

  if (state.activePanel === "privacy") {
    return renderPrivacyPanel();
  }

  if (state.activePanel === "delete") {
    return renderDeletePanel();
  }

  return "";
}

function renderPanelShell(title, body) {
  return `
    <section class="feature-panel" data-feature-panel>
      <div class="feature-panel-head">
        <h3>${escapeHtml(title)}</h3>
        <button class="panel-close" type="button" data-close-panel aria-label="关闭">x</button>
      </div>
      ${body}
    </section>
  `;
}

function renderVoicePanel() {
  const isRunning = state.featureStatus.voice === "running";
  const memory = state.voiceResult;
  const body = `
    <div class="panel-actions">
      <button class="primary-inline" type="button" data-run-voice ${isRunning ? "disabled" : ""}>
        ${isRunning ? "正在请求后端" : "生成语音转写记录"}
      </button>
    </div>
    ${memory ? `
      <div class="result-block">
        <span class="content-label">后端返回 memory</span>
        <strong>${escapeHtml(memory.title)}</strong>
        <p>ID：${escapeHtml(memory.id)}</p>
        <p>${escapeHtml(memory.rawContent)}</p>
      </div>
      <div class="result-block result-block-strong">
        <span class="content-label">AI 摘要</span>
        <p>${escapeHtml(memory.aiContent)}</p>
      </div>
      <div class="tag-row">
        ${memory.tag.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
      </div>
    ` : `<p class="panel-muted">点击后会请求 /api/features/voice-transcribe，并由后端保存记忆。</p>`}
    ${renderRequestDebug("voice")}
  `;

  return renderPanelShell("语音转写", body);
}

function renderAiPolishMemory() {
  const memory = state.aiPolish.memory;

  if (!memory) {
    return "";
  }

  return `
    <div class="result-block">
      <span class="content-label">保存的 memory</span>
      <strong>${escapeHtml(memory.title)}</strong>
      <p>ID：${escapeHtml(memory.id)}</p>
      <p>${escapeHtml(memory.aiContent)}</p>
      <div class="tag-row">
        ${memory.tag.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderAiPolishPanel() {
  const isRunning = state.aiPolish.status === "running";
  const body = `
    <label class="panel-label" for="ai-polish-input">待修正文本</label>
    <textarea id="ai-polish-input" class="panel-textarea" data-ai-polish-input>${escapeHtml(state.aiPolish.text)}</textarea>
    <div class="panel-actions">
      <button class="primary-inline" type="button" data-run-ai-polish ${isRunning ? "disabled" : ""}>
        ${isRunning ? "正在修正" : "开始修正"}
      </button>
    </div>
    ${state.aiPolish.after ? `
      <div class="result-grid">
        <div class="result-block">
          <span class="content-label">修正前</span>
          <p>${escapeHtml(state.aiPolish.before)}</p>
        </div>
        <div class="result-block result-block-strong">
          <span class="content-label">修正后</span>
          <p>${escapeHtml(state.aiPolish.after)}</p>
        </div>
      </div>
      ${renderAiPolishMemory()}
    ` : ""}
    ${renderRequestDebug("ai-polish")}
  `;

  return renderPanelShell("AI 修正", body);
}

function renderArchivePanel() {
  const isRunning = state.featureStatus.archive === "running";
  const categories = state.archiveResult?.categories || {};
  const body = `
    <div class="panel-actions">
      <button class="primary-inline" type="button" data-run-archive ${isRunning ? "disabled" : ""}>
        ${isRunning ? "正在归档" : "执行自动归档"}
      </button>
    </div>
    ${state.archiveResult ? `
      <div class="archive-result-grid">
        <div class="result-block">
          <span class="content-label">归档数量</span>
          <strong>${state.archiveResult.archivedCount} 条</strong>
        </div>
        ${Object.entries(categories).map(([name, count]) => `
          <div class="result-block">
            <span class="content-label">${escapeHtml(name)}</span>
            <strong>${count} 条</strong>
          </div>
        `).join("")}
      </div>
    ` : `<p class="panel-muted">后端会按规则写入 archived 与 category，不调用大模型。</p>`}
    ${renderRequestDebug("archive")}
  `;

  return renderPanelShell("自动归档", body);
}

function renderPrivacyPanel() {
  const body = `
    <div class="privacy-state-list">
      ${renderSwitchRow("暂停采集", "pause", state.appState.paused)}
      ${renderSwitchRow("本地加密", "encryption", state.appState.encryptionEnabled)}
      ${renderSwitchRow("低耗模式", "lowPower", state.appState.lowPowerMode)}
      ${renderSwitchRow("隐私模式", "privacyMode", state.appState.privacyMode, true)}
    </div>
    <p class="panel-muted">状态来自 GET /api/app/state。当前不申请麦克风、剪贴板、蓝牙、定位或后台录音权限。</p>
    ${renderRequestDebug("privacy")}
  `;

  return renderPanelShell("隐私控制", body);
}

function renderSwitchRow(label, setting, enabled, readonly = false) {
  return `
    <div class="switch-row">
      <div>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(getOnOffText(enabled))}</span>
      </div>
      <button class="switch-button ${enabled ? "is-on" : ""}" type="button" ${readonly ? "disabled" : `data-toggle-setting="${setting}"`}>
        <span></span>
      </button>
    </div>
  `;
}

function renderBackendServiceSettings() {
  return `
    <section class="light-card backend-config-card">
      <div class="backend-config-head">
        <div>
          <h3>后端服务设置</h3>
          <p>当前后端地址可在 APP 内修改，无需重新打包安装。</p>
        </div>
        <span class="mini-chip">动态配置</span>
      </div>
      <div class="backend-config-current">
        <span>当前后端</span>
        <code>${escapeHtml(state.backendConfig.current)}</code>
      </div>
      <label class="panel-label" for="backend-url-input">请输入后端地址</label>
      <input
        id="backend-url-input"
        class="backend-config-input"
        type="url"
        inputmode="url"
        autocomplete="off"
        spellcheck="false"
        value="${escapeHtml(state.backendConfig.input)}"
        data-backend-url-input
        placeholder="${escapeHtml(DEFAULT_API_BASE_URL)}"
      />
      <div class="backend-config-actions">
        <button class="primary-inline" type="button" data-backend-save>保存</button>
        <button class="secondary-inline" type="button" data-backend-connection-test ${state.backendConfig.testing ? "disabled" : ""}>
          ${state.backendConfig.testing ? "测试中" : "测试连接"}
        </button>
        <button class="secondary-inline" type="button" data-backend-reset>恢复默认</button>
      </div>
      ${renderRequestDebug("backend-config")}
    </section>
  `;
}

async function saveBackendBaseUrl() {
  try {
    const normalized = validateApiBaseUrl(state.backendConfig.input);
    setApiBaseUrl(normalized);
    state.backendConfig.current = normalized;
    state.backendConfig.input = normalized;
    state.backendOffline = false;
    state.syncMessage = "";
    showToast("后端地址已保存");
    render();
    await syncBackendData({ silent: true });
  } catch (error) {
    setRequestDebug("backend-config", {
      url: getBackendConfigCandidateUrl(),
      status: "请求失败",
      errorName: "ValidationError",
      errorMessage: error.message,
      result: ""
    });
    window.alert?.([
      "后端地址保存失败",
      `error.name：ValidationError`,
      `error.message：${error.message}`
    ].join("\n"));
    showToast(`后端地址无效：${error.message}`);
    render();
  }
}

async function testBackendBaseUrl() {
  let normalized = "";

  try {
    normalized = validateApiBaseUrl(state.backendConfig.input);
  } catch (error) {
    setRequestDebug("backend-config", {
      url: getBackendConfigCandidateUrl(),
      status: "请求失败",
      errorName: "ValidationError",
      errorMessage: error.message,
      result: ""
    });
    window.alert?.([
      "后端连接失败",
      `接口：${getBackendConfigCandidateUrl()}/api/status`,
      `error.name：ValidationError`,
      `error.message：${error.message}`
    ].join("\n"));
    showToast(`后端连接失败：${error.message}`);
    render();
    return;
  }

  state.backendConfig.testing = true;
  startRequestDebug("backend-config", "/api/status", normalized);
  render();

  try {
    const payload = await apiRequest("/api/status", {
      method: "GET",
      baseUrl: normalized
    });
    completeRequestDebug("backend-config", payload);
    window.alert?.([
      "后端连接成功",
      `service：${payload.service || ""}`,
      `message：${payload.message || ""}`,
      `aiMode：${payload.aiMode || ""}`,
      `esp32Status：${payload.esp32Status || ""}`
    ].join("\n"));
    showToast("后端连接成功");
  } catch (error) {
    notifyRequestFailure("后端连接", "backend-config", error);
  } finally {
    state.backendConfig.testing = false;
    render();
  }
}

function restoreDefaultBackendBaseUrl() {
  resetApiBaseUrl();
  state.backendConfig.current = DEFAULT_API_BASE_URL;
  state.backendConfig.input = DEFAULT_API_BASE_URL;
  state.backendOffline = false;
  state.syncMessage = "";
  setRequestDebug("backend-config", {
    url: DEFAULT_API_BASE_URL,
    status: "已恢复默认",
    errorName: "",
    errorMessage: "",
    result: `currentBaseUrl: ${DEFAULT_API_BASE_URL}`
  });
  showToast("已恢复默认后端地址");
  render();
  void syncBackendData({ silent: true });
}

function renderDeletePanel() {
  const isRunning = state.featureStatus.delete === "running";
  const list = state.deleteListLoaded ? state.deleteMemories : mockMemories;
  const body = `
    <div class="panel-actions">
      <button class="secondary-inline" type="button" data-load-delete-list ${isRunning ? "disabled" : ""}>
        ${isRunning ? "正在同步列表" : "同步后端记忆列表"}
      </button>
    </div>
    <div class="delete-list">
      ${list.length === 0 ? `<p class="panel-muted">后端暂无可删除记忆。</p>` : list.map((memory) => `
        <article class="delete-row">
          <div>
            <strong>${escapeHtml(memory.title)}</strong>
            <span>${escapeHtml(memory.time)} · ${escapeHtml(memory.category || memory.tag?.[0] || "未分类")}</span>
          </div>
          <button class="danger-inline" type="button" data-delete-memory="${escapeHtml(memory.id)}">删除</button>
        </article>
      `).join("")}
    </div>
    ${renderRequestDebug("delete")}
  `;

  return renderPanelShell("片段删除", body);
}

async function handleVoiceTranscribe() {
  const path = "/api/features/voice-transcribe";
  state.activePanel = "voice";
  state.featureStatus.voice = "running";
  startRequestDebug("voice", path);
  render();

  try {
    const payload = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({})
    });
    const memory = upsertMemoryFromBackend(payload.memory);
    state.voiceResult = memory;
    state.featureStatus.voice = "complete";
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("voice", payload);
    window.alert?.("请求成功：语音转写记录已保存");
    showToast("语音转写记录已保存");
  } catch (error) {
    state.featureStatus.voice = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("语音转写", "voice", error);
  }

  render();
}

async function handleAiPolish() {
  const path = "/api/features/ai-polish";
  state.activePanel = "ai-polish";
  state.aiPolish.status = "running";
  startRequestDebug("ai-polish", path);
  render();

  try {
    const payload = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({ text: state.aiPolish.text })
    });
    const memory = upsertMemoryFromBackend(payload.memory);
    state.aiPolish.before = payload.before;
    state.aiPolish.after = payload.after;
    state.aiPolish.memory = memory;
    state.aiPolish.status = "complete";
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("ai-polish", payload);
    window.alert?.("请求成功：AI 修正结果已保存");
    showToast("AI 修正结果已保存");
  } catch (error) {
    state.aiPolish.status = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("AI 修正", "ai-polish", error);
  }

  render();
}

async function handleArchiveMemories() {
  const path = "/api/memories/archive";
  state.activePanel = "archive";
  state.featureStatus.archive = "running";
  startRequestDebug("archive", path);
  render();

  try {
    const payload = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({})
    });
    state.archiveResult = payload;
    setMemoriesFromBackend(payload.memories);
    state.featureStatus.archive = "complete";
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("archive", payload);
    window.alert?.("请求成功：自动归档完成");
    showToast("自动归档完成");
  } catch (error) {
    state.featureStatus.archive = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("自动归档", "archive", error);
  }

  render();
}

async function openPrivacyPanel() {
  state.activePanel = "privacy";
  startRequestDebug("privacy", APP_STATE_PATH);
  render();

  try {
    const nextState = await loadAppState({ silent: true });
    completeRequestDebug("privacy", nextState);
  } catch (error) {
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("隐私状态同步", "privacy", error);
  }

  render();
}

async function toggleSetting(setting) {
  const settingConfig = {
    pause: {
      field: "paused",
      endpoint: settingEndpointMap.pause,
      on: "已暂停",
      off: "运行中",
      toastOn: "一键暂停已开启",
      toastOff: "一键暂停已关闭"
    },
    encryption: {
      field: "encryptionEnabled",
      endpoint: settingEndpointMap.encryption,
      on: "本地加密已开启",
      off: "本地加密已关闭",
      toastOn: "本地加密已开启",
      toastOff: "本地加密已关闭"
    },
    lowPower: {
      field: "lowPowerMode",
      endpoint: settingEndpointMap.lowPower,
      on: "低耗模式已开启",
      off: "低耗模式已关闭",
      toastOn: "低耗模式已开启",
      toastOff: "低耗模式已关闭"
    }
  }[setting];

  if (!settingConfig) {
    return;
  }

  const enabled = !state.appState[settingConfig.field];
  state.activePanel = "privacy";
  startRequestDebug("privacy", settingConfig.endpoint);
  render();

  try {
    const payload = await apiRequest(settingConfig.endpoint, {
      method: "POST",
      body: JSON.stringify({ enabled })
    });
    setAppState(payload.state);
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("privacy", payload);
    window.alert?.(`请求成功：${enabled ? settingConfig.toastOn : settingConfig.toastOff}`);
    showToast(enabled ? settingConfig.toastOn : settingConfig.toastOff);
  } catch (error) {
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("状态更新", "privacy", error);
  }

  render();
}

async function openDeletePanel() {
  state.activePanel = "delete";
  await loadDeleteList();
}

async function loadDeleteList() {
  const path = MEMORIES_PATH;
  state.featureStatus.delete = "running";
  state.deleteListLoaded = false;
  startRequestDebug("delete", path);
  render();

  try {
    const payload = await apiRequest(path);
    const memories = Array.isArray(payload.memories) ? payload.memories.map(normalizeBackendMemory) : [];
    state.deleteMemories = memories;
    state.deleteListLoaded = true;
    setMemoriesFromBackend(payload.memories);
    state.featureStatus.delete = "complete";
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("delete", payload);
  } catch (error) {
    state.featureStatus.delete = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("记忆列表同步", "delete", error);
  }

  render();
}

async function deleteMemory(id) {
  const path = `${MEMORIES_PATH}/${encodeURIComponent(id)}`;
  startRequestDebug("delete", path);
  render();

  try {
    const payload = await apiRequest(path, {
      method: "DELETE"
    });
    const index = mockMemories.findIndex((memory) => memory.id === id);
    if (index >= 0) {
      mockMemories.splice(index, 1);
    }
    state.deleteMemories = state.deleteMemories.filter((memory) => memory.id !== id);
    if (state.expandedId === id) {
      state.expandedId = mockMemories[0]?.id || "";
    }
    completeRequestDebug("delete", payload);
    window.alert?.("请求成功：片段已删除");
    showToast("片段已删除");
  } catch (error) {
    notifyRequestFailure("片段删除", "delete", error);
  }

  render();
}

function render() {
  syncBackendConfigState();

  if (state.tab === "capsule") {
    app.innerHTML = renderCapsule();
    bindSearchInput();
  } else if (state.tab === "profile") {
    app.innerHTML = renderProfile();
  } else {
    app.innerHTML = renderHome();
  }

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.tab);
  });
}

function renderHome() {
  const focusMemories = mockMemories.slice(0, 4).map(renderFocusCard).join("");
  const archivedCount = mockMemories.filter((memory) => memory.archived).length;

  return `
    <section class="page">
      ${renderSyncNotice()}
      <div class="top-row">
        <div class="brand-lockup">
          <div class="brand-mark" aria-label="瞬忆 AI 记忆标识">
            <svg class="brand-symbol" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M18 36c-5.2-1.4-8-4.5-8-9 0-6.1 5-10.8 11.2-10.8 2.8-5.1 8.2-8.2 14.1-8.2 9 0 16.3 7.3 16.3 16.3 4.1 1.7 6.4 5 6.4 9.4 0 6-4.7 10.3-11.1 10.3H38" />
              <path d="M20 44h18M24 36h24M24 52h20" />
              <circle cx="20" cy="44" r="3" />
              <circle cx="38" cy="44" r="3" />
              <circle cx="24" cy="36" r="3" />
              <circle cx="48" cy="36" r="3" />
              <circle cx="24" cy="52" r="3" />
              <circle cx="44" cy="52" r="3" />
            </svg>
          </div>
          <div class="brand-copy-compact">
            <span class="brand-subtitle">AI 碎片记忆</span>
          </div>
        </div>
      </div>

      <section class="hero-panel">
        <div class="hero-main">
          <div class="hero-copy">
            <h2>AI 正在整理你的今日记忆</h2>
            <p>语音、文字、剪贴板模拟、待办和灵感被自动修正、分类、归档，形成可搜索的个人记忆库。</p>
          </div>
          <div class="memory-core" aria-hidden="true"><span>96%</span></div>
        </div>

        <div class="status-grid" aria-label="今日记忆状态">
          <div class="metric-tile">
            <span class="metric-value">${mockMemories.length}</span>
            <span class="metric-label">今日有效记忆</span>
          </div>
          <div class="metric-tile">
            <span class="metric-value">${archivedCount}</span>
            <span class="metric-label">自动归档</span>
          </div>
          <div class="metric-tile">
            <span class="metric-value">A+</span>
            <span class="metric-label">AI 修正质量</span>
          </div>
        </div>
      </section>

      ${renderStateStrip()}

      ${renderMeetingRecorder()}

      <div class="section-head">
        <div>
          <h2>功能入口</h2>
          <p class="section-kicker">点击后请求 Node.js 后端保存真实状态和记忆</p>
        </div>
      </div>

      <div class="feature-grid">
        ${renderFeature("mic", "语音转写", "模拟语音碎片整理")}
        ${renderFeature("spark", "AI 修正", "口语化内容变清晰")}
        ${renderFeature("archive", "自动归档", "按主题生成长期记忆")}
        ${renderFeature("shield", "隐私控制", "暂停、加密、删除入口")}
      </div>

      ${renderFeaturePanel()}

      <div class="section-head">
        <div>
          <h2>AI 修正展示</h2>
          <p class="section-kicker">原始碎片转化为清晰记忆</p>
        </div>
        <span class="mini-chip">实时预览</span>
      </div>

      ${renderAiFixCard()}

      <div class="section-head">
        <div>
          <h2>今日重点记忆</h2>
          <p class="section-kicker">按重要程度与答辩关联度排序</p>
        </div>
        <span class="mini-chip">${mockMemories.length} 条</span>
      </div>

      <div class="focus-list">
        ${focusMemories}
      </div>
    </section>
  `;
}

function renderMeetingRecorder() {
  const meta = getMeetingStatusMeta();
  const activeIndex = getMeetingStepIndex(state.meeting.status);
  const isRunning = state.meeting.status === "hardware" || state.meeting.status === "ai";
  const isComplete = state.meeting.status === "complete";
  const isPaused = state.appState.paused;
  const result = isComplete ? mockMemories.find((item) => item.id === state.meeting.resultId) : null;
  const buttonText = isPaused
    ? "当前已暂停"
    : isRunning
      ? "会议记录进行中"
      : isComplete
        ? "再次模拟会议记录"
        : "开始会议记录";

  return `
    <section class="meeting-recorder ${isRunning ? "is-running" : ""} ${isComplete ? "is-complete" : ""}" aria-label="会议记录模拟流程">
      <div class="meeting-recorder-head">
        <div>
          <span class="source-pill">Mock 流程 · 不调用真实麦克风</span>
          <h2>会议记录模拟</h2>
          <p>${escapeHtml(meta.desc)}</p>
        </div>
        <div class="meeting-orb" aria-hidden="true">
          <span>${state.meeting.progress || 0}%</span>
        </div>
      </div>

      <button class="meeting-start-btn" type="button" data-meeting-start ${isRunning ? "disabled" : ""}>
        <span class="meeting-start-icon">${icon("cpu")}</span>
        <span>
          <strong>${escapeHtml(buttonText)}</strong>
          <small>${isPaused ? "点击会提示恢复运行" : isRunning ? escapeHtml(meta.title) : "ESP32 测试文本 + mock AI 整理"}</small>
        </span>
      </button>

      ${renderBackendStatus()}
      ${renderBackendDiagnostic()}

      <div class="meeting-progress" aria-label="会议记录进度">
        <span style="width: ${state.meeting.progress}%"></span>
      </div>

      <div class="meeting-flow">
        ${meetingFlowSteps.map((step, index) => {
          const isStepActive = step.key === state.meeting.status;
          const isStepDone = activeIndex > index || state.meeting.status === "complete";
          return `
            <div class="meeting-step ${isStepActive ? "is-active" : ""} ${isStepDone ? "is-done" : ""}">
              <span class="meeting-step-dot" aria-hidden="true"></span>
              <strong>${escapeHtml(step.title)}</strong>
              <small>${escapeHtml(step.desc)}</small>
            </div>
          `;
        }).join("")}
      </div>

      ${result ? `
        <div class="meeting-result-preview">
          <div>
            <span class="content-label">最新会议结果</span>
            <strong>${escapeHtml(result.title)}</strong>
            <p>${escapeHtml(result.aiContent)}</p>
          </div>
          <div class="tag-row">
            ${result.tag.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="meeting-result-meta">
            <span>来源：${escapeHtml(result.source)}</span>
            <span>时间：${escapeHtml(result.time)}</span>
            <span>评分：${formatImportance(result.importance)}/10</span>
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderBackendDiagnostic() {
  const diagnostic = state.meeting.diagnostic;
  const isRunning = diagnostic.status === "running";

  return `
    <div class="backend-diagnostic">
      <button class="backend-test-btn" type="button" data-backend-test ${isRunning ? "disabled" : ""}>
        ${isRunning ? "正在测试后端连接" : "测试后端连接"}
      </button>
      ${diagnostic.output ? `<pre class="backend-diagnostic-output">${escapeHtml(diagnostic.output)}</pre>` : ""}
    </div>
  `;
}

function renderBackendStatus() {
  const status = state.meeting.backendStatus;

  if (status === "idle") {
    return "";
  }

  const statusText = {
    connecting: "正在连接后端服务",
    success: "后端服务已连接",
    error: "后端连接失败，已使用本地演示数据"
  }[status];

  return `
    <div class="backend-status backend-status-${escapeHtml(status)}" role="status" aria-live="polite">
      <span class="backend-status-dot" aria-hidden="true"></span>
      <div>
        <strong>${escapeHtml(statusText)}</strong>
        ${state.meeting.backendDetail ? `<small>${escapeHtml(state.meeting.backendDetail)}</small>` : ""}
      </div>
    </div>
  `;
}

function renderAiFixCard() {
  const item = mockMemories.find((memory) => memory.id === aiFixPreview.memoryId) || mockMemories[0];

  if (!item) {
    return `
      <article class="ai-fix-card">
        <div class="empty-state">暂无后端记忆。点击“语音转写”或“AI 修正”后会保存真实数据。</div>
      </article>
    `;
  }

  return `
    <article class="ai-fix-card">
      <div class="ai-fix-head">
        <div>
          <span class="source-pill">AI 修正 · ${escapeHtml(item.title)}</span>
          <h3>从碎片到长期记忆</h3>
        </div>
        <span class="score-pill">${escapeHtml(aiFixPreview.score)}</span>
      </div>

      <div class="fix-flow">
        <div class="fix-block">
          <span class="content-label">原始碎片</span>
          <p>${escapeHtml(item.rawContent)}</p>
        </div>
        <div class="fix-arrow" aria-hidden="true">
          <svg class="flow-icon" viewBox="0 0 36 24">
            <path d="M7 12h18" />
            <path d="m20 7 5 5-5 5" />
            <circle cx="8" cy="12" r="2.5" />
          </svg>
        </div>
        <div class="fix-block fix-block-ai">
          <span class="content-label">AI 修正后内容</span>
          <p>${escapeHtml(item.aiContent)}</p>
        </div>
      </div>

      <div class="quality-strip">
        <span>自动标签</span>
        <div>
          ${item.tag.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>

      <div class="tag-row">
        ${aiFixPreview.actions.map((action) => `<span class="tag-pill">${escapeHtml(action)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderFeature(iconName, title, desc) {
  const action = getFeatureAction(title);
  return `
    <button class="feature-card" type="button" data-feature="${escapeHtml(action)}">
      <span class="feature-icon">${icon(iconName)}</span>
      <span>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(desc)}</span>
      </span>
    </button>
  `;
}

function renderFocusCard(item) {
  const config = typeConfig[item.type] || typeConfig.text;
  return `
    <article class="focus-card">
      <span class="list-icon">${icon(config.icon)}</span>
      <div>
        <span class="source-pill">${escapeHtml(config.label)} · ${escapeHtml(config.tone)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="focus-meta">
          <span>${escapeHtml(item.time)}</span>
          <span>${escapeHtml(item.location)}</span>
        </div>
        <p class="ai-summary">${escapeHtml(item.aiContent)}</p>
      </div>
    </article>
  `;
}

function renderCapsule() {
  const results = getFilteredMemories();

  return `
    <section class="page">
      ${renderSyncNotice()}
      <div class="top-row">
        <div>
          <h1 class="brand-title">记忆舱</h1>
          <span class="brand-subtitle">AI 修正前后对比、自动归档、时间线回溯</span>
        </div>
        <span class="mode-chip">${state.appState.paused ? "已暂停" : "后端同步"}</span>
      </div>

      <label class="search-box" for="memory-search">
        ${icon("search", "search-icon")}
        <input id="memory-search" type="search" value="${escapeHtml(state.query)}" placeholder="搜索记忆、地点、标签、归档线索" autocomplete="off" />
      </label>

      <div class="filter-row" role="tablist" aria-label="记忆标签筛选">
        ${renderFilter("all", "全部")}
        ${renderFilter("voice", "语音")}
        ${renderFilter("text", "文字")}
        ${renderFilter("clipboard", "剪贴板")}
        ${renderFilter("todo", "待办")}
        ${renderFilter("idea", "灵感")}
        ${renderFilter("meeting", "会议")}
      </div>

      ${renderCapsuleHighlights()}

      <section class="glass-card processor-card">
        <div class="processor-title">
          <h2>AI 实时处理台</h2>
          <span class="mini-chip">演示采集</span>
        </div>
        <div class="processing-flow">
          ${renderProcess("转写中", "语音碎片 1 条")}
          ${renderProcess("修正中", "前后对比 5 条")}
          ${renderProcess("归档中", "分类回溯 5 条")}
        </div>
      </section>

      <div class="section-head">
        <div>
          <h2>分类统计</h2>
          <p class="section-kicker">AI 自动分类分布</p>
        </div>
      </div>

      <div class="category-grid">
        ${getCategoryStats().map((item) => `
          <div class="category-tile">
            <strong>${item.count}</strong>
            <span>${escapeHtml(item.name)}</span>
          </div>
        `).join("")}
      </div>

      <div class="memory-list-head">
        <div>
          <h2>记忆列表</h2>
          <p>点击卡片查看完整回溯链路</p>
        </div>
        <span class="mini-chip" id="memory-count">${results.length} 条</span>
      </div>

      <div class="memory-list" id="memory-list">
        ${renderMemoryList(results)}
      </div>
    </section>
  `;
}

function renderCapsuleHighlights() {
  const archivedCount = mockMemories.filter((memory) => memory.archived).length;
  const highlights = [
    { title: "AI 修正前", value: `${mockMemories.length} 条`, desc: "后端记忆总数" },
    { title: "AI 修正后", value: state.aiPolish.after ? "已生成" : "待处理", desc: "最近修正结果" },
    { title: "自动归档", value: `${archivedCount} 条`, desc: "写入 category" },
    { title: "可回溯", value: state.backendOffline ? "本地" : "后端", desc: "来源可查" }
  ];

  return `
    <section class="capsule-overview" aria-label="记忆舱核心能力">
      ${highlights.map((item) => `
        <div class="capsule-signal">
          <span>${escapeHtml(item.title)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <small>${escapeHtml(item.desc)}</small>
        </div>
      `).join("")}
    </section>
  `;
}

function renderFilter(value, label) {
  const active = state.filter === value ? " is-active" : "";
  return `<button class="filter-chip${active}" type="button" role="tab" aria-selected="${state.filter === value}" data-filter="${value}">${escapeHtml(label)}</button>`;
}

function renderProcess(title, desc) {
  return `
    <div class="process-step">
      <span class="step-light" aria-hidden="true"></span>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(desc)}</span>
    </div>
  `;
}

function renderMemoryList(list = getFilteredMemories()) {
  if (!list.length) {
    return `<div class="empty-state">暂无后端记忆。后端离线时会保留本地兜底数据。</div>`;
  }

  return list.map(renderMemoryCard).join("");
}

function getCategoryStats() {
  if (mockMemories.length === 0) {
    return [];
  }

  const counts = new Map();
  mockMemories.forEach((memory) => {
    const tags = memory.category ? [memory.category, ...memory.tag] : memory.tag;
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });

  const preferred = ["会议", "开发", "硬件", "灵感", "生活", "ESP32", "AI 整理", "项目答辩", "待办", "学习", "剪贴板", "UI 优化"];
  const preferredStats = preferred
    .filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name) }));
  const fallbackStats = categoryStats.filter((item) => !preferredStats.some((stat) => stat.name === item.name));

  return [...preferredStats, ...fallbackStats].slice(0, 6);
}

function renderMemoryCard(item) {
  const config = typeConfig[item.type] || typeConfig.text;
  const isOpen = state.expandedId === item.id;
  const source = item.source || config.label;
  const category = item.category || item.tag[0] || "未分类";
  const beforeLabel = item.type === "meeting" ? "原始识别文本" : "AI 修正前 · 原始碎片";
  const afterLabel = item.type === "meeting" ? "AI 摘要" : "AI 修正后 · 清晰记忆";
  return `
    <article class="memory-card${isOpen ? " is-open" : ""}" data-memory-id="${escapeHtml(item.id)}">
      <div class="memory-card-head">
        <div>
          <span class="source-pill">${escapeHtml(config.label)} · ${escapeHtml(config.tone)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(item.time)}</span>
            <span>${escapeHtml(item.location)}</span>
          </div>
        </div>
        <span class="score-pill">${formatImportance(item.importance)}</span>
      </div>

      <div class="memory-compare">
        <div class="content-block before-block">
          <span class="content-label">${escapeHtml(beforeLabel)}</span>
          <p>${escapeHtml(item.rawContent)}</p>
        </div>
        <div class="compare-arrow" aria-hidden="true">
          <svg class="flow-icon" viewBox="0 0 36 24">
            <path d="M7 12h18" />
            <path d="m20 7 5 5-5 5" />
            <circle cx="8" cy="12" r="2.5" />
          </svg>
        </div>
        <div class="content-block after-block">
          <span class="content-label">${escapeHtml(afterLabel)}</span>
          <p>${escapeHtml(item.aiContent)}</p>
        </div>
      </div>

      <div class="tag-row" aria-label="自动标签">
        ${item.tag.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
      </div>

      <div class="archive-strip" aria-label="自动分类和归档状态">
        <span>自动分类：${escapeHtml(category)}</span>
        <span>自动归档：${item.archived ? "长期记忆" : "待归档"}</span>
        <span>来源：${escapeHtml(source)}</span>
        <span>可回溯：${escapeHtml(item.time)} · ${escapeHtml(item.location)}</span>
      </div>

      ${renderMemoryDetail(item, config, source)}
    </article>
  `;
}

function renderMemoryDetail(item, config, source) {
  if (item.type === "meeting") {
    return `
      <div class="detail-panel">
        <div class="meeting-detail-grid">
          <section>
            <span class="content-label">会议重点</span>
            <ul>
              ${item.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
          </section>
          <section>
            <span class="content-label">待办事项</span>
            <ul>
              ${item.todos.map((todo) => `<li>${escapeHtml(todo)}</li>`).join("")}
            </ul>
          </section>
        </div>
        <div class="trace-line">
          <span>来源：${escapeHtml(source)}</span>
          <span>时间：${escapeHtml(item.time)}</span>
          <span>重要程度：${formatImportance(item.importance)}/10</span>
          <span>自动标签：${item.tag.map(escapeHtml).join("、")}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="detail-panel">
      <p>完整内容：${escapeHtml(item.aiContent)} 该片段已进入 ${escapeHtml(item.category || item.tag[0] || "未分类")} 分类，状态为${item.archived ? "已归档" : "待归档"}。</p>
      <div class="trace-line">
        <span>来源：${escapeHtml(config.label)}</span>
        <span>时间：${escapeHtml(item.time)}</span>
      </div>
    </div>
  `;
}

function renderProfile() {
  const recentTimeline = timeline.slice(0, 3);

  return `
    <section class="page">
      ${renderSyncNotice()}
      <section class="light-card profile-card">
        <div class="profile-hero">
          <div class="avatar-mark">H</div>
          <div>
            <h1>演示用户</h1>
            <p>后端状态同步 · 隐私保护${state.appState.privacyMode ? "已开启" : "已关闭"}</p>
          </div>
        </div>

        <div class="profile-stats" aria-label="记忆资产统计">
          <div class="profile-stat">
            <strong>${mockMemories.length}</strong>
            <span>长期记忆</span>
          </div>
          <div class="profile-stat">
            <strong>${mockMemories.length}</strong>
            <span>今日记忆</span>
          </div>
          <div class="profile-stat">
            <strong>${escapeHtml(getRunningText())}</strong>
            <span>采集状态</span>
          </div>
        </div>
      </section>

      ${renderStateStrip()}

      <div class="section-head">
        <div>
          <h2>设备状态</h2>
          <p class="section-kicker">当前 Demo 仅展示连接状态</p>
        </div>
      </div>

      <section class="light-card device-card">
        ${renderDevice("phone", "手机 APP", state.backendOffline ? "离线兜底" : "在线", state.backendOffline ? "后端离线时使用本地数据" : "已连接 Node.js 后端")}
        ${renderDevice("cloud", "后端记忆服务", state.backendOffline ? "离线" : "同步中", "状态、记忆和行为日志由后端保存")}
      </section>

      <section class="light-card hardware-card">
        <span class="device-icon">${icon("cpu")}</span>
        <div>
          <h3>瞬忆硬件终端</h3>
          <p>未来扩展 / 暂未接入。当前不做蓝牙连接、录音或后台采集。</p>
        </div>
        <span class="status-pill muted-state">未来扩展</span>
      </section>

      <div class="section-head">
        <div>
          <h2>隐私控制</h2>
          <p class="section-kicker">仅展示基础控制，不触发系统权限</p>
        </div>
      </div>

      <div class="privacy-grid">
        ${renderPrivacy("pause", "一键暂停", state.appState.paused ? "已暂停" : "运行中")}
        ${renderPrivacy("lock", "本地加密", getOnOffText(state.appState.encryptionEnabled))}
        ${renderPrivacy("trash", "片段删除", "删除后端记忆")}
        ${renderPrivacy("leaf", "低耗模式", getOnOffText(state.appState.lowPowerMode))}
      </div>

      ${renderFeaturePanel()}

      <div class="section-head">
        <div>
          <h2>记忆时间线</h2>
          <p class="section-kicker">今日关键节点</p>
        </div>
      </div>

      <section class="light-card timeline-card">
        <div class="timeline-list">
          ${recentTimeline.map((item) => `
            <article class="timeline-item">
              <span class="timeline-dot">${escapeHtml(item.time.slice(0, 2))}</span>
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.time)} · ${escapeHtml(item.detail)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <div class="section-head">
        <div>
          <h2>设置</h2>
        </div>
      </div>

      ${renderBackendServiceSettings()}

      <section class="light-card settings-card">
        ${renderSetting("隐私与权限说明", "查看 Demo 的权限边界")}
        ${renderSetting("演示数据说明", "查看 mock 数据来源")}
      </section>
    </section>
  `;
}

function renderDevice(iconName, title, status, desc) {
  const muted = status.includes("未来") ? " muted-state" : "";
  return `
    <article class="device-row">
      <span class="device-icon">${icon(iconName)}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(desc)}</span>
      </div>
      <span class="status-pill${muted}">${escapeHtml(status)}</span>
    </article>
  `;
}

function renderPrivacy(iconName, title, desc) {
  const action = getPrivacyAction(title);
  return `
    <button class="privacy-action" type="button" data-privacy-action="${escapeHtml(action)}">
      <span class="privacy-icon">${icon(iconName)}</span>
      <span>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(desc)}</span>
      </span>
    </button>
  `;
}

function renderSetting(title, desc) {
  return `
    <button class="setting-item" type="button" data-demo="${escapeHtml(title)}">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(desc)}</span>
      </span>
      <span aria-hidden="true">›</span>
    </button>
  `;
}

function getFilteredMemories() {
  const query = state.query.trim().toLowerCase();
  return mockMemories.filter((item) => {
    const typeMatches = state.filter === "all" || item.type === state.filter;
    const searchText = [
      item.title,
      item.rawContent,
      item.aiContent,
      item.tag?.join(" ") || "",
      item.location,
      item.source || "",
      item.category || "",
      item.keyPoints?.join(" ") || "",
      item.todos?.join(" ") || ""
    ].join(" ").toLowerCase();
    return typeMatches && (!query || searchText.includes(query));
  });
}

function bindSearchInput() {
  const input = document.querySelector("#memory-search");
  if (input) {
    input.value = state.query;
  }
}

function updateMemoryResults() {
  const results = getFilteredMemories();
  const list = document.querySelector("#memory-list");
  const count = document.querySelector("#memory-count");
  if (list) {
    list.innerHTML = renderMemoryList(results);
  }
  if (count) {
    count.textContent = `${results.length} 条`;
  }
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1900);
}

function initSplashScreen() {
  if (!splashScreen) {
    return;
  }

  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const displayDuration = shouldReduceMotion ? 1000 : 3800;
  const exitDuration = shouldReduceMotion ? 180 : 520;
  let isClosed = false;

  const closeSplash = () => {
    if (isClosed) {
      return;
    }

    isClosed = true;
    splashScreen.classList.add("is-leaving");
    document.body.classList.add("splash-complete");
    window.setTimeout(() => splashScreen.remove(), exitDuration);
  };

  window.setTimeout(closeSplash, displayDuration);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.tab = button.dataset.tab;
    render();

    if (state.tab === "home") {
      syncBackendData({ silent: true });
    }
  });
});

app.addEventListener("click", (event) => {
  const meetingStartButton = event.target.closest("[data-meeting-start]");
  if (meetingStartButton) {
    startMeetingRecord();
    return;
  }

  const backendTestButton = event.target.closest("[data-backend-test]");
  if (backendTestButton) {
    runBackendDiagnostics();
    return;
  }

  const closePanelButton = event.target.closest("[data-close-panel]");
  if (closePanelButton) {
    state.activePanel = "";
    render();
    return;
  }

  const featureButton = event.target.closest("[data-feature]");
  if (featureButton) {
    const action = featureButton.dataset.feature;

    if (action === "voice-transcribe") {
      handleVoiceTranscribe();
      return;
    }

    if (action === "ai-polish") {
      state.activePanel = "ai-polish";
      render();
      return;
    }

    if (action === "archive") {
      handleArchiveMemories();
      return;
    }

    if (action === "privacy") {
      openPrivacyPanel();
      return;
    }
  }

  const privacyButton = event.target.closest("[data-privacy-action]");
  if (privacyButton) {
    const action = privacyButton.dataset.privacyAction;

    if (action === "pause") {
      toggleSetting("pause");
      return;
    }

    if (action === "encryption") {
      toggleSetting("encryption");
      return;
    }

    if (action === "low-power") {
      toggleSetting("lowPower");
      return;
    }

    if (action === "delete") {
      openDeletePanel();
      return;
    }
  }

  const settingToggle = event.target.closest("[data-toggle-setting]");
  if (settingToggle) {
    toggleSetting(settingToggle.dataset.toggleSetting);
    return;
  }

  const runVoiceButton = event.target.closest("[data-run-voice]");
  if (runVoiceButton) {
    handleVoiceTranscribe();
    return;
  }

  const runAiPolishButton = event.target.closest("[data-run-ai-polish]");
  if (runAiPolishButton) {
    handleAiPolish();
    return;
  }

  const runArchiveButton = event.target.closest("[data-run-archive]");
  if (runArchiveButton) {
    handleArchiveMemories();
    return;
  }

  const loadDeleteListButton = event.target.closest("[data-load-delete-list]");
  if (loadDeleteListButton) {
    loadDeleteList();
    return;
  }

  const deleteMemoryButton = event.target.closest("[data-delete-memory]");
  if (deleteMemoryButton) {
    deleteMemory(deleteMemoryButton.dataset.deleteMemory);
    return;
  }

  const saveBackendButton = event.target.closest("[data-backend-save]");
  if (saveBackendButton) {
    saveBackendBaseUrl();
    return;
  }

  const testBackendButton = event.target.closest("[data-backend-connection-test]");
  if (testBackendButton) {
    testBackendBaseUrl();
    return;
  }

  const resetBackendButton = event.target.closest("[data-backend-reset]");
  if (resetBackendButton) {
    restoreDefaultBackendBaseUrl();
    return;
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    render();
    return;
  }

  const memoryCard = event.target.closest("[data-memory-id]");
  if (memoryCard) {
    const id = memoryCard.dataset.memoryId;
    state.expandedId = state.expandedId === id ? "" : id;
    updateMemoryResults();
    return;
  }

  const demoButton = event.target.closest("[data-demo]");
  if (demoButton) {
    showToast(`${demoButton.dataset.demo}：当前为前端演示，不触发真实系统权限。`);
  }
});

app.addEventListener("input", (event) => {
  if (event.target.id === "memory-search") {
    state.query = event.target.value;
    updateMemoryResults();
  }

  if (event.target.matches("[data-ai-polish-input]")) {
    state.aiPolish.text = event.target.value;
  }

  if (event.target.matches("[data-backend-url-input]")) {
    state.backendConfig.input = event.target.value;
  }
});

render();
initSplashScreen();
scheduleBackendSync();
syncBackendData({ silent: true });
