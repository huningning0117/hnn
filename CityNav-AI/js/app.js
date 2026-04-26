const fallbackData = {
  locations: [
    {
      id: "gate",
      name: "校门口",
      type: "入校入口",
      description: "校园主入口，适合作为新生报到、访客入校和活动集合的第一站。",
      scene: "新生报到、访客入校、技能节签到",
      tips: "第一次来校建议从校门口开始出发，主路识别度最高。",
      icon: "assets/gate.svg",
      x: 50,
      y: 91
    },
    {
      id: "teaching",
      name: "教学楼",
      type: "教学区域",
      description: "日常上课、路演教室和班级活动常用区域，位于校园中轴附近。",
      scene: "课程学习、班会、技能节路演",
      tips: "到达后先查看楼层索引，再前往对应教室，可减少绕路。",
      icon: "assets/teaching-building.svg",
      x: 45,
      y: 62
    },
    {
      id: "training",
      name: "实训楼",
      type: "实践教学",
      description: "实训课程、作品制作和技能展示常用区域，适合安排项目演示。",
      scene: "实训课程、作品展示、项目调试",
      tips: "进入实训楼请留意设备安全提示和楼层安排。",
      icon: "assets/training-building.svg",
      x: 24,
      y: 42
    },
    {
      id: "canteen",
      name: "食堂",
      type: "生活服务",
      description: "学生日常用餐和短暂停留区域，靠近校园湖边步道。",
      scene: "午餐、晚餐、课间休息",
      tips: "高峰期人流较多，建议错峰前往并留意入口排队方向。",
      icon: "assets/canteen.svg",
      x: 72,
      y: 50
    },
    {
      id: "library",
      name: "图书馆",
      type: "学习空间",
      description: "阅读、自习、资料查询和小组讨论的公共学习空间。",
      scene: "自习、查阅资料、小组讨论",
      tips: "馆内请保持安静，部分区域可能需要预约座位。",
      icon: "assets/library.svg",
      x: 55,
      y: 25
    },
    {
      id: "event",
      name: "活动中心",
      type: "活动服务",
      description: "技能节咨询、报名、签到和信息领取的临时服务点。",
      scene: "活动报名、现场咨询、参赛签到",
      tips: "请提前准备好个人信息或参赛材料，便于快速办理。",
      icon: "assets/event-place.svg",
      x: 82,
      y: 25
    }
  ],
  paths: [
    { id: "gate-teaching", from: "gate", to: "teaching", name: "中央主路", distance: 190, time: 3, note: "道路宽阔，沿途指示牌最明显", points: [{ x: 50, y: 78 }, { x: 47, y: 70 }] },
    { id: "teaching-canteen", from: "teaching", to: "canteen", name: "东侧支路", distance: 150, time: 2, note: "经过开阔路口后可看到食堂入口", points: [{ x: 57, y: 55 }] },
    { id: "teaching-training", from: "teaching", to: "training", name: "实训支路", distance: 140, time: 2, note: "靠近绿化带，适合前往作品展示区", points: [{ x: 36, y: 54 }, { x: 30, y: 48 }] },
    { id: "teaching-library", from: "teaching", to: "library", name: "中轴步道", distance: 210, time: 4, note: "一路向北，环境较安静", points: [{ x: 50, y: 49 }] },
    { id: "canteen-event", from: "canteen", to: "event", name: "活动指引路", distance: 170, time: 3, note: "技能节期间通常会有现场指引牌", points: [{ x: 75, y: 38 }] },
    { id: "library-event", from: "library", to: "event", name: "北侧连廊", distance: 120, time: 2, note: "适合从自习区快速前往活动现场", points: [{ x: 66, y: 24 }, { x: 74, y: 24 }] },
    { id: "training-library", from: "training", to: "library", name: "西北步道", distance: 230, time: 4, note: "途经实训楼侧门和安静学习区", points: [{ x: 35, y: 38 }, { x: 45, y: 31 }] },
    { id: "canteen-library", from: "canteen", to: "library", name: "湖边步道", distance: 180, time: 3, note: "饭后前往图书馆的舒适路线", points: [{ x: 64, y: 38 }] }
  ]
};

const state = {
  data: null,
  locationsById: new Map(),
  graph: new Map(),
  currentRoute: null,
  speechUtterance: null
};

const els = {};
const svgNs = "http://www.w3.org/2000/svg";
const defaultStartId = "gate";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();

  state.data = await loadLocationData();
  buildIndexes();
  renderLocationOptions();
  renderSearchSuggestions();

  els.fromSelect.value = defaultStartId;
  els.toSelect.value = "event";
  generateRoute({ silent: true });
}

function cacheElements() {
  els.routeForm = document.querySelector("#routeForm");
  els.fromSelect = document.querySelector("#fromSelect");
  els.toSelect = document.querySelector("#toSelect");
  els.searchInput = document.querySelector("#searchInput");
  els.searchBtn = document.querySelector("#searchBtn");
  els.locationSuggestions = document.querySelector("#locationSuggestions");
  els.routeNotice = document.querySelector("#routeNotice");
  els.heroRouteHint = document.querySelector("#heroRouteHint");
  els.routeTitle = document.querySelector("#routeTitle");
  els.routeTime = document.querySelector("#routeTime");
  els.routeDistance = document.querySelector("#routeDistance");
  els.routeText = document.querySelector("#routeText");
  els.routeSteps = document.querySelector("#routeSteps");
  els.routeLandmarks = document.querySelector("#routeLandmarks");
  els.destinationName = document.querySelector("#destinationName");
  els.destinationType = document.querySelector("#destinationType");
  els.destinationDescription = document.querySelector("#destinationDescription");
  els.destinationScene = document.querySelector("#destinationScene");
  els.destinationTips = document.querySelector("#destinationTips");
  els.mapState = document.querySelector("#mapState");
  els.routeHighlight = document.querySelector("#routeHighlight");
  els.routeMarkers = document.querySelector("#routeMarkers");
  els.playSpeechBtn = document.querySelector("#playSpeechBtn");
  els.stopSpeechBtn = document.querySelector("#stopSpeechBtn");
  els.speechStatus = document.querySelector("#speechStatus");
  els.compassDirection = document.querySelector("#compassDirection");
  els.compassHint = document.querySelector("#compassHint");
}

function bindEvents() {
  els.routeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    generateRoute();
  });

  els.searchBtn.addEventListener("click", handleSearchSubmit);
  els.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  });
  els.searchInput.addEventListener("change", () => {
    if (els.searchInput.value.trim()) {
      handleSearchSubmit();
    }
  });

  document.querySelectorAll(".quick-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const toId = button.dataset.to;
      if (!toId) {
        return;
      }
      els.fromSelect.value = defaultStartId;
      els.toSelect.value = toId;
      generateRoute();
    });
  });

  document.querySelectorAll(".place").forEach((place) => {
    place.addEventListener("click", () => chooseMapDestination(place.dataset.locationId));
    place.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chooseMapDestination(place.dataset.locationId);
      }
    });
  });

  document.querySelectorAll(".bottom-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".bottom-tab").forEach((tab) => tab.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  els.playSpeechBtn.addEventListener("click", playSpeechGuide);
  els.stopSpeechBtn.addEventListener("click", stopSpeechGuide);
}

async function loadLocationData() {
  try {
    const response = await fetch("data/locations.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.info("使用内置模拟数据运行。直接打开 index.html 时，部分浏览器会限制读取本地 JSON 文件。", error);
    return fallbackData;
  }
}

function buildIndexes() {
  state.locationsById.clear();
  state.graph.clear();

  state.data.locations.forEach((location) => {
    state.locationsById.set(location.id, location);
    state.graph.set(location.id, []);
  });

  state.data.paths.forEach((path) => {
    addGraphEdge(path.from, path.to, path, false);
    addGraphEdge(path.to, path.from, path, true);
  });
}

function addGraphEdge(from, to, path, reversed) {
  state.graph.get(from).push({
    id: path.id,
    from,
    to,
    name: path.name,
    distance: path.distance,
    time: path.time,
    note: path.note,
    points: reversed ? [...path.points].reverse() : [...path.points]
  });
}

function renderLocationOptions() {
  const options = state.data.locations
    .map((location) => `<option value="${location.id}">${location.name}</option>`)
    .join("");

  els.fromSelect.innerHTML = options;
  els.toSelect.innerHTML = options;
}

function renderSearchSuggestions() {
  els.locationSuggestions.innerHTML = state.data.locations
    .filter((location) => location.id !== defaultStartId)
    .map((location) => `<option value="${location.name}"></option>`)
    .join("");
}

function handleSearchSubmit() {
  const keyword = els.searchInput.value.trim();
  if (!keyword) {
    showNotice("输入地点名称后即可切换路线。");
    return;
  }

  const matchedLocation = findLocationByKeyword(keyword);
  if (!matchedLocation) {
    showNotice("没有匹配到这个地点，可尝试“图书馆”“食堂”或点击下方地图。");
    return;
  }

  if (matchedLocation.id === defaultStartId) {
    showNotice("校门口已经是默认出发点，请选择其他目的地。");
    return;
  }

  els.fromSelect.value = defaultStartId;
  els.toSelect.value = matchedLocation.id;
  generateRoute();
}

function findLocationByKeyword(keyword) {
  const normalizedKeyword = keyword.toLowerCase();
  return state.data.locations.find((location) => {
    return location.name.toLowerCase().includes(normalizedKeyword) || location.type.toLowerCase().includes(normalizedKeyword);
  });
}

function chooseMapDestination(locationId) {
  if (!locationId || !state.locationsById.has(locationId)) {
    return;
  }

  if (locationId === defaultStartId) {
    showNotice("校门口为默认起点，点击其他地点可切换路线。");
    return;
  }

  els.fromSelect.value = defaultStartId;
  els.toSelect.value = locationId;
  generateRoute();
}

function generateRoute({ silent = false } = {}) {
  stopSpeechGuide({ silent: true });

  const fromId = els.fromSelect.value || defaultStartId;
  const toId = els.toSelect.value;
  const fromLocation = state.locationsById.get(fromId);
  const toLocation = state.locationsById.get(toId);

  if (!fromLocation || !toLocation) {
    showNotice("路线数据尚未准备好，请稍后重试。");
    clearRouteHighlight();
    return;
  }

  if (fromId === toId) {
    showNotice("起点和终点不能相同，请重新选择。");
    clearRouteHighlight();
    return;
  }

  const route = findShortestRoute(fromId, toId);
  if (!route) {
    showNotice("当前地点之间暂未录入可通行路线，请换一个目的地试试。");
    clearRouteHighlight();
    return;
  }

  state.currentRoute = buildRouteViewModel(route, fromLocation, toLocation);
  renderRoute(state.currentRoute);
  renderRouteHighlight(state.currentRoute);

  showNotice(
    silent
      ? "默认路线已准备好，可继续搜索其他地点或点击地图切换。"
      : `已切换到 ${toLocation.name} 路线。`,
    "ok"
  );
}

function findShortestRoute(fromId, toId) {
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(state.data.locations.map((location) => location.id));

  state.data.locations.forEach((location) => {
    distances.set(location.id, Number.POSITIVE_INFINITY);
  });
  distances.set(fromId, 0);

  while (unvisited.size > 0) {
    const currentId = [...unvisited].reduce((bestId, candidateId) => {
      return distances.get(candidateId) < distances.get(bestId) ? candidateId : bestId;
    });

    if (distances.get(currentId) === Number.POSITIVE_INFINITY) {
      return null;
    }

    if (currentId === toId) {
      break;
    }

    unvisited.delete(currentId);
    state.graph.get(currentId).forEach((edge) => {
      if (!unvisited.has(edge.to)) {
        return;
      }

      const candidateDistance = distances.get(currentId) + edge.distance;
      if (candidateDistance < distances.get(edge.to)) {
        distances.set(edge.to, candidateDistance);
        previous.set(edge.to, { nodeId: currentId, edge });
      }
    });
  }

  const segments = [];
  let cursor = toId;
  while (cursor !== fromId) {
    const previousStep = previous.get(cursor);
    if (!previousStep) {
      return null;
    }
    segments.unshift(previousStep.edge);
    cursor = previousStep.nodeId;
  }

  return {
    fromId,
    toId,
    segments,
    distance: segments.reduce((sum, segment) => sum + segment.distance, 0),
    time: segments.reduce((sum, segment) => sum + segment.time, 0)
  };
}

function buildRouteViewModel(route, fromLocation, toLocation) {
  const landmarks = [fromLocation.name];
  route.segments.forEach((segment) => {
    landmarks.push(state.locationsById.get(segment.to).name);
  });

  const detailSteps = route.segments.map((segment) => {
    const target = state.locationsById.get(segment.to);
    return `沿${segment.name}前往${target.name}，${segment.note}。`;
  });

  return {
    fromLocation,
    toLocation,
    distance: route.distance,
    time: route.time,
    routePoints: buildRoutePoints(route.segments, fromLocation),
    landmarks,
    detailSteps,
    routeText: `从${fromLocation.name}出发，预计${formatTime(route.time)}可到达${toLocation.name}，沿途经过${landmarks.slice(1).join("、")}。`,
    voiceText: `你好，我是城职灵导。现在为你讲解从${fromLocation.name}到${toLocation.name}的路线，预计${formatTime(route.time)}，全程${formatDistance(route.distance)}。${detailSteps.join("")}到达后，${toLocation.tips}`,
    landmarksText: `途经地标：${landmarks.join(" · ")}`,
    listSteps: buildListSteps(route, fromLocation, toLocation, landmarks)
  };
}

function buildRoutePoints(segments, fromLocation) {
  const points = [{ x: fromLocation.x, y: fromLocation.y }];
  segments.forEach((segment) => {
    segment.points.forEach((point) => points.push(point));
    const target = state.locationsById.get(segment.to);
    points.push({ x: target.x, y: target.y });
  });
  return points;
}

function buildListSteps(route, fromLocation, toLocation, landmarks) {
  return [
    {
      tone: "start",
      label: "起点",
      text: fromLocation.name
    },
    {
      tone: "mid",
      label: "步行路线",
      text: `${formatTime(route.time)} · ${route.segments.map((segment) => segment.name).join(" / ")}`
    },
    {
      tone: "end",
      label: "终点",
      text: `${toLocation.name} · ${landmarks.slice(1, 3).join("、") || toLocation.type}`
    }
  ];
}

function renderRoute(route) {
  els.heroRouteHint.textContent = `从${route.fromLocation.name}前往${route.toLocation.name}`;
  els.searchInput.value = route.toLocation.name;

  els.routeTitle.textContent = `${route.toLocation.name}校园动线`;
  els.routeTime.textContent = formatTime(route.time);
  els.routeDistance.textContent = formatDistance(route.distance);
  els.routeText.textContent = route.routeText;
  els.routeLandmarks.textContent = route.landmarksText;

  els.destinationName.textContent = route.toLocation.name;
  els.destinationType.textContent = route.toLocation.type;
  els.destinationScene.textContent = route.toLocation.scene;
  els.destinationDescription.textContent = route.toLocation.description;
  els.destinationTips.textContent = route.toLocation.tips;

  const { directionName, hint } = buildCompassSummary(route);
  els.compassDirection.textContent = `${directionName}方向`;
  els.compassHint.textContent = hint;
  els.speechStatus.textContent = "点击语音条可播放路线讲解。";
  els.speechStatus.classList.remove("is-ok");

  els.routeSteps.innerHTML = "";
  route.listSteps.forEach((step) => {
    const item = document.createElement("li");
    item.className = `route-step route-step-${step.tone}`;
    item.innerHTML = `
      <span class="route-step-dot" aria-hidden="true"></span>
      <div class="route-step-copy">
        <strong>${step.label}</strong>
        <p>${step.text}</p>
      </div>
    `;
    els.routeSteps.appendChild(item);
  });
}

function buildCompassSummary(route) {
  const [firstPoint, secondPoint] = route.routePoints;
  const dx = secondPoint.x - firstPoint.x;
  const dy = secondPoint.y - firstPoint.y;
  const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  const directionNames = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const directionName = directionNames[Math.round(angle / 45) % directionNames.length];
  const firstSegment = route.detailSteps[0] || "按当前高亮路线前进。";

  return {
    directionName,
    hint: `先朝${directionName}方向移动，${firstSegment}`
  };
}

function renderRouteHighlight(route) {
  const points = route.routePoints.map((point) => `${point.x},${point.y}`).join(" ");
  els.routeHighlight.setAttribute("points", points);
  els.routeHighlight.classList.add("is-active");
  els.mapState.textContent = `${route.fromLocation.name}到${route.toLocation.name}`;

  document.querySelectorAll(".place").forEach((place) => {
    place.classList.toggle("is-start", place.dataset.locationId === route.fromLocation.id);
    place.classList.toggle("is-end", place.dataset.locationId === route.toLocation.id);
  });

  renderRouteMarkers(route.fromLocation, route.toLocation);
}

function renderRouteMarkers(fromLocation, toLocation) {
  els.routeMarkers.innerHTML = "";
  els.routeMarkers.appendChild(createMarker(fromLocation, "起", "#4c86ff"));
  els.routeMarkers.appendChild(createMarker(toLocation, "终", "#4ac2a1"));
}

function createMarker(location, label, color) {
  const marker = document.createElementNS(svgNs, "g");
  marker.setAttribute("class", "route-marker");
  marker.setAttribute("transform", `translate(${location.x} ${location.y - 10})`);

  const circle = document.createElementNS(svgNs, "circle");
  circle.setAttribute("r", "4.1");
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
  els.mapState.textContent = "等待路线生成";
  document.querySelectorAll(".place").forEach((place) => {
    place.classList.remove("is-start", "is-end");
  });
}

function playSpeechGuide() {
  if (!state.currentRoute) {
    showSpeechStatus("请先生成一条路线。");
    return;
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    showSpeechStatus("当前浏览器暂不支持语音播放，可继续查看地图和文字路线。");
    return;
  }

  stopSpeechGuide({ silent: true });

  const utterance = new SpeechSynthesisUtterance(state.currentRoute.voiceText);
  utterance.lang = "zh-CN";
  utterance.rate = 0.94;
  utterance.pitch = 1.02;
  utterance.onend = () => {
    if (state.speechUtterance === utterance) {
      state.speechUtterance = null;
      showSpeechStatus("语音导览播放完成。", "ok");
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

  if (!options.silent) {
    showSpeechStatus("语音导览已停止。");
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

function formatDistance(distance) {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} 公里` : `${distance} 米`;
}

function formatTime(minutes) {
  return `约 ${minutes} 分钟`;
}
