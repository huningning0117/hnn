import { formatTime } from "../utils/formatTime.js";

const appState = {
  paused: false,
  encryptionEnabled: false,
  lowPowerMode: false,
  privacyMode: true,
  lastAction: "",
  updatedAt: formatTime(),
};

const allowedStateKeys = new Set([
  "paused",
  "encryptionEnabled",
  "lowPowerMode",
  "privacyMode",
  "lastAction",
]);

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
  return getAppState();
}
