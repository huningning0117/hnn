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

const capsuleHighlights = [
  { title: "AI 修正前", value: "原始碎片", desc: "保留真实来源" },
  { title: "AI 修正后", value: "清晰记忆", desc: "提炼可读内容" },
  { title: "自动归档", value: "5 条", desc: "进入长期记忆" },
  { title: "可回溯", value: "时间线", desc: "地点与来源可查" }
];

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
  meeting: {
    status: "idle",
    progress: 0,
    resultId: ""
  }
};

const app = document.querySelector("#app");
const navButtons = document.querySelectorAll(".nav-item");
const splashScreen = document.querySelector("#splash-screen");
let meetingTimerIds = [];

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
  return (importance / 10).toFixed(1).replace(/\.0$/, "");
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

function createMeetingMemory() {
  const time = formatCurrentTime();
  return {
    id: `meeting-${Date.now()}`,
    type: "meeting",
    title: "ESP32 会议整理结果",
    rawContent: mockMeetingContent.rawContent,
    aiContent: mockMeetingContent.summary,
    keyPoints: [...mockMeetingContent.keyPoints],
    todos: [...mockMeetingContent.todos],
    tag: [...mockMeetingContent.tags],
    time,
    location: "演示现场",
    source: "ESP32 硬件采集",
    importance: 96
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

function completeMeetingRecord() {
  const meetingMemory = createMeetingMemory();
  mockMemories.unshift(meetingMemory);
  state.meeting.status = "complete";
  state.meeting.progress = 100;
  state.meeting.resultId = meetingMemory.id;
  state.expandedId = meetingMemory.id;
  render();
  showToast("已保存到记忆舱");
}

function startMeetingRecord() {
  if (state.meeting.status === "hardware" || state.meeting.status === "ai") {
    return;
  }

  clearMeetingTimers();
  state.meeting.resultId = "";
  setMeetingStatus("hardware");

  meetingTimerIds = [
    window.setTimeout(() => setMeetingStatus("ai"), 1300),
    window.setTimeout(() => {
      completeMeetingRecord();
      clearMeetingTimers();
    }, 2800)
  ];
}

function render() {
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

  return `
    <section class="page">
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
            <span class="metric-value">${mockMemories.length}</span>
            <span class="metric-label">自动归档</span>
          </div>
          <div class="metric-tile">
            <span class="metric-value">A+</span>
            <span class="metric-label">AI 修正质量</span>
          </div>
        </div>
      </section>

      ${renderMeetingRecorder()}

      <div class="section-head">
        <div>
          <h2>功能入口</h2>
          <p class="section-kicker">仅展示授权后的演示流程</p>
        </div>
      </div>

      <div class="feature-grid">
        ${renderFeature("mic", "语音转写", "模拟语音碎片整理")}
        ${renderFeature("spark", "AI 修正", "口语化内容变清晰")}
        ${renderFeature("archive", "自动归档", "按主题生成长期记忆")}
        ${renderFeature("shield", "隐私控制", "暂停、加密、删除入口")}
      </div>

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
  const result = isComplete ? mockMemories.find((item) => item.id === state.meeting.resultId) : null;
  const buttonText = isRunning ? "会议记录进行中" : isComplete ? "再次模拟会议记录" : "开始会议记录";

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
          <small>${isRunning ? escapeHtml(meta.title) : "ESP32 测试文本 + mock AI 整理"}</small>
        </span>
      </button>

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

function renderAiFixCard() {
  const item = mockMemories.find((memory) => memory.id === aiFixPreview.memoryId) || mockMemories[0];

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
  return `
    <button class="feature-card" type="button" data-demo="${escapeHtml(title)}">
      <span class="feature-icon">${icon(iconName)}</span>
      <span>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(desc)}</span>
      </span>
    </button>
  `;
}

function renderFocusCard(item) {
  const config = typeConfig[item.type];
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
      <div class="top-row">
        <div>
          <h1 class="brand-title">记忆舱</h1>
          <span class="brand-subtitle">AI 修正前后对比、自动归档、时间线回溯</span>
        </div>
        <span class="mode-chip">AI 实时整理</span>
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
  return `
    <section class="capsule-overview" aria-label="记忆舱核心能力">
      ${capsuleHighlights.map((item) => `
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
    return `<div class="empty-state">没有匹配的模拟记忆，换个关键词试试。</div>`;
  }

  return list.map(renderMemoryCard).join("");
}

function getCategoryStats() {
  const counts = new Map();
  mockMemories.forEach((memory) => {
    memory.tag.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });

  const preferred = ["会议", "ESP32", "AI 整理", "项目答辩", "待办", "灵感", "学习", "剪贴板", "UI 优化"];
  const preferredStats = preferred
    .filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name) }));
  const fallbackStats = categoryStats.filter((item) => !preferredStats.some((stat) => stat.name === item.name));

  return [...preferredStats, ...fallbackStats].slice(0, 6);
}

function renderMemoryCard(item) {
  const config = typeConfig[item.type];
  const isOpen = state.expandedId === item.id;
  const source = item.source || config.label;
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
        <span>自动分类：${escapeHtml(item.tag[0])}</span>
        <span>自动归档：长期记忆</span>
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
      <p>完整内容：${escapeHtml(item.aiContent)} 该片段已进入 ${escapeHtml(item.tag[0])} 分类，并自动归档到长期记忆库。</p>
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
      <section class="light-card profile-card">
        <div class="profile-hero">
          <div class="avatar-mark">H</div>
          <div>
            <h1>演示用户</h1>
            <p>本地 mock 数据 · 隐私保护已开启</p>
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
            <strong>46m</strong>
            <span>今日使用</span>
          </div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <h2>设备状态</h2>
          <p class="section-kicker">当前 Demo 仅展示连接状态</p>
        </div>
      </div>

      <section class="light-card device-card">
        ${renderDevice("phone", "手机 APP", "在线", "本地 Demo 正常运行")}
        ${renderDevice("cloud", "云端 AI", "同步中", "模拟摘要与分类结果")}
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
        ${renderPrivacy("pause", "一键暂停", "暂停演示采集")}
        ${renderPrivacy("lock", "本地加密", "模拟加密状态")}
        ${renderPrivacy("trash", "片段删除", "删除 mock 卡片")}
        ${renderPrivacy("leaf", "低耗模式", "降低演示刷新")}
      </div>

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
  return `
    <button class="privacy-action" type="button" data-demo="${escapeHtml(title)}">
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
      item.tag.join(" "),
      item.location,
      item.source || "",
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
  });
});

app.addEventListener("click", (event) => {
  const meetingStartButton = event.target.closest("[data-meeting-start]");
  if (meetingStartButton) {
    startMeetingRecord();
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
});

render();
initSplashScreen();
