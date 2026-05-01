import express from "express";
import { addEvent, getEvents } from "../store/eventLogStore.js";

const router = express.Router();
const allowedSources = new Set(["android_app", "dashboard", "esp32", "server"]);

function normalizeSource(source) {
  return allowedSources.has(source) ? source : "android_app";
}

router.post("/event", (req, res) => {
  const { event, source = "android_app", detail } = req.body ?? {};

  if (typeof event !== "string" || event.trim().length === 0) {
    return res.status(400).json({
      error: "EVENT_REQUIRED",
      message: "event 不能为空",
    });
  }

  addEvent({
    event: event.trim(),
    source: normalizeSource(source),
    detail,
  });

  return res.json({ success: true });
});

router.get("/events", (req, res) => {
  res.json({
    events: getEvents(),
  });
});

export default router;
