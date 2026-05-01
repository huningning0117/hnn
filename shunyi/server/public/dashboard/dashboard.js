const serviceStatusText = document.querySelector("#serviceStatusText");
const alertBox = document.querySelector("#alertBox");
const backendState = document.querySelector("#backendState");
const todayRequestCount = document.querySelector("#todayRequestCount");
const latestMeetingMetric = document.querySelector("#latestMeetingMetric");
const latestMeetingSub = document.querySelector("#latestMeetingSub");
const aiMode = document.querySelector("#aiMode");
const heroAiMode = document.querySelector("#heroAiMode");
const esp32State = document.querySelector("#esp32State");
const heroEsp32State = document.querySelector("#heroEsp32State");
const uptime = document.querySelector("#uptime");
const apiResponse = document.querySelector("#apiResponse");
const meetingText = document.querySelector("#meetingText");
const submitText = document.querySelector("#submitText");
const refreshLatest = document.querySelector("#refreshLatest");
const latestMeeting = document.querySelector("#latestMeeting");
const logRows = document.querySelector("#logRows");
const logCount = document.querySelector("#logCount");
const lastSync = document.querySelector("#lastSync");
const activityStream = document.querySelector("#activityStream");
const activityCount = document.querySelector("#activityCount");
const actionButtons = document.querySelectorAll("[data-action]");
const dashboardPaused = document.querySelector("#dashboardPaused");
const dashboardEncryption = document.querySelector("#dashboardEncryption");
const dashboardLowPower = document.querySelector("#dashboardLowPower");
const dashboardPrivacy = document.querySelector("#dashboardPrivacy");
const dashboardMemoryCount = document.querySelector("#dashboardMemoryCount");
const dashboardLastAction = document.querySelector("#dashboardLastAction");
const appStateUpdatedAt = document.querySelector("#appStateUpdatedAt");

let serverUptimeBase = 0;
let serverUptimeSyncedAt = Date.now();
let alertTimer = null;

const activityLabels = {
  start_meeting_click: "点击开始会议记录",
  request_meeting_start: "请求会议接口",
  request_meeting_success: "接口成功返回",
  request_meeting_failed: "请求失败",
  settings_pause_update: "一键暂停状态更新",
  settings_encryption_update: "本地加密状态更新",
  settings_low_power_update: "低耗模式状态更新",
  memory_added: "新增记忆",
  memory_deleted: "删除记忆片段",
  memories_archived: "自动归档完成",
  feature_voice_transcribe: "语音转写保存",
  feature_ai_polish: "AI 修正保存",
  app_state_sync: "APP 状态同步",
  memories_sync: "记忆列表同步",
};

function showAlert(message, type = "success") {
  window.clearTimeout(alertTimer);
  alertBox.textContent = message;
  alertBox.className = `alert visible ${type}`;

  alertTimer = window.setTimeout(() => {
    alertBox.className = "alert";
  }, 5200);
}

function setBusy(element, busy) {
  if (!element) {
    return;
  }

  element.disabled = busy;
  element.classList.toggle("is-loading", busy);
  element.setAttribute("aria-busy", busy ? "true" : "false");
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-ShunYi-Source": "dashboard",
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object"
        ? payload.message || payload.error || "请求失败"
        : payload || "请求失败";
    throw new Error(`${response.status} ${message}`);
  }

  return payload;
}

function renderJson(target, data) {
  target.textContent = JSON.stringify(data, null, 2);
}

function formatUptime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分`;
  }

  if (hours > 0) {
    return `${hours}小时 ${minutes}分 ${secs}秒`;
  }

  return `${minutes}分 ${secs}秒`;
}

function refreshUptimeText() {
  const driftSeconds = Math.floor((Date.now() - serverUptimeSyncedAt) / 1000);
  uptime.textContent = formatUptime(serverUptimeBase + driftSeconds);
}

function formatLogTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatActivityTime(value) {
  if (typeof value === "string") {
    const timePart = value.split(" ").pop();

    if (/^\d{2}:\d{2}:\d{2}$/.test(timePart)) {
      return timePart;
    }
  }

  return formatLogTime(value);
}

function updateLastSync() {
  lastSync.textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function statusClass(code) {
  if (code >= 400) {
    return "error";
  }

  return "ok";
}

function formatImportance(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  const displayValue = numericValue <= 10 ? numericValue : numericValue / 10;
  return displayValue.toFixed(1).replace(/\.0$/, "");
}

function getImportancePercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const normalized = numericValue <= 10 ? numericValue * 10 : numericValue;
  return Math.max(0, Math.min(100, normalized));
}

function getTextValue(value, fallback = "--") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => {
    if (typeof item === "string") {
      return item.trim().length > 0;
    }

    return item && typeof item === "object";
  });
}

function normalizeTodo(todo) {
  if (typeof todo === "string") {
    return {
      text: todo,
      owner: "",
      done: null,
    };
  }

  return {
    text: getTextValue(todo?.text),
    owner: getTextValue(todo?.owner, ""),
    done: typeof todo?.done === "boolean" ? todo.done : null,
  };
}

function getDisplaySource(source) {
  const normalized = String(source || "").toLowerCase();

  if (normalized.includes("mock")) {
    return "Mock";
  }

  if (
    normalized.includes("esp32") ||
    normalized.includes("hardware") ||
    normalized.includes("audio")
  ) {
    return "ESP32";
  }

  if (
    normalized.includes("app") ||
    normalized.includes("android") ||
    normalized === "text"
  ) {
    return "Android APP";
  }

  if (normalized.includes("dashboard")) {
    return "Dashboard";
  }

  return getTextValue(source, "Android APP");
}

function appendFieldCode(parent, code, label) {
  const codeNode = document.createElement("span");
  codeNode.className = "field-code";
  codeNode.textContent = code;
  parent.append(codeNode, document.createTextNode(label));
}

function createSchemaRow(fields) {
  const row = document.createElement("div");
  row.className = "schema-row";

  fields.forEach((field) => {
    const item = document.createElement("span");
    item.textContent = field;
    row.append(item);
  });

  return row;
}

function createContentBlock(className, fieldName, label, value) {
  const block = document.createElement("div");
  block.className = `content-block ${className}`;

  const title = document.createElement("span");
  title.className = "content-label";
  appendFieldCode(title, fieldName, label);

  const text = document.createElement("p");
  text.textContent = getTextValue(value);

  block.append(title, text);
  return block;
}

function createKeyPointSection(items) {
  const section = document.createElement("section");
  section.className = "detail-section";

  const title = document.createElement("span");
  title.className = "content-label";
  appendFieldCode(title, "keyPoints", "会议重点");

  const list = document.createElement("ol");
  list.className = "keypoint-list";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "--";
    list.append(empty);
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : getTextValue(item?.text);
      list.append(li);
    });
  }

  section.append(title, list);
  return section;
}

function createTodoSection(items) {
  const section = document.createElement("section");
  section.className = "detail-section";

  const title = document.createElement("span");
  title.className = "content-label";
  appendFieldCode(title, "todos", "待办清单");

  const list = document.createElement("ul");
  list.className = "todo-list";

  if (items.length === 0) {
    const empty = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = "todo-box";
    const text = document.createElement("span");
    text.textContent = "--";
    empty.append(marker, text);
    list.append(empty);
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      const marker = document.createElement("span");
      marker.className = "todo-box";

      const content = document.createElement("div");
      const text = document.createElement("div");
      text.textContent = item.text;
      content.append(text);

      const meta = document.createElement("div");
      meta.className = "todo-meta";

      if (item.owner) {
        const owner = document.createElement("span");
        owner.className = "todo-owner";
        owner.textContent = item.owner;
        meta.append(owner);
      }

      if (item.done !== null) {
        const state = document.createElement("span");
        state.className = "todo-state";
        state.textContent = item.done ? "已完成" : "未完成";
        meta.append(state);
      }

      if (meta.childNodes.length > 0) {
        content.append(meta);
      }

      li.append(marker, content);
      list.append(li);
    });
  }

  section.append(title, list);
  return section;
}

function createTagsRow(tags) {
  const row = document.createElement("div");
  row.className = "chip-row";

  const label = document.createElement("span");
  label.className = "content-label";
  appendFieldCode(label, "tags", "自动标签");
  row.append(label);

  if (tags.length === 0) {
    const empty = document.createElement("span");
    empty.className = "chip";
    empty.textContent = "--";
    row.append(empty);
    return row;
  }

  tags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    row.append(chip);
  });

  return row;
}

function createTraceGrid(meeting, tags, displaySource) {
  const trace = document.createElement("div");
  trace.className = "trace-grid";

  [
    ["source", "来源", displaySource],
    ["time", "时间", getTextValue(meeting.time)],
    ["importance", "重要程度", `${formatImportance(meeting.importance)}/10`],
    ["tags", "标签数", `${tags.length} 个`],
  ].forEach(([fieldName, label, value]) => {
    const item = document.createElement("span");
    appendFieldCode(item, fieldName, `${label}：${value}`);
    trace.append(item);
  });

  return trace;
}

function renderMeeting(meeting) {
  latestMeeting.textContent = "";

  if (!meeting || typeof meeting !== "object") {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "暂无会议结果";
    latestMeeting.append(empty);
    latestMeetingMetric.textContent = "0 条";
    latestMeetingSub.textContent = "暂无最近会议";
    return;
  }

  const aiSummary = getTextValue(meeting.aiSummary || meeting.aiContent || meeting.summary);
  const keyPoints = normalizeList(meeting.keyPoints);
  const todos = normalizeList(meeting.todos).map(normalizeTodo);
  const tags = normalizeList(meeting.tags || meeting.tag).map((tag) =>
    typeof tag === "string" ? tag : getTextValue(tag?.text),
  );
  const displaySource = getDisplaySource(meeting.source);

  latestMeetingMetric.textContent = "1 条";
  latestMeetingSub.textContent = getTextValue(meeting.title, "最近会议已同步");

  const card = document.createElement("article");
  card.className = "capsule-card";

  const head = document.createElement("div");
  head.className = "capsule-head";

  const titleWrap = document.createElement("div");
  titleWrap.className = "capsule-title-wrap";

  const sourcePill = document.createElement("span");
  sourcePill.className = "source-pill";
  appendFieldCode(sourcePill, "source", displaySource);

  const title = document.createElement("h3");
  title.className = "capsule-title";
  appendFieldCode(title, "title", getTextValue(meeting.title));

  const meta = document.createElement("div");
  meta.className = "capsule-meta";
  [
    ["time", getTextValue(meeting.time)],
    ["importance", `${formatImportance(meeting.importance)}/10`],
  ].forEach(([fieldName, value]) => {
    const item = document.createElement("span");
    appendFieldCode(item, fieldName, value);
    meta.append(item);
  });

  titleWrap.append(sourcePill, title, meta);

  const score = document.createElement("div");
  score.className = "score-ring";
  score.style.setProperty("--score", `${getImportancePercent(meeting.importance)}%`);

  const scoreInner = document.createElement("div");
  const scoreValue = document.createElement("strong");
  scoreValue.textContent = formatImportance(meeting.importance);
  const scoreLabel = document.createElement("span");
  scoreLabel.textContent = "importance";
  scoreInner.append(scoreValue, scoreLabel);
  score.append(scoreInner);

  head.append(titleWrap, score);

  const compare = document.createElement("div");
  compare.className = "memory-compare";

  const arrow = document.createElement("div");
  arrow.className = "compare-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "AI";

  compare.append(
    createContentBlock("before-block", "rawContent", "原始识别文本", meeting.rawContent),
    arrow,
    createContentBlock("after-block", "aiSummary", "AI 摘要", aiSummary),
  );

  const detail = document.createElement("div");
  detail.className = "meeting-detail-grid";
  detail.append(createKeyPointSection(keyPoints), createTodoSection(todos));

  card.append(
    head,
    createSchemaRow([
      "title",
      "rawContent",
      "aiSummary",
      "keyPoints",
      "todos",
      "tags",
      "source",
      "time",
      "importance",
    ]),
    compare,
    detail,
    createTagsRow(tags),
    createTraceGrid(meeting, tags, displaySource),
  );

  latestMeeting.append(card);
}

function isToday(value) {
  const date = new Date(value);
  const today = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getActivityTone(eventName) {
  if (eventName === "request_meeting_failed") {
    return "activity-failed";
  }

  if (
    eventName === "request_meeting_success" ||
    eventName === "memory_added" ||
    eventName === "memories_archived" ||
    eventName === "feature_voice_transcribe" ||
    eventName === "feature_ai_polish"
  ) {
    return "activity-success";
  }

  if (
    eventName === "start_meeting_click" ||
    eventName === "settings_pause_update" ||
    eventName === "settings_encryption_update" ||
    eventName === "settings_low_power_update" ||
    eventName === "memory_deleted"
  ) {
    return "activity-click";
  }

  return "activity-request";
}

function createActivityLine(item) {
  const line = document.createElement("div");
  line.className = "activity-line";

  const time = document.createElement("span");
  time.className = "activity-time";
  time.textContent = formatActivityTime(item.time);

  const label = document.createElement("span");
  label.className = "activity-label";
  label.textContent = activityLabels[item.event] || item.event || "未知行为";

  line.append(time, label);
  return line;
}

function renderActivityEvents(payload) {
  const events = Array.isArray(payload.events) ? payload.events : [];

  activityStream.textContent = "";
  activityCount.textContent = `${events.length} / 100`;

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "activity-empty";
    empty.textContent = "暂无用户行为";
    activityStream.append(empty);
    return;
  }

  events.forEach((item, index) => {
    const hasDetail = typeof item.detail === "string" && item.detail.trim().length > 0;
    const row = document.createElement(hasDetail ? "details" : "div");
    row.className = `activity-row ${getActivityTone(item.event)}`;

    if (index === 0) {
      row.classList.add("is-latest");
    }

    if (hasDetail) {
      const summary = document.createElement("summary");
      summary.append(createActivityLine(item));

      const detail = document.createElement("p");
      detail.className = "activity-detail";
      detail.textContent = item.detail;

      row.append(summary, detail);
    } else {
      row.append(createActivityLine(item));
    }

    activityStream.append(row);
  });
}

function renderLogs(payload) {
  const logs = Array.isArray(payload.logs) ? payload.logs : [];
  logRows.textContent = "";
  logCount.textContent = `${payload.count ?? logs.length} / ${payload.limit ?? 100}`;
  todayRequestCount.textContent = logs.filter((log) => isToday(log.time)).length;
  updateLastSync();

  if (logs.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "暂无请求日志";
    row.append(cell);
    logRows.append(row);
    return;
  }

  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    if (index === 0) {
      row.className = "is-latest";
    }

    const method = document.createElement("span");
    method.className = `method ${String(log.method).toLowerCase()}`;
    method.textContent = log.method || "--";

    const status = document.createElement("span");
    status.className = `status-code ${statusClass(Number(log.statusCode))}`;
    status.textContent = log.statusCode ?? "--";

    [
      formatLogTime(log.time),
      method,
      log.path || "--",
      status,
      `${log.durationMs ?? 0}ms`,
      log.source || "--",
    ].forEach((value) => {
      const cell = document.createElement("td");
      if (value instanceof Node) {
        cell.append(value);
      } else {
        cell.textContent = value;
      }
      row.append(cell);
    });

    logRows.append(row);
  });
}

function formatBoolean(value) {
  return value ? "true" : "false";
}

async function loadAppRuntime() {
  try {
    const [appState, memoryPayload] = await Promise.all([
      requestJson("/api/app/state"),
      requestJson("/api/memories"),
    ]);
    const memories = Array.isArray(memoryPayload.memories) ? memoryPayload.memories : [];

    dashboardPaused.textContent = formatBoolean(appState.paused);
    dashboardEncryption.textContent = formatBoolean(appState.encryptionEnabled);
    dashboardLowPower.textContent = formatBoolean(appState.lowPowerMode);
    dashboardPrivacy.textContent = formatBoolean(appState.privacyMode);
    dashboardMemoryCount.textContent = memories.length;
    dashboardLastAction.textContent = getTextValue(appState.lastAction, "--");
    appStateUpdatedAt.textContent = getTextValue(appState.updatedAt, "已同步");

    return { appState, memories };
  } catch (error) {
    dashboardPaused.textContent = "异常";
    dashboardEncryption.textContent = "异常";
    dashboardLowPower.textContent = "异常";
    dashboardPrivacy.textContent = "异常";
    appStateUpdatedAt.textContent = "同步失败";
    showAlert(`读取 APP 真实状态失败：${error.message}`, "error");
    throw error;
  }
}

async function loadStatus(showSuccess = false) {
  try {
    const status = await requestJson("/api/status");
    const onlineText = status.online ? "在线" : "离线";
    const aiText = status.aiMode || "Mock AI";
    const esp32Text = status.esp32Status || "待接入";

    backendState.textContent = onlineText;
    serviceStatusText.textContent = onlineText;
    aiMode.textContent = aiText;
    heroAiMode.textContent = aiText;
    esp32State.textContent = esp32Text;
    heroEsp32State.textContent = `ESP32 ${esp32Text}`;
    serverUptimeBase = Number(status.uptimeSeconds) || 0;
    serverUptimeSyncedAt = Date.now();
    refreshUptimeText();

    if (showSuccess) {
      showAlert("服务状态接口响应正常");
    }

    return status;
  } catch (error) {
    backendState.textContent = "异常";
    serviceStatusText.textContent = "异常";
    showAlert(`读取服务状态失败：${error.message}`, "error");
    throw error;
  }
}

async function loadLatest(showSuccess = false) {
  try {
    const latest = await requestJson("/api/meeting/latest");
    renderMeeting(latest);
    renderJson(apiResponse, latest);

    if (showSuccess) {
      showAlert("最近会议已更新");
    }

    return latest;
  } catch (error) {
    latestMeetingMetric.textContent = "异常";
    latestMeetingSub.textContent = "读取最近会议失败";
    showAlert(`读取最近会议失败：${error.message}`, "error");
    throw error;
  }
}

async function loadLogs() {
  try {
    const payload = await requestJson("/api/server/logs");
    renderLogs(payload);
    return payload;
  } catch (error) {
    showAlert(`读取请求日志失败：${error.message}`, "error");
    throw error;
  }
}

async function loadActivityEvents() {
  try {
    const payload = await requestJson("/api/log/events");
    renderActivityEvents(payload);
    return payload;
  } catch (error) {
    showAlert(`读取用户行为流失败：${error.message}`, "error");
    throw error;
  }
}

async function submitMeetingText(button, text) {
  const content = text.trim();

  if (!content) {
    showAlert("请输入会议内容后再测试", "error");
    return;
  }

  setBusy(button, true);

  try {
    const result = await requestJson("/api/meeting/text", {
      method: "POST",
      body: JSON.stringify({
        source: "dashboard-text",
        text: content,
      }),
    });

    renderMeeting(result);
    renderJson(apiResponse, result);
    showAlert("AI 整理测试完成");
    await loadLogs();
  } catch (error) {
    showAlert(`AI 整理测试失败：${error.message}`, "error");
  } finally {
    setBusy(button, false);
  }
}

async function handleAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  setBusy(button, true);

  try {
    if (action === "status") {
      const status = await loadStatus(true);
      renderJson(apiResponse, status);
    }

    if (action === "mock") {
      const result = await requestJson("/api/meeting/mock", { method: "POST" });
      renderMeeting(result);
      renderJson(apiResponse, result);
      showAlert("Mock 会议已生成");
    }

    if (action === "latest") {
      await loadLatest(true);
    }

    if (action === "sampleText") {
      await submitMeetingText(
        button,
        "瞬忆项目演示会议：后端 Dashboard 已接入请求日志，ESP32 采集终端后续通过 /api/meeting/text 上传文本，比赛现场重点展示 APP、后端和 AI 总结的完整链路。",
      );
    }

    await Promise.allSettled([loadLogs(), loadAppRuntime(), loadActivityEvents()]);
  } catch (error) {
    showAlert(`接口测试失败：${error.message}`, "error");
  } finally {
    setBusy(button, false);
  }
}

async function bootstrap() {
  actionButtons.forEach((button) => {
    button.addEventListener("click", handleAction);
  });

  submitText.addEventListener("click", () => {
    submitMeetingText(submitText, meetingText.value);
  });

  refreshLatest.addEventListener("click", async () => {
    setBusy(refreshLatest, true);
    try {
      await loadLatest(true);
      await loadLogs();
    } catch (error) {
      showAlert(`刷新最近会议失败：${error.message}`, "error");
    } finally {
      setBusy(refreshLatest, false);
    }
  });

  await Promise.allSettled([loadStatus(), loadLatest(), loadLogs(), loadActivityEvents(), loadAppRuntime()]);
  window.setInterval(loadAppRuntime, 3000);
  window.setInterval(loadActivityEvents, 2000);
  window.setInterval(loadLogs, 3000);
  window.setInterval(refreshUptimeText, 1000);
}

bootstrap();
