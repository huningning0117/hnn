import express from "express";
import {
  addMemory,
  archiveMemories,
  deleteMemory,
  getMemories,
} from "../store/memoryDataStore.js";
import { addEvent } from "../store/eventLogStore.js";

const router = express.Router();

function getEventSource(req) {
  return req.get("x-shunyi-source") === "android_app" ? "android_app" : "server";
}

router.get("/", (req, res) => {
  const memories = getMemories();

  addEvent({
    event: "memories_sync",
    source: getEventSource(req),
    detail: `memories synced: count=${memories.length}`,
  });

  res.json({ memories });
});

router.post("/", (req, res) => {
  const memory = addMemory({
    ...req.body,
    source: req.body?.source || getEventSource(req),
  });

  addEvent({
    event: "memory_added",
    source: getEventSource(req),
    detail: `memory added: id=${memory.id}, type=${memory.type}, tags=${memory.tags.length}`,
  });

  res.status(201).json(memory);
});

router.delete("/:id", (req, res) => {
  const deleted = deleteMemory(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      error: "MEMORY_NOT_FOUND",
      message: "记忆片段不存在",
    });
  }

  addEvent({
    event: "memory_deleted",
    source: getEventSource(req),
    detail: `memory deleted: id=${deleted.id}, type=${deleted.type}`,
  });

  return res.json({
    success: true,
    deletedId: deleted.id,
  });
});

router.post("/archive", (req, res) => {
  const result = archiveMemories({
    id: req.body?.id,
    archived: req.body?.archived,
  });

  if (result.notFound) {
    return res.status(404).json({
      error: "MEMORY_NOT_FOUND",
      message: "记忆片段不存在",
    });
  }

  addEvent({
    event: "memories_archived",
    source: getEventSource(req),
    detail: `memories archived: count=${result.archivedCount}, categories=${Object.keys(result.categories).length}`,
  });

  res.json({
    success: true,
    ...result,
  });
});

export default router;
