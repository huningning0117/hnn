import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJson } from "../utils/jsonStore.js";

const MAX_EVENT_LOGS = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EVENT_DATA_FILE = path.resolve(__dirname, "../data/events.json");

function formatEventTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}

function normalizeEventLog(log = {}, index = 0) {
  const entry = {
    id: typeof log.id === "string" && log.id.trim() ? log.id.trim() : `event-${index + 1}`,
    time: typeof log.time === "string" && log.time.trim() ? log.time.trim() : formatEventTime(),
    event: typeof log.event === "string" && log.event.trim() ? log.event.trim() : "unknown_event",
    source: typeof log.source === "string" && log.source.trim() ? log.source.trim() : "android_app",
  };

  if (typeof log.detail === "string" && log.detail.trim()) {
    entry.detail = log.detail.trim().slice(0, 300);
  }

  return entry;
}

function loadEventLogs() {
  const loaded = readJson(EVENT_DATA_FILE, []);

  if (!Array.isArray(loaded)) {
    writeJson(EVENT_DATA_FILE, []);
    return [];
  }

  const normalized = loaded.slice(-MAX_EVENT_LOGS).map(normalizeEventLog);
  writeJson(EVENT_DATA_FILE, normalized);
  return normalized;
}

function getNextEventId(logs) {
  return logs.reduce((maxId, log) => {
    const match = /^event-(\d+)$/.exec(log.id || "");
    return match ? Math.max(maxId, Number(match[1]) + 1) : maxId;
  }, 1);
}

const eventLogs = loadEventLogs();
let nextEventId = getNextEventId(eventLogs);

function saveEventLogs() {
  writeJson(EVENT_DATA_FILE, eventLogs);
}

export function addEvent(eventObj = {}) {
  const entry = {
    id: eventObj.id || `event-${nextEventId++}`,
    time: eventObj.time || formatEventTime(),
    event: eventObj.event || "unknown_event",
    source: eventObj.source || "android_app",
  };

  if (typeof eventObj.detail === "string" && eventObj.detail.trim()) {
    entry.detail = eventObj.detail.trim().slice(0, 300);
  }

  eventLogs.push(entry);

  if (eventLogs.length > MAX_EVENT_LOGS) {
    eventLogs.splice(0, eventLogs.length - MAX_EVENT_LOGS);
  }

  saveEventLogs();
  return entry;
}

export function getEvents() {
  return eventLogs.slice().reverse();
}
