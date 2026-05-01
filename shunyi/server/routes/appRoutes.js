import express from "express";
import { getAppState, updateAppState } from "../store/appStateStore.js";
import { addEvent } from "../store/eventLogStore.js";

const router = express.Router();
const stateKeys = new Set(["paused", "encryptionEnabled", "lowPowerMode", "privacyMode"]);

function getEventSource(req) {
  return req.get("x-shunyi-source") === "android_app" ? "android_app" : "server";
}

router.get("/state", (req, res) => {
  const state = getAppState();

  addEvent({
    event: "app_state_sync",
    source: getEventSource(req),
    detail: `state synced: paused=${state.paused}, encryptionEnabled=${state.encryptionEnabled}, lowPowerMode=${state.lowPowerMode}, privacyMode=${state.privacyMode}`,
  });

  res.json(state);
});

router.post("/state", (req, res) => {
  const partialState = {};

  Object.entries(req.body ?? {}).forEach(([key, value]) => {
    if (stateKeys.has(key) && typeof value === "boolean") {
      partialState[key] = value;
    }
  });

  const state = updateAppState({
    ...partialState,
    lastAction: "app_state_update",
  });

  addEvent({
    event: "app_state_update",
    source: getEventSource(req),
    detail: `state updated: ${Object.keys(partialState).join(", ") || "no valid fields"}`,
  });

  res.json(state);
});

export default router;
