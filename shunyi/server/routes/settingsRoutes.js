import express from "express";
import { updateAppState } from "../store/appStateStore.js";
import { addEvent } from "../store/eventLogStore.js";

const router = express.Router();

function getEventSource(req) {
  return req.get("x-shunyi-source") === "android_app" ? "android_app" : "server";
}

function readEnabled(req, res) {
  const enabled = req.body?.enabled;

  if (typeof enabled !== "boolean") {
    res.status(400).json({
      error: "ENABLED_REQUIRED",
      message: "enabled 必须是 boolean",
    });
    return null;
  }

  return enabled;
}

function updateSetting(req, res, field, eventName, lastAction) {
  const enabled = readEnabled(req, res);

  if (enabled === null) {
    return;
  }

  const state = updateAppState({
    [field]: enabled,
    lastAction,
  });

  addEvent({
    event: eventName,
    source: getEventSource(req),
    detail: `${field}=${enabled}`,
  });

  res.json({
    success: true,
    state,
  });
}

router.post("/pause", (req, res) => {
  updateSetting(req, res, "paused", "settings_pause_update", "settings_pause_update");
});

router.post("/encryption", (req, res) => {
  updateSetting(
    req,
    res,
    "encryptionEnabled",
    "settings_encryption_update",
    "settings_encryption_update",
  );
});

router.post("/low-power", (req, res) => {
  updateSetting(
    req,
    res,
    "lowPowerMode",
    "settings_low_power_update",
    "settings_low_power_update",
  );
});

export default router;
