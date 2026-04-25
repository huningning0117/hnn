const fallbackData = {
  locations: [
    {
      id: "gate",
      name: "校门口",
      type: "入口区域",
      description: "校园主要入口，适合作为导览起点。",
      scene: "新生报到、访客入校、活动签到",
      tips: "第一次来校建议从校门口开始导航，方便识别主路方向。",
      icon: "assets/gate.svg",
      x: 50,
      y: 90
    },
    {
      id: "teaching",
      name: "教学楼",
      type: "教学区域",
      description: "日常上课、路演教室和班级活动所在区域。",
      scene: "课程学习、班会、技能节路演",
      tips: "到达后可以先查看楼层指引牌，再前往对应教室。",
      icon: "assets/teaching-building.svg",
      x: 45,
      y: 63
    },
    {
      id: "canteen",
      name: "食堂",
      type: "生活服务",
      description: "学生日常用餐和休息区域，周边也适合短暂停留。",
      scene: "午餐、晚餐、课间休息",
      tips: "高峰期人流较多，建议错峰前往。",
      icon: "assets/canteen.svg",
      x: 70,
      y: 48
    },
    {
      id: "training",
      name: "实训楼",
      type: "实践教学",
      description: "实训课程、作品制作和技能展示常用区域。",
      scene: "实训课程、作品展示、项目调试",
      tips: "进入实训楼请留意设备安全提示和楼层安排。",
      icon: "assets/training-building.svg",
      x: 25,
      y: 40
    },
    {
      id: "library",
      name: "图书馆",
      type: "学习空间",
      description: "阅读、自习、资料查询和安静学习的公共空间。",
      scene: "自习、查阅资料、小组讨论",
      tips: "馆内请保持安静，部分区域可能需要预约座位。",
      icon: "assets/library.svg",
      x: 55,
      y: 25
    },
    {
      id: "event",
      name: "技能节报名点",
      type: "活动服务",
      description: "技能节咨询、报名、签到和信息领取的临时服务点。",
      scene: "活动报名、现场咨询、参赛签到",
      tips: "请提前准备好个人信息或参赛材料，方便快速办理。",
      icon: "assets/event-place.svg",
      x: 80,
      y: 24
    }
  ],
  routes: [
    {
      from: "gate",
      to: "canteen",
      time: "约3分钟",
      distance: "约280米",
      landmarks: ["校门口", "教学楼", "食堂"],
      routeText: "从校门口进入后，沿校园主路向前步行，经过教学楼区域后向右侧前往食堂。沿途可以看到校园指示牌，预计步行约3分钟。",
      aiGuideText: "你好，我是城职灵导。现在为你导航到食堂。从校门口进入后，请沿主路向前，经过教学楼后向右侧前往食堂。全程约3分钟，建议注意校园指示牌。",
      newStudentTip: "第一次来校的同学可以留意道路两侧的建筑标识，食堂入口通常人流更集中。",
      festivalTip: "技能节期间用餐高峰可能提前，建议完成签到后错峰前往。",
      routePoints: [
        { x: 50, y: 90 },
        { x: 50, y: 76 },
        { x: 45, y: 63 },
        { x: 57, y: 55 },
        { x: 70, y: 48 }
      ]
    },
    {
      from: "gate",
      to: "teaching",
      time: "约2分钟",
      distance: "约160米",
      landmarks: ["校门口", "校园主路", "教学楼"],
      routeText: "从校门口进入后沿主路直行，到达中轴路口后稍向左前方即可看到教学楼。路线短且标识清晰，适合作为新生熟悉校园的第一段路线。",
      aiGuideText: "你好，我是城职灵导。现在为你导航到教学楼。请从校门口沿主路直行，到达中轴路口后稍向左前方，教学楼就在你的前方区域。",
      newStudentTip: "如果要找具体教室，到达教学楼后优先查看一楼大厅的楼层索引。",
      festivalTip: "路演教室当前模拟设置在教学楼，实际教室可后续替换为真实地点。",
      routePoints: [
        { x: 50, y: 90 },
        { x: 50, y: 76 },
        { x: 45, y: 63 }
      ]
    },
    {
      from: "gate",
      to: "training",
      time: "约4分钟",
      distance: "约330米",
      landmarks: ["校门口", "教学楼", "实训楼"],
      routeText: "从校门口进入后先沿主路前往教学楼区域，再沿左侧支路前进。经过绿化带后即可到达实训楼，适合前往作品调试和展示区域。",
      aiGuideText: "你好，我是城职灵导。现在为你导航到实训楼。请从校门口沿主路前行，到教学楼附近后转向左侧支路，继续前进即可到达实训楼。",
      newStudentTip: "实训楼内部房间较多，到达后建议核对门牌和楼层信息。",
      festivalTip: "作品展示区当前模拟设置在实训楼，后续可替换为技能节真实展位。",
      routePoints: [
        { x: 50, y: 90 },
        { x: 50, y: 76 },
        { x: 45, y: 63 },
        { x: 34, y: 52 },
        { x: 25, y: 40 }
      ]
    },
    {
      from: "gate",
      to: "library",
      time: "约5分钟",
      distance: "约420米",
      landmarks: ["校门口", "教学楼", "中央步道", "图书馆"],
      routeText: "从校门口进入后沿主路前行，经过教学楼后继续沿中央步道向北走。图书馆位于校园较安静的学习区域，预计步行约5分钟。",
      aiGuideText: "你好，我是城职灵导。现在为你导航到图书馆。请从校门口沿主路前进，经过教学楼后继续沿中央步道向北走，前方安静区域就是图书馆。",
      newStudentTip: "图书馆适合自习和查资料，进入前请确认开放时间。",
      festivalTip: "技能节期间可把图书馆作为临时休息和资料准备点。",
      routePoints: [
        { x: 50, y: 90 },
        { x: 50, y: 76 },
        { x: 45, y: 63 },
        { x: 50, y: 49 },
        { x: 55, y: 25 }
      ]
    },
    {
      from: "gate",
      to: "event",
      time: "约6分钟",
      distance: "约460米",
      landmarks: ["校门口", "教学楼", "食堂路口", "技能节报名点"],
      routeText: "从校门口进入后沿主路前行，经过教学楼后朝食堂方向走，到达路口后继续向右上方前往技能节报名点。沿途可留意活动指示牌。",
      aiGuideText: "你好，我是城职灵导。现在为你导航到技能节报名点。请从校门口沿主路进入，经过教学楼后往食堂方向前进，到路口后继续向右上方走，看到活动标识后即可到达。",
      newStudentTip: "如果不确定方向，可以先找到教学楼和食堂两个明显地标，再继续前往报名点。",
      festivalTip: "到达报名点后请按现场指引完成咨询、签到或报名流程。",
      routePoints: [
        { x: 50, y: 90 },
        { x: 50, y: 76 },
        { x: 45, y: 63 },
        { x: 57, y: 55 },
        { x: 70, y: 48 },
        { x: 75, y: 34 },
        { x: 80, y: 24 }
      ]
    },
    {
      from: "teaching",
      to: "canteen",
      time: "约2分钟",
      distance: "约150米",
      landmarks: ["教学楼", "校园支路", "食堂"],
      routeText: "从教学楼出发后沿右侧支路前行，经过开阔路口后即可看到食堂。路线较短，适合下课后快速前往用餐。",
      aiGuideText: "你好，我是城职灵导。现在为你从教学楼导航到食堂。请从教学楼右侧支路前行，经过开阔路口后继续向前，食堂就在右前方。",
      newStudentTip: "下课高峰人流较多，注意靠右行走。",
      festivalTip: "路演结束后可沿这条路线快速前往食堂休息。",
      routePoints: [
        { x: 45, y: 63 },
        { x: 57, y: 55 },
        { x: 70, y: 48 }
      ]
    },
    {
      from: "canteen",
      to: "library",
      time: "约3分钟",
      distance: "约260米",
      landmarks: ["食堂", "湖边步道", "图书馆"],
      routeText: "从食堂出发后沿北侧步道前进，经过湖边区域后向左上方进入图书馆区域。路线环境较安静，适合饭后前往自习。",
      aiGuideText: "你好，我是城职灵导。现在为你从食堂导航到图书馆。请从食堂北侧离开，沿湖边步道前进，再向左上方进入图书馆区域。",
      newStudentTip: "饭后前往图书馆时请保持安静，提前准备好校园卡或预约信息。",
      festivalTip: "参赛同学可以在图书馆附近整理路演资料。",
      routePoints: [
        { x: 70, y: 48 },
        { x: 62, y: 38 },
        { x: 55, y: 25 }
      ]
    },
    {
      from: "training",
      to: "canteen",
      time: "约3分钟",
      distance: "约250米",
      landmarks: ["实训楼", "中央支路", "食堂"],
      routeText: "从实训楼出发后沿中央支路向右前方走，经过教学楼后方道路，继续前进即可到达食堂。路线适合实训课结束后前往用餐。",
      aiGuideText: "你好，我是城职灵导。现在为你从实训楼导航到食堂。请沿中央支路向右前方前进，经过教学楼后方道路后继续直行，前方就是食堂。",
      newStudentTip: "实训楼出口较多，建议从靠近中央支路的一侧出发。",
      festivalTip: "作品展示区到食堂路线较顺，适合作为活动补给路线。",
      routePoints: [
        { x: 25, y: 40 },
        { x: 40, y: 45 },
        { x: 57, y: 55 },
        { x: 70, y: 48 }
      ]
    }
  ]
};

const state = {
  data: null,
  locationsById: new Map(),
  routesByKey: new Map(),
  currentRoute: null,
  speechUtterance: null
};

const els = {};
const svgNs = "http://www.w3.org/2000/svg";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();

  state.data = await loadLocationData();
  prepareDataIndex();
  renderLocationOptions();
  clearRouteHighlight();
}

function cacheElements() {
  els.startBtn = document.querySelector("#startExperienceBtn");
  els.routeForm = document.querySelector("#routeForm");
  els.fromSelect = document.querySelector("#fromSelect");
  els.toSelect = document.querySelector("#toSelect");
  els.routeNotice = document.querySelector("#routeNotice");
  els.routeResultSection = document.querySelector("#routeResultSection");
  els.routeTitle = document.querySelector("#routeTitle");
  els.routeText = document.querySelector("#routeText");
  els.routeTime = document.querySelector("#routeTime");
  els.routeTimeDetail = document.querySelector("#routeTimeDetail");
  els.routeDistance = document.querySelector("#routeDistance");
  els.routeLandmarks = document.querySelector("#routeLandmarks");
  els.newStudentTip = document.querySelector("#newStudentTip");
  els.festivalTip = document.querySelector("#festivalTip");
  els.playSpeechBtn = document.querySelector("#playSpeechBtn");
  els.stopSpeechBtn = document.querySelector("#stopSpeechBtn");
  els.speechStatus = document.querySelector("#speechStatus");
  els.mapState = document.querySelector("#mapState");
  els.routeHighlight = document.querySelector("#routeHighlight");
  els.routeMarkers = document.querySelector("#routeMarkers");
  els.destinationSection = document.querySelector("#destinationSection");
  els.destinationIcon = document.querySelector("#destinationIcon");
  els.destinationName = document.querySelector("#destinationName");
  els.destinationType = document.querySelector("#destinationType");
  els.destinationDescription = document.querySelector("#destinationDescription");
  els.destinationScene = document.querySelector("#destinationScene");
  els.destinationTips = document.querySelector("#destinationTips");
  els.navigatorSection = document.querySelector("#navigatorSection");
}

function bindEvents() {
  els.startBtn.addEventListener("click", () => {
    els.navigatorSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.routeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    generateRoute({ scrollToResult: true });
  });

  els.playSpeechBtn.addEventListener("click", playSpeechGuide);
  els.stopSpeechBtn.addEventListener("click", stopSpeechGuide);

  document.querySelectorAll(".quick-btn").forEach((button) => {
    button.addEventListener("click", () => {
      els.fromSelect.value = "gate";
      els.toSelect.value = button.dataset.target;
      generateRoute({ scrollToResult: true });
    });
  });
}

async function loadLocationData() {
  try {
    const response = await fetch("data/locations.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.info("使用内置模拟数据运行。双击 index.html 时，部分浏览器会限制读取本地 JSON 文件。", error);
    return fallbackData;
  }
}

function prepareDataIndex() {
  state.locationsById.clear();
  state.routesByKey.clear();

  state.data.locations.forEach((location) => {
    state.locationsById.set(location.id, location);
  });

  state.data.routes.forEach((route) => {
    state.routesByKey.set(getRouteKey(route.from, route.to), route);
  });
}

function renderLocationOptions() {
  const options = state.data.locations
    .map((location) => `<option value="${location.id}">${location.name}</option>`)
    .join("");

  els.fromSelect.innerHTML = options;
  els.toSelect.innerHTML = options;
  els.fromSelect.value = "gate";
  els.toSelect.value = "canteen";
}

function generateRoute({ scrollToResult = false } = {}) {
  stopSpeechGuide({ silent: true });

  const fromId = els.fromSelect.value;
  const toId = els.toSelect.value;
  const fromLocation = state.locationsById.get(fromId);
  const toLocation = state.locationsById.get(toId);

  if (fromId === toId) {
    showNotice("起点和终点不能相同，请重新选择。");
    clearRouteHighlight();
    els.routeResultSection.classList.add("is-hidden");
    els.destinationSection.classList.add("is-hidden");
    return;
  }

  const route = state.routesByKey.get(getRouteKey(fromId, toId));
  if (!route) {
    showNotice("当前Demo暂未录入该路线，建议选择校门口作为起点进行体验。");
    clearRouteHighlight();
    els.routeResultSection.classList.add("is-hidden");
    els.destinationSection.classList.add("is-hidden");
    return;
  }

  state.currentRoute = route;
  showNotice("路线已生成，地图和目的地卡片已同步更新。", "ok");
  renderRouteResult(route, fromLocation, toLocation);
  renderDestinationCard(toLocation);
  renderRouteHighlight(route, fromLocation, toLocation);

  if (scrollToResult) {
    window.setTimeout(() => {
      els.routeResultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
}

function renderRouteResult(route, fromLocation, toLocation) {
  els.routeTitle.textContent = `${fromLocation.name} → ${toLocation.name}`;
  els.routeText.textContent = route.routeText;
  els.routeTime.textContent = route.time;
  els.routeTimeDetail.textContent = route.time;
  els.routeDistance.textContent = route.distance;
  els.routeLandmarks.textContent = route.landmarks.join(" → ");
  els.newStudentTip.textContent = route.newStudentTip;
  els.festivalTip.textContent = route.festivalTip;
  els.speechStatus.textContent = "";
  els.speechStatus.classList.remove("is-ok");
  els.routeResultSection.classList.remove("is-hidden");
}

function renderDestinationCard(location) {
  els.destinationIcon.src = location.icon;
  els.destinationIcon.alt = `${location.name}图标`;
  els.destinationName.textContent = location.name;
  els.destinationType.textContent = location.type;
  els.destinationDescription.textContent = location.description;
  els.destinationScene.textContent = location.scene;
  els.destinationTips.textContent = location.tips;
  els.destinationSection.classList.remove("is-hidden");
}

function renderRouteHighlight(route, fromLocation, toLocation) {
  const points = route.routePoints.map((point) => `${point.x},${point.y}`).join(" ");
  els.routeHighlight.setAttribute("points", points);
  els.routeHighlight.classList.add("is-active");
  els.mapState.textContent = `${fromLocation.name} → ${toLocation.name}`;

  document.querySelectorAll(".map-building").forEach((building) => {
    building.classList.toggle("is-start", building.dataset.locationId === fromLocation.id);
    building.classList.toggle("is-end", building.dataset.locationId === toLocation.id);
  });

  renderRouteMarkers(fromLocation, toLocation);
}

function renderRouteMarkers(fromLocation, toLocation) {
  els.routeMarkers.innerHTML = "";
  els.routeMarkers.appendChild(createMarker(fromLocation, "起", "route-start", "#1e88ff"));
  els.routeMarkers.appendChild(createMarker(toLocation, "终", "route-end", "#20c997"));
}

function createMarker(location, label, className, color) {
  const marker = document.createElementNS(svgNs, "g");
  marker.setAttribute("class", `route-marker ${className}`);
  marker.setAttribute("transform", `translate(${location.x} ${location.y - 10})`);

  const circle = document.createElementNS(svgNs, "circle");
  circle.setAttribute("r", "4.2");
  circle.setAttribute("fill", color);

  const text = document.createElementNS(svgNs, "text");
  text.setAttribute("y", "1.1");
  text.textContent = label;

  marker.append(circle, text);
  return marker;
}

function clearRouteHighlight() {
  state.currentRoute = null;
  els.routeHighlight.setAttribute("points", "");
  els.routeHighlight.classList.remove("is-active");
  els.routeMarkers.innerHTML = "";
  els.mapState.textContent = "等待生成路线";
  document.querySelectorAll(".map-building").forEach((building) => {
    building.classList.remove("is-start", "is-end");
  });
}

function playSpeechGuide() {
  if (!state.currentRoute) {
    showSpeechStatus("请先生成一条AI导览路线。");
    return;
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    showSpeechStatus("当前浏览器暂不支持语音播放，但可以查看文字导览。");
    return;
  }

  stopSpeechGuide({ silent: true });

  const title = els.routeTitle.textContent;
  const speechText = `${title}。${state.currentRoute.aiGuideText} 途经地标：${state.currentRoute.landmarks.join("，")}。`;
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = "zh-CN";
  utterance.rate = 0.94;
  utterance.pitch = 1.02;
  utterance.onend = () => {
    if (state.speechUtterance === utterance) {
      state.speechUtterance = null;
      showSpeechStatus("语音导览已播放完成。", "ok");
    }
  };
  utterance.onerror = () => {
    if (state.speechUtterance === utterance) {
      state.speechUtterance = null;
      showSpeechStatus("语音播放被中断，可以再次点击播放。");
    }
  };

  state.speechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  showSpeechStatus("正在播放语音导览。", "ok");
}

function stopSpeechGuide(options = {}) {
  state.speechUtterance = null;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (!options.silent && els.speechStatus) {
    showSpeechStatus("语音导览已停止。", "ok");
  }
}

function showNotice(message, type = "error") {
  els.routeNotice.textContent = message;
  els.routeNotice.classList.toggle("is-ok", type === "ok");
}

function showSpeechStatus(message, type = "error") {
  els.speechStatus.textContent = message;
  els.speechStatus.classList.toggle("is-ok", type === "ok");
}

function getRouteKey(from, to) {
  return `${from}->${to}`;
}
