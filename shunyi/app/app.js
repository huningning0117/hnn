const DEFAULT_API_BASE_URL = "http://10.67.191.156:3000";
const API_BASE_URL_STORAGE_KEY = "shunyi_api_base_url";
const MEETING_MOCK_PATH = "/api/meeting/mock";
const APP_STATE_PATH = "/api/app/state";
const MEMORIES_PATH = "/api/memories";
const DEFAULT_AI_POLISH_TEXT = "那个今天就是我们要弄一下那个 APP，然后硬件那边也要接一下。";

const settingEndpointMap = {
  pause: "/api/settings/pause"
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
  detailMemoryId: "",
  backendOffline: false,
  syncMessage: "",
  activePanel: "",
  appState: {
    paused: false,
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
  pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>',
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

const feedbackState = {
  modalRoot: null,
  modalTimer: 0,
  toastRoot: null,
  toastId: 0,
  activeType: ""
};

const feedbackIconPaths = {
  success: '<path d="m5 12.4 4.2 4.1L19.5 6.5"/>',
  error: '<path d="M12 4.2 21 19H3z"/><path d="M12 9v4.4M12 16.7h.01"/>',
  warning: '<path d="M12 4.2 21 19H3z"/><path d="M12 9v4.4M12 16.7h.01"/>',
  info: '<path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="M18.5 15.5l.7 2.2 2.3.8-2.3.7-.7 2.3-.8-2.3-2.2-.7 2.2-.8z"/>'
};

function normalizeFeedbackDetail(detail) {
  if (!detail) {
    return "";
  }

  if (Array.isArray(detail)) {
    return detail.filter(Boolean).join("\n");
  }

  if (typeof detail === "object") {
    try {
      return JSON.stringify(detail, null, 2);
    } catch {
      return String(detail);
    }
  }

  return String(detail);
}

function cleanRequestErrorMessage(error, apiUrl = "") {
  const rawMessage = error instanceof Error && error.message ? error.message : String(error || "Network request failed");
  const requestPrefix = apiUrl ? `${apiUrl} 请求失败：` : "";

  if (requestPrefix && rawMessage.startsWith(requestPrefix)) {
    return rawMessage.slice(requestPrefix.length);
  }

  return rawMessage.replace(/^https?:\/\/\S+\s+请求失败：/, "");
}

function formatRequestError(error, apiUrl = "") {
  const requestUrl = apiUrl || error?.requestUrl || "";
  const name = error instanceof Error && error.name ? error.name : typeof error;
  const message = cleanRequestErrorMessage(error, requestUrl);
  const lowerMessage = message.toLowerCase();
  const isConnectionError =
    name === "TypeError" ||
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("network request failed") ||
    lowerMessage.includes("load failed") ||
    lowerMessage.includes("networkerror");
  const detail = [
    `接口地址：${requestUrl || "未记录"}`,
    `错误类型：${name || "Error"}`,
    `错误信息：${message || "Network request failed"}`
  ];
  const httpMatch = message.match(/^HTTP\s+(\d+)/i);

  if (httpMatch) {
    detail.splice(2, 0, `HTTP 状态：${httpMatch[1]}`);
  }

  if (error?.responseData) {
    detail.push(`响应数据：${JSON.stringify(error.responseData, null, 2).slice(0, 1200)}`);
  }

  if (isConnectionError) {
    return {
      title: "无法连接本地服务",
      message: "请确认电脑端后端服务已启动，并且手机与电脑处于同一网络。",
      detail
    };
  }

  return {
    title: "请求失败",
    message: "当前操作没有完成，请稍后重试。",
    detail
  };
}

function createFeedbackIcon(type) {
  const iconNode = document.createElement("div");
  iconNode.className = `feedback-icon ${type}`;
  iconNode.setAttribute("aria-hidden", "true");

  if (type === "loading") {
    iconNode.innerHTML = `
      <span class="loading-orbit">
        <span class="loading-pulse"></span>
      </span>
      <span class="loading-dot loading-dot-one"></span>
      <span class="loading-dot loading-dot-two"></span>
      <span class="loading-dot loading-dot-three"></span>
    `;
    return iconNode;
  }

  iconNode.innerHTML = `
    <span class="feedback-icon-ring"></span>
    <svg viewBox="0 0 24 24" aria-hidden="true">${feedbackIconPaths[type] || feedbackIconPaths.info}</svg>
  `;
  return iconNode;
}

function closeFeedback({ immediate = false } = {}) {
  const root = feedbackState.modalRoot;

  if (!root) {
    return;
  }

  window.clearTimeout(feedbackState.modalTimer);
  feedbackState.modalTimer = 0;

  const removeRoot = () => {
    if (feedbackState.modalRoot === root) {
      root.remove();
      feedbackState.modalRoot = null;
      feedbackState.activeType = "";
    }
  };

  if (immediate) {
    removeRoot();
    return;
  }

  root.querySelector(".feedback-overlay")?.classList.add("is-closing");
  root.querySelector(".feedback-panel")?.classList.add("is-closing");
  window.setTimeout(removeRoot, 190);
}

function showFeedback(options = {}) {
  const type = options.type || "info";
  const title = options.title || (type === "loading" ? "正在处理" : "提示");
  const message = options.message || "";
  const detailText = normalizeFeedbackDetail(options.detail);
  const isLoading = type === "loading";

  closeFeedback({ immediate: true });

  const root = document.createElement("div");
  root.className = "feedback-root";

  const overlay = document.createElement("div");
  overlay.className = "feedback-overlay";

  const panel = document.createElement("section");
  panel.className = `feedback-panel ${type}`;
  panel.setAttribute("role", isLoading ? "status" : "dialog");
  panel.setAttribute("aria-live", isLoading ? "polite" : "assertive");
  if (!isLoading) {
    panel.setAttribute("aria-modal", "true");
  }

  const glow = document.createElement("div");
  glow.className = "feedback-glow";
  glow.setAttribute("aria-hidden", "true");

  const titleNode = document.createElement("h2");
  titleNode.className = "feedback-title";
  titleNode.textContent = title;

  const messageNode = document.createElement("p");
  messageNode.className = "feedback-message";
  messageNode.textContent = message;

  panel.append(glow, createFeedbackIcon(type), titleNode, messageNode);

  if (detailText) {
    const detailToggle = document.createElement("button");
    detailToggle.className = "feedback-detail-toggle";
    detailToggle.type = "button";
    detailToggle.textContent = type === "error" ? "查看错误详情" : "查看技术详情";
    detailToggle.setAttribute("aria-expanded", "false");

    const detailPanel = document.createElement("pre");
    detailPanel.className = "feedback-detail";
    detailPanel.textContent = detailText;
    detailPanel.hidden = true;

    const copyButton = document.createElement("button");
    copyButton.className = "feedback-detail-copy";
    copyButton.type = "button";
    copyButton.textContent = "复制详情";
    copyButton.hidden = true;

    detailToggle.addEventListener("click", () => {
      const isOpen = !detailPanel.hidden;
      detailPanel.hidden = isOpen;
      copyButton.hidden = isOpen;
      detailToggle.classList.toggle("is-open", !isOpen);
      detailToggle.textContent = isOpen ? (type === "error" ? "查看错误详情" : "查看技术详情") : "收起详情";
      detailToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    copyButton.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard API unavailable");
        }
        await navigator.clipboard.writeText(detailText);
        showToast({ type: "success", message: "错误详情已复制" });
      } catch {
        showToast({ type: "warning", message: "复制失败，请长按详情手动复制" });
      }
    });

    panel.append(detailToggle, detailPanel, copyButton);
  }

  if (!isLoading) {
    const actions = document.createElement("div");
    actions.className = "feedback-actions";
    const defaultPrimaryText = type === "error" ? "我知道了" : "知道了";
    const primaryText = options.primaryText || defaultPrimaryText;

    if (options.secondaryText) {
      const secondaryButton = document.createElement("button");
      secondaryButton.className = "feedback-btn secondary";
      secondaryButton.type = "button";
      secondaryButton.textContent = options.secondaryText;
      secondaryButton.addEventListener("click", () => {
        closeFeedback();
        options.onSecondary?.();
      });
      actions.append(secondaryButton);
    }

    if (primaryText) {
      const primaryButton = document.createElement("button");
      primaryButton.className = "feedback-btn primary";
      primaryButton.type = "button";
      primaryButton.textContent = primaryText;
      primaryButton.addEventListener("click", () => {
        closeFeedback();
        options.onPrimary?.();
      });
      actions.append(primaryButton);
      window.setTimeout(() => primaryButton.focus({ preventScroll: true }), 260);
    }

    panel.append(actions);
  }

  overlay.append(panel);
  root.append(overlay);
  document.body.append(root);
  feedbackState.modalRoot = root;
  feedbackState.activeType = type;

  window.requestAnimationFrame(() => {
    overlay.classList.add("is-visible");
    panel.classList.add("is-visible");
  });

  if (options.autoClose) {
    feedbackState.modalTimer = window.setTimeout(() => closeFeedback(), options.duration || 2200);
  }

  return root;
}

function showSuccess(options = {}) {
  return showFeedback({
    type: "success",
    title: options.title || "操作完成",
    message: options.message || "当前操作已完成。",
    primaryText: options.primaryText || "知道了",
    secondaryText: options.secondaryText,
    onPrimary: options.onPrimary,
    onSecondary: options.onSecondary,
    autoClose: options.autoClose,
    duration: options.duration
  });
}

function showError(options = {}) {
  const retry = typeof options.retry === "function" ? options.retry : null;

  return showFeedback({
    type: "error",
    title: options.title || "请求失败",
    message: options.message || "当前操作没有完成，请稍后重试。",
    detail: options.detail,
    primaryText: options.primaryText || (retry ? "重试" : "我知道了"),
    secondaryText: options.secondaryText || (retry ? "关闭" : ""),
    onPrimary: retry || options.onPrimary,
    onSecondary: options.onSecondary,
    autoClose: options.autoClose,
    duration: options.duration
  });
}

function showLoading(options = {}) {
  return showFeedback({
    type: "loading",
    title: options.title || "正在处理",
    message: options.message || "瞬忆正在处理当前请求，请稍候…"
  });
}

function hideLoading() {
  if (feedbackState.activeType === "loading") {
    closeFeedback({ immediate: true });
  }
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
      `privacyMode: ${data.state.privacyMode}`,
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

function notifyRequestFailure(label, key, error, options = {}) {
  failRequestDebug(key, error);

  const url = error.requestUrl || state.requestDebug[key]?.url || "";
  const formatted = formatRequestError(error, url);
  const hasRetry = typeof options.retry === "function";

  showError({
    title: options.title || formatted.title,
    message: options.message || formatted.message,
    detail: options.detail || formatted.detail,
    retry: options.retry,
    primaryText: options.primaryText,
    secondaryText: options.secondaryText || (hasRetry && formatted.title === "无法连接本地服务" ? "我知道了" : undefined)
  });

  if (options.toastMessage) {
    showToast({ type: "error", message: options.toastMessage });
  }
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

function pickMemoryText(memory = {}, keys = [], fallback = "") {
  for (const key of keys) {
    const value = memory[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function normalizeMemoryTags(memory) {
  const tags = normalizeMeetingList(memory.tags || memory.autoTags || memory.tag, []);
  const category = pickTextValue(memory.category, "");

  if (category && !tags.includes(category)) {
    tags.push(category);
  }

  return tags;
}

function normalizeBackendMemory(memory = {}) {
  const tags = normalizeMemoryTags(memory);
  const aiContent = pickMemoryText(memory, ["summary", "aiSummary", "aiContent"], "暂无摘要");
  const rawContent = pickMemoryText(memory, ["content", "rawText", "rawContent", "text"], "暂无原始内容");
  const keyPoints = normalizeMeetingList(memory.points || memory.keyPoints || memory.highlights, []);
  const createdAt = pickMemoryText(memory, ["createdAt", "time", "updatedAt"], "");

  return {
    id: pickTextValue(memory.id, `memory-${Date.now()}`),
    type: pickMemoryText(memory, ["type"], "text"),
    title: pickMemoryText(memory, ["title", "name"], "未命名记忆"),
    rawContent,
    content: rawContent,
    rawText: rawContent,
    aiContent,
    aiSummary: aiContent,
    summary: aiContent,
    keyPoints,
    points: keyPoints,
    todos: normalizeMeetingList(memory.todos || memory.tasks || memory.todoItems, []),
    tag: tags,
    tags,
    autoTags: tags,
    time: pickMemoryText(memory, ["time"], formatCurrentTime()),
    createdAt,
    updatedAt: pickMemoryText(memory, ["updatedAt"], ""),
    location: pickTextValue(memory.location, pickTextValue(memory.category, "记忆舱")),
    source: pickMemoryText(memory, ["source", "from"], "APP"),
    importance: normalizeMeetingImportance(memory.importance ?? memory.score),
    archived: Boolean(memory.archived ?? memory.isArchived),
    category: pickTextValue(memory.category, "")
  };
}

function setMemoriesFromBackend(memories) {
  const normalized = Array.isArray(memories) ? memories.map(normalizeBackendMemory) : [];
  mockMemories.splice(0, mockMemories.length, ...normalized);

  if (normalized.length > 0 && !mockMemories.some((memory) => memory.id === state.expandedId)) {
    state.expandedId = normalized[0].id;
  }

  if (state.detailMemoryId && !mockMemories.some((memory) => memory.id === state.detailMemoryId)) {
    state.detailMemoryId = "";
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
  state.detailMemoryId = normalized.id;
  return normalized;
}

async function loadAppState({ silent = false } = {}) {
  const nextState = await apiRequest(APP_STATE_PATH);
  setAppState(nextState);
  state.backendOffline = false;
  state.syncMessage = "";

  if (!silent) {
    showToast({ type: "success", message: "状态已同步" });
  }

  return nextState;
}

async function loadMemories({ silent = false } = {}) {
  const payload = await apiRequest(MEMORIES_PATH);
  setMemoriesFromBackend(payload.memories);
  state.backendOffline = false;
  state.syncMessage = "";

  if (!silent) {
    showToast({ type: "success", message: "记忆已同步" });
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
      showToast({ type: "warning", message: "后端离线，已使用本地兜底数据" });
    }
  } else if (!silent) {
    showToast({ type: "success", message: "后端状态与记忆已同步" });
  }

  render();
}

function scheduleBackendSync() {
  window.clearInterval(backendSyncTimerId);
  backendSyncTimerId = window.setInterval(() => {
    syncBackendData({ silent: true });
  }, 30000);
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
  let ok = false;

  try {
    const response = await fetch(url, options);
    const text = await readResponseText(response);

    ok = response.ok;
    lines[0] = `${label}: ${response.ok ? "成功" : "失败"}`;
    lines.push(`status: ${response.status} ${response.statusText}`);

    if (text) {
      lines.push(`response: ${text}`);
    }
  } catch (error) {
    lines[0] = `${label}: 失败`;
    lines.push(formatErrorDetail(error));
  }

  return {
    ok,
    output: lines.join("\n")
  };
}

async function runBackendDiagnostics() {
  if (state.meeting.diagnostic.status === "running") {
    return;
  }

  const currentApiBaseUrl = getApiBaseUrl();

  setDiagnosticOutput("running", `当前后端地址: ${currentApiBaseUrl}\n正在执行后端连接诊断...`);
  showLoading({
    title: "正在连接本地服务",
    message: "正在确认后端状态，请稍候…"
  });

  const lines = [`当前后端地址: ${currentApiBaseUrl}`, ""];
  const results = [];

  results.push(await runDiagnosticRequest("GET /api/status", buildApiUrl("/api/status"), {
    method: "GET"
  }));
  lines.push("");
  results.push(await runDiagnosticRequest("POST /api/meeting/mock", buildApiUrl(MEETING_MOCK_PATH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  }));
  lines.push("");
  results.push(await runDiagnosticRequest("GET /api/app/state", buildApiUrl(APP_STATE_PATH), {
    method: "GET",
    headers: {
      "X-ShunYi-Source": "android_app"
    }
  }));
  lines.push("");
  results.push(await runDiagnosticRequest("POST /api/features/voice-transcribe", buildApiUrl("/api/features/voice-transcribe"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ShunYi-Source": "android_app"
    },
    body: JSON.stringify({})
  }));

  results.forEach((result, index) => {
    if (index > 0) {
      lines.push("");
    }
    lines.push(result.output);
  });

  hideLoading();
  setDiagnosticOutput("complete", lines.join("\n"));

  if (results.some((result) => result.ok)) {
    showSuccess({
      title: "连接成功",
      message: "已连接到本地服务，APP 可以同步请求和记忆数据。",
      primaryText: "完成"
    });
  } else {
    showError({
      title: "连接测试失败",
      message: "当前地址无法访问，请检查 IP、端口和电脑防火墙设置。",
      detail: [
        `接口地址：${currentApiBaseUrl}`,
        "错误信息：诊断接口均未成功返回",
        lines.join("\n")
      ],
      retry: runBackendDiagnostics,
      primaryText: "重新测试",
      secondaryText: "关闭"
    });
  }
}

function completeMeetingRecord(meetingResult = mockMeetingContent) {
  const meetingMemory = createMeetingMemory(meetingResult);
  mockMemories.unshift(meetingMemory);
  state.meeting.status = "complete";
  state.meeting.progress = 100;
  state.meeting.resultId = meetingMemory.id;
  state.expandedId = meetingMemory.id;
  render();
  showSuccess({
    title: "会议记录已生成",
    message: "摘要、重点、待办和标签已保存到记忆舱。",
    primaryText: "查看结果",
    secondaryText: "继续记录",
    onPrimary: () => {
      state.tab = "capsule";
      state.expandedId = meetingMemory.id;
      render();
    }
  });
}

async function startMeetingRecord() {
  void reportEvent("start_meeting_click");

  if (state.appState.paused) {
    showToast({ type: "warning", message: "当前已暂停，恢复运行后才能开始会议记录" });
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
  showLoading({
    title: "正在连接本地服务",
    message: "正在确认后端状态，请稍候…"
  });

  try {
    meetingResult = await requestMeetingMock();
    hideLoading();
    setBackendStatus("success");
  } catch (error) {
    hideLoading();
    console.log("后端请求失败，使用本地 mock");
    console.error(error);
    setBackendStatus("error", getBackendErrorMessage(error));
    void reportEvent("request_meeting_failed", getBackendErrorMessage(error));
    meetingResult = mockMeetingContent;
    showToast({ type: "warning", message: "后端离线，已启用本地演示数据" });
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
    片段删除: "delete"
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
    showToast({ type: "success", message: "后端地址已保存" });
    render();
    await syncBackendData({ silent: true });
  } catch (error) {
    const inputUrl = normalizeApiBaseUrl(state.backendConfig.input || "");
    setRequestDebug("backend-config", {
      url: inputUrl,
      status: "请求失败",
      errorName: "ValidationError",
      errorMessage: error.message,
      result: ""
    });
    showError({
      title: "后端地址无效",
      message: "请填写以 http:// 或 https:// 开头的本地服务地址。",
      detail: [
        `接口地址：${inputUrl || "未填写"}`,
        "错误类型：ValidationError",
        `错误信息：${error.message}`
      ],
      primaryText: "我知道了"
    });
    render();
  }
}

async function testBackendBaseUrl() {
  let normalized = "";

  try {
    normalized = validateApiBaseUrl(state.backendConfig.input);
  } catch (error) {
    const inputUrl = normalizeApiBaseUrl(state.backendConfig.input || "");
    setRequestDebug("backend-config", {
      url: inputUrl,
      status: "请求失败",
      errorName: "ValidationError",
      errorMessage: error.message,
      result: ""
    });
    showError({
      title: "连接测试失败",
      message: "当前地址无法访问，请检查 IP、端口和电脑防火墙设置。",
      detail: [
        `接口地址：${inputUrl ? `${inputUrl}/api/status` : "未填写"}`,
        "错误类型：ValidationError",
        `错误信息：${error.message}`
      ],
      primaryText: "重新测试",
      secondaryText: "关闭",
      onPrimary: testBackendBaseUrl
    });
    render();
    return;
  }

  state.backendConfig.testing = true;
  startRequestDebug("backend-config", "/api/status", normalized);
  render();
  showLoading({
    title: "正在连接本地服务",
    message: "正在确认后端状态，请稍候…"
  });

  try {
    const payload = await apiRequest("/api/status", {
      method: "GET",
      baseUrl: normalized
    });
    completeRequestDebug("backend-config", payload);
    hideLoading();
    showSuccess({
      title: "连接成功",
      message: "已连接到本地服务，APP 可以同步请求和记忆数据。",
      primaryText: "完成"
    });
  } catch (error) {
    hideLoading();
    notifyRequestFailure("后端连接", "backend-config", error, {
      title: "连接测试失败",
      message: "当前地址无法访问，请检查 IP、端口和电脑防火墙设置。",
      retry: testBackendBaseUrl,
      primaryText: "重新测试",
      secondaryText: "关闭"
    });
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
  showToast({ type: "info", message: "已恢复默认后端地址" });
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
  showLoading({
    title: "正在保存记忆",
    message: "瞬忆正在写入你的个人记忆舱…"
  });

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
    hideLoading();
    showSuccess({
      title: "记录已保存",
      message: "语音转写结果已写入记忆舱，可继续进行 AI 整理。",
      primaryText: "查看记忆舱",
      secondaryText: "稍后再看",
      onPrimary: () => {
        state.tab = "capsule";
        state.expandedId = memory.id;
        render();
      }
    });
  } catch (error) {
    hideLoading();
    state.featureStatus.voice = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("语音转写", "voice", error, {
      retry: handleVoiceTranscribe
    });
  }

  render();
}

async function handleAiPolish() {
  const path = "/api/features/ai-polish";
  state.activePanel = "ai-polish";
  state.aiPolish.status = "running";
  startRequestDebug("ai-polish", path);
  render();
  showLoading({
    title: "AI 正在整理内容",
    message: "正在提取摘要、重点、待办和标签…"
  });

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
    hideLoading();
    showSuccess({
      title: "AI 修正完成",
      message: "内容已变得更清晰，重点和表达已完成优化。",
      primaryText: "知道了"
    });
  } catch (error) {
    hideLoading();
    state.aiPolish.status = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("AI 修正", "ai-polish", error, {
      retry: handleAiPolish
    });
  }

  render();
}

async function handleArchiveMemories() {
  const path = "/api/memories/archive";
  state.activePanel = "archive";
  state.featureStatus.archive = "running";
  startRequestDebug("archive", path);
  render();
  showLoading({
    title: "AI 正在整理内容",
    message: "正在提取摘要、重点、待办和标签…"
  });

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
    hideLoading();
    showSuccess({
      title: "归档完成",
      message: "记忆片段已按主题整理，后续可在记忆舱中检索。",
      primaryText: "知道了"
    });
  } catch (error) {
    hideLoading();
    state.featureStatus.archive = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("自动归档", "archive", error, {
      retry: handleArchiveMemories
    });
  }

  render();
}

async function openPrivacyPanel() {
  state.activePanel = "privacy";
  startRequestDebug("privacy", APP_STATE_PATH);
  render();
  showLoading({
    title: "正在同步状态",
    message: "正在更新本地服务中的 APP 状态…"
  });

  try {
    const nextState = await loadAppState({ silent: true });
    completeRequestDebug("privacy", nextState);
    hideLoading();
  } catch (error) {
    hideLoading();
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("隐私状态同步", "privacy", error, {
      retry: openPrivacyPanel
    });
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
    }
  }[setting];

  if (!settingConfig) {
    return;
  }

  const enabled = !state.appState[settingConfig.field];
  state.activePanel = "privacy";
  startRequestDebug("privacy", settingConfig.endpoint);
  render();
  showLoading({
    title: "正在同步状态",
    message: "正在更新本地服务中的 APP 状态…"
  });

  try {
    const payload = await apiRequest(settingConfig.endpoint, {
      method: "POST",
      body: JSON.stringify({ enabled })
    });
    setAppState(payload.state);
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("privacy", payload);
    hideLoading();
    showSuccess({
      title: enabled ? "暂停已开启" : "采集已恢复",
      message: enabled ? "当前采集流程已暂停，你可以稍后继续恢复记录。" : "瞬忆将继续整理新的碎片信息。",
      primaryText: "知道了"
    });
  } catch (error) {
    hideLoading();
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("状态更新", "privacy", error, {
      retry: () => toggleSetting(setting)
    });
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
  showLoading({
    title: "正在同步状态",
    message: "正在更新本地服务中的 APP 状态…"
  });

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
    hideLoading();
    showToast({ type: "success", message: "记忆列表已同步" });
  } catch (error) {
    hideLoading();
    state.featureStatus.delete = "error";
    state.backendOffline = true;
    state.syncMessage = "后端离线时使用本地数据";
    notifyRequestFailure("记忆列表同步", "delete", error, {
      retry: loadDeleteList
    });
  }

  render();
}

function confirmDeleteMemory(id) {
  const targetMemory = [...state.deleteMemories, ...mockMemories].find((memory) => memory.id === id);
  const title = targetMemory ? getMemoryTitle(targetMemory) : "这条记忆";

  showFeedback({
    type: "warning",
    title: "删除确认",
    message: `确认删除「${title}」？删除后会从当前列表中移除。`,
    primaryText: "删除",
    secondaryText: "取消",
    onPrimary: () => deleteMemory(id)
  });
}

async function deleteMemory(id) {
  const path = `${MEMORIES_PATH}/${encodeURIComponent(id)}`;
  startRequestDebug("delete", path);
  render();
  showLoading({
    title: "正在同步状态",
    message: "正在更新本地服务中的 APP 状态…"
  });

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
    if (state.detailMemoryId === id) {
      state.detailMemoryId = "";
    }
    completeRequestDebug("delete", payload);
    hideLoading();
    showSuccess({
      title: "片段已删除",
      message: "选中的记忆片段已从当前列表中移除。",
      primaryText: "知道了"
    });
    showToast({ type: "success", message: "删除成功" });
  } catch (error) {
    hideLoading();
    notifyRequestFailure("片段删除", "delete", error, {
      retry: () => deleteMemory(id)
    });
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
          <h2>记忆时间线</h2>
          <p>按日期沉淀记忆片段，点击卡片查看完整详情</p>
        </div>
        <span class="mini-chip" id="memory-count">${results.length} 条</span>
      </div>

      <div class="memory-list" id="memory-list">
        ${renderMemoryList(results)}
      </div>

      ${renderMemoryDetailModal()}
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

function getCategoryStats() {
  if (mockMemories.length === 0) {
    return [];
  }

  const counts = new Map();
  mockMemories.forEach((memory) => {
    const memoryTags = getMemoryTags(memory);
    const tags = memory.category ? [memory.category, ...memoryTags] : memoryTags;
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });

  const preferred = ["会议", "开发", "硬件", "灵感", "生活", "ESP32", "AI 整理", "项目答辩", "待办", "学习", "剪贴板", "UI 优化"];
  const preferredStats = preferred
    .filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name) }));
  const fallbackStats = categoryStats.filter((item) => !preferredStats.some((stat) => stat.name === item.name));

  return [...preferredStats, ...fallbackStats].slice(0, 6);
}

const memoryTypeLabels = {
  meeting: "会议记录",
  voice: "语音转写",
  text: "AI 修正",
  clipboard: "灵感记录",
  todo: "待办事项",
  idea: "灵感记录"
};

function getMemoryById(id) {
  return mockMemories.find((memory) => String(memory.id) === String(id)) || null;
}

function getMemoryTitle(memory) {
  return pickMemoryText(memory, ["title", "name"], "未命名记忆");
}

function getMemoryContent(memory) {
  return pickMemoryText(memory, ["content", "rawText", "rawContent", "text"], "暂无原始内容");
}

function getMemorySummary(memory) {
  return pickMemoryText(memory, ["summary", "aiSummary", "aiContent"], "暂无摘要");
}

function getMemoryPoints(memory) {
  return normalizeMeetingList(memory.points || memory.keyPoints || memory.highlights, []);
}

function getMemoryTodos(memory) {
  return normalizeMeetingList(memory.todos || memory.tasks || memory.todoItems, []);
}

function getMemoryTags(memory) {
  return normalizeMeetingList(memory.tags || memory.autoTags || memory.tag, []);
}

function getMemorySource(memory) {
  return pickMemoryText(memory, ["source", "from"], "APP");
}

function getMemoryTypeLabel(memory) {
  return memoryTypeLabels[memory.type] || pickMemoryText(memory, ["type"], "灵感记录");
}

function getMemoryImportance(memory) {
  const value = memory.importance ?? memory.score;
  const formatted = formatImportance(value);
  return formatted === "--" ? "普通" : formatted;
}

function isMemoryArchived(memory) {
  return Boolean(memory.archived ?? memory.isArchived);
}

function parseMemoryDate(memory) {
  const candidates = [
    pickMemoryText(memory, ["createdAt"], ""),
    pickMemoryText(memory, ["time"], ""),
    pickMemoryText(memory, ["updatedAt"], "")
  ].filter(Boolean);

  for (const value of candidates) {
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [hour, minute] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      return date;
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function formatMemoryClock(memory) {
  const explicitTime = pickMemoryText(memory, ["time"], "");

  if (/^\d{1,2}:\d{2}$/.test(explicitTime)) {
    return explicitTime.padStart(5, "0");
  }

  const date = parseMemoryDate(memory);
  if (!date) {
    return explicitTime || "未知时间";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatMemoryFullTime(memory) {
  const date = parseMemoryDate(memory);

  if (!date) {
    return pickMemoryText(memory, ["createdAt", "time", "updatedAt"], "未知时间");
  }

  return [
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  ].join(" ");
}

function formatMemoryDateGroup(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (target.getTime() === today.getTime()) {
    return "今天";
  }

  if (target.getTime() === yesterday.getTime()) {
    return "昨天";
  }

  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
}

function groupMemoriesByDate(list) {
  const groups = new Map();
  const sorted = [...list].sort((left, right) => parseMemoryDate(right).getTime() - parseMemoryDate(left).getTime());

  sorted.forEach((memory) => {
    const date = parseMemoryDate(memory);
    const key = formatMemoryDateGroup(date);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(memory);
  });

  return [...groups.entries()].map(([label, memories]) => ({ label, memories }));
}

function renderMemoryList(list = getFilteredMemories()) {
  if (!list.length) {
    return `
      <section class="memory-empty-state">
        <div class="memory-empty-icon">${icon("spark")}</div>
        <h3>还没有记忆片段</h3>
        <p>点击首页开始记录，让瞬忆帮你整理第一条记忆。</p>
        <button class="memory-empty-button" type="button" data-empty-start>开始记录</button>
      </section>
    `;
  }

  return `
    <div class="memory-timeline" aria-label="记忆时间线">
      ${groupMemoriesByDate(list).map((group) => `
        <section class="timeline-group">
          <h3 class="timeline-date">${escapeHtml(group.label)}</h3>
          <div class="timeline-group-list">
            ${group.memories.map(renderMemoryCard).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderTimelineTags(tags) {
  const visibleTags = tags.length ? tags.slice(0, 3) : ["暂无标签"];

  return visibleTags
    .map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
    .join("");
}

function renderMemoryCard(item) {
  const title = getMemoryTitle(item);
  const summary = getMemorySummary(item);
  const tags = getMemoryTags(item);
  const source = getMemorySource(item);
  const archived = isMemoryArchived(item);

  return `
    <article class="timeline-memory-item" data-memory-id="${escapeHtml(item.id)}" role="button" tabindex="0" aria-label="查看${escapeHtml(title)}详情">
      <span class="timeline-rail" aria-hidden="true">
        <span class="timeline-node"></span>
      </span>
      <div class="memory-card timeline-memory-card">
        <div class="memory-card-head">
          <div>
            <span class="source-pill">${escapeHtml(getMemoryTypeLabel(item))}</span>
            <h3>${escapeHtml(title)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(formatMemoryClock(item))}</span>
              <span>${escapeHtml(source)}</span>
              <span>${archived ? "已归档" : "未归档"}</span>
            </div>
          </div>
          <span class="score-pill">${escapeHtml(getMemoryImportance(item))}</span>
        </div>
        <p class="timeline-summary">${escapeHtml(summary)}</p>
        <div class="tag-row" aria-label="自动标签">
          ${renderTimelineTags(tags)}
        </div>
      </div>
    </article>
  `;
}

function renderListItems(items, fallback) {
  if (!items.length) {
    return `<p class="memory-detail-muted">${escapeHtml(fallback)}</p>`;
  }

  return `
    <ul class="memory-detail-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderDetailTags(tags) {
  if (!tags.length) {
    return `<p class="memory-detail-muted">暂无标签</p>`;
  }

  return `
    <div class="memory-detail-tags">
      ${tags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderMemoryDetailModal() {
  const memory = getMemoryById(state.detailMemoryId);

  if (!memory) {
    return "";
  }

  const title = getMemoryTitle(memory);
  const tags = getMemoryTags(memory);
  const archived = isMemoryArchived(memory);

  return `
    <div class="memory-detail-overlay" data-detail-overlay>
      <section class="memory-detail-modal" role="dialog" aria-modal="true" aria-label="记忆详情">
        <div class="memory-detail-glow" aria-hidden="true"></div>
        <header class="memory-detail-header">
          <div>
            <span class="memory-detail-kicker">${escapeHtml(getMemoryTypeLabel(memory))}</span>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <button class="memory-detail-close" type="button" data-detail-close aria-label="关闭">×</button>
        </header>

        <div class="memory-detail-meta">
          <span>来源：${escapeHtml(getMemorySource(memory))}</span>
          <span>创建：${escapeHtml(formatMemoryFullTime(memory))}</span>
          <span>重要：${escapeHtml(getMemoryImportance(memory))}</span>
          <span>${archived ? "已归档" : "未归档"}</span>
        </div>

        <div class="memory-detail-body">
          <section class="memory-detail-section">
            <h3>原始内容</h3>
            <p class="memory-detail-raw">${escapeHtml(getMemoryContent(memory))}</p>
          </section>

          <section class="memory-detail-section memory-summary-card">
            <h3>AI 摘要</h3>
            <p>${escapeHtml(getMemorySummary(memory))}</p>
          </section>

          <section class="memory-detail-section">
            <h3>关键重点</h3>
            ${renderListItems(getMemoryPoints(memory), "暂无重点")}
          </section>

          <section class="memory-detail-section">
            <h3>待办事项</h3>
            ${renderListItems(getMemoryTodos(memory), "暂无待办")}
          </section>

          <section class="memory-detail-section">
            <h3>自动标签</h3>
            ${renderDetailTags(tags)}
          </section>
        </div>

        <footer class="memory-detail-actions">
          <button class="secondary-inline" type="button" data-memory-copy="${escapeHtml(memory.id)}">复制内容</button>
          <button class="primary-inline" type="button" data-memory-archive="${escapeHtml(memory.id)}">${archived ? "取消归档" : "归档"}</button>
          <button class="danger-inline" type="button" data-delete-memory="${escapeHtml(memory.id)}">删除</button>
          <button class="secondary-inline" type="button" data-detail-close>关闭</button>
        </footer>
      </section>
    </div>
  `;
}

function buildMemoryClipboardText(memory) {
  const points = getMemoryPoints(memory);
  const todos = getMemoryTodos(memory);
  const tags = getMemoryTags(memory);

  return [
    `标题：${getMemoryTitle(memory)}`,
    `摘要：${getMemorySummary(memory)}`,
    `重点：${points.length ? points.join("；") : "暂无重点"}`,
    `待办：${todos.length ? todos.join("；") : "暂无待办"}`,
    `标签：${tags.length ? tags.join("、") : "暂无标签"}`
  ].join("\n");
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copyMemoryDetail(id) {
  const memory = getMemoryById(id);

  if (!memory) {
    showToast({ type: "warning", message: "记忆片段不存在" });
    return;
  }

  try {
    await writeClipboardText(buildMemoryClipboardText(memory));
    showToast({ type: "success", message: "内容已复制" });
  } catch {
    showToast({ type: "warning", message: "复制失败，请手动复制" });
  }
}

async function toggleMemoryArchive(id) {
  const memory = getMemoryById(id);

  if (!memory) {
    showToast({ type: "warning", message: "记忆片段不存在" });
    return;
  }

  const archived = !isMemoryArchived(memory);
  const path = "/api/memories/archive";
  startRequestDebug("archive", path);
  showLoading({
    title: archived ? "正在归档记忆" : "正在取消归档",
    message: "正在同步后端记忆状态"
  });

  try {
    const payload = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({ id, archived })
    });

    setMemoriesFromBackend(payload.memories);
    state.detailMemoryId = id;
    state.backendOffline = false;
    state.syncMessage = "";
    completeRequestDebug("archive", payload);
    hideLoading();
    showToast({ type: "success", message: archived ? "已归档" : "已取消归档" });
  } catch (error) {
    hideLoading();
    notifyRequestFailure("记忆归档", "archive", error, {
      retry: () => toggleMemoryArchive(id)
    });
  }

  render();
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
        ${renderPrivacy("trash", "片段删除", "删除后端记忆")}
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

function getFilteredMemories() {
  const query = state.query.trim().toLowerCase();
  return mockMemories.filter((item) => {
    const typeMatches = state.filter === "all" || item.type === state.filter;
    const searchText = [
      getMemoryTitle(item),
      getMemoryContent(item),
      getMemorySummary(item),
      getMemoryTags(item).join(" "),
      item.location,
      getMemorySource(item),
      item.category || "",
      getMemoryPoints(item).join(" "),
      getMemoryTodos(item).join(" ")
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

function createToastRoot() {
  if (feedbackState.toastRoot?.isConnected) {
    return feedbackState.toastRoot;
  }

  const root = document.createElement("div");
  root.className = "toast-root";
  root.setAttribute("aria-live", "polite");
  root.setAttribute("aria-atomic", "false");
  document.body.append(root);
  feedbackState.toastRoot = root;
  return root;
}

function showToast(options = {}) {
  const normalized = typeof options === "string" ? { message: options } : options;
  const type = normalized.type || "info";
  const message = normalized.message || "";
  const title = normalized.title || "";
  const duration = normalized.duration || 2400;
  const root = createToastRoot();
  const toast = document.createElement("div");
  const toastId = String(++feedbackState.toastId);

  toast.className = `toast-item ${type}`;
  toast.dataset.toastId = toastId;
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">${feedbackIconPaths[type] || feedbackIconPaths.info}</svg>
    </span>
    <span class="toast-content">
      ${title ? `<strong class="toast-title">${escapeHtml(title)}</strong>` : ""}
      <span class="toast-message">${escapeHtml(message)}</span>
    </span>
  `;

  root.append(toast);

  while (root.children.length > 3) {
    root.firstElementChild?.remove();
  }

  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 180);
  }, duration);

  return toast;
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

  if (event.target.matches("[data-detail-overlay]")) {
    state.detailMemoryId = "";
    render();
    return;
  }

  const detailCloseButton = event.target.closest("[data-detail-close]");
  if (detailCloseButton) {
    state.detailMemoryId = "";
    render();
    return;
  }

  const copyMemoryButton = event.target.closest("[data-memory-copy]");
  if (copyMemoryButton) {
    copyMemoryDetail(copyMemoryButton.dataset.memoryCopy);
    return;
  }

  const archiveMemoryButton = event.target.closest("[data-memory-archive]");
  if (archiveMemoryButton) {
    toggleMemoryArchive(archiveMemoryButton.dataset.memoryArchive);
    return;
  }

  const emptyStartButton = event.target.closest("[data-empty-start]");
  if (emptyStartButton) {
    state.tab = "home";
    render();
    return;
  }

  const deleteMemoryButton = event.target.closest("[data-delete-memory]");
  if (deleteMemoryButton) {
    confirmDeleteMemory(deleteMemoryButton.dataset.deleteMemory);
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
    state.expandedId = id;
    state.detailMemoryId = id;
    render();
    return;
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
