import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatTime } from "../utils/formatTime.js";
import { readJson, writeJson } from "../utils/jsonStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_STATE_DATA_FILE = path.resolve(__dirname, "../data/appState.json");

const defaultAppState = {
  paused: false,
  privacyMode: true,
  lastAction: "",
  updatedAt: formatTime(),
};

const allowedStateKeys = new Set([
  "paused",
  "privacyMode",
  "lastAction",
]);

function normalizeAppState(value = {}) {
  return {
    paused: Boolean(value.paused),
    privacyMode: value.privacyMode !== false,
    lastAction: typeof value.lastAction === "string" ? value.lastAction : "",
    updatedAt: typeof value.updatedAt === "string" && value.updatedAt.trim()
      ? value.updatedAt.trim()
      : formatTime(),
  };
}

const appState = normalizeAppState(readJson(APP_STATE_DATA_FILE, defaultAppState));
writeJson(APP_STATE_DATA_FILE, appState);

export function getAppState() {
  return { ...appState };
}

export function updateAppState(partialState = {}) {
  Object.entries(partialState).forEach(([key, value]) => {
    if (allowedStateKeys.has(key)) {
      appState[key] = value;
    }
  });

  appState.updatedAt = formatTime();
  writeJson(APP_STATE_DATA_FILE, appState);
  return getAppState();
}
