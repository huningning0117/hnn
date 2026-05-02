import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJson } from "../utils/jsonStore.js";

const MAX_REQUEST_LOGS = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_LOG_DATA_FILE = path.resolve(__dirname, "../data/serverLogs.json");

function normalizeRequestLog(log = {}) {
  return {
    time: log.time || new Date().toISOString(),
    method: log.method || "UNKNOWN",
    path: log.path || "/",
    statusCode: Number(log.statusCode) || 0,
    durationMs: Number(log.durationMs) || 0,
    source: log.source || "unknown",
  };
}

function loadRequestLogs() {
  const loaded = readJson(SERVER_LOG_DATA_FILE, []);

  if (!Array.isArray(loaded)) {
    writeJson(SERVER_LOG_DATA_FILE, []);
    return [];
  }

  const normalized = loaded.slice(-MAX_REQUEST_LOGS).map(normalizeRequestLog);
  writeJson(SERVER_LOG_DATA_FILE, normalized);
  return normalized;
}

const requestLogs = loadRequestLogs();

function saveRequestLogs() {
  writeJson(SERVER_LOG_DATA_FILE, requestLogs);
}

export function addRequestLog(log) {
  const entry = normalizeRequestLog(log);

  requestLogs.push(entry);

  if (requestLogs.length > MAX_REQUEST_LOGS) {
    requestLogs.splice(0, requestLogs.length - MAX_REQUEST_LOGS);
  }

  saveRequestLogs();
  return entry;
}

export function getRequestLogs() {
  return requestLogs.slice().reverse();
}

export function getRequestLogLimit() {
  return MAX_REQUEST_LOGS;
}
