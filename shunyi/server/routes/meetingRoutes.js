import express from "express";
import multer from "multer";
import { summarizeMeeting } from "../services/aiService.js";
import { summarizeWithMockAi } from "../services/mockAiService.js";
import { getLatestMeeting, setLatestMeeting } from "../store/memoryStore.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/mock", async (req, res, next) => {
  try {
    const result = await summarizeWithMockAi(undefined, { source: "mock" });
    setLatestMeeting(result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/text", async (req, res, next) => {
  try {
    const { source = "text", text } = req.body ?? {};

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "TEXT_REQUIRED",
        message: "text 不能为空",
      });
    }

    const result = await summarizeMeeting(text, { source });
    setLatestMeeting(result);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/latest", async (req, res, next) => {
  try {
    const latestMeeting = getLatestMeeting();

    if (latestMeeting) {
      return res.json(latestMeeting);
    }

    const result = await summarizeWithMockAi(
      "暂无真实会议记录，当前返回瞬忆项目默认演示会议整理结果。",
      { source: "mock" },
    );

    return res.json({
      ...result,
      message: "暂无会议记录，已返回默认 mock 会议整理结果",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/audio", upload.single("audio"), async (req, res, next) => {
  try {
    const audioName = req.file?.originalname || "audio-demo";
    const result = await summarizeMeeting(
      `收到音频文件 ${audioName}，当前阶段暂不进行真实语音识别，返回瞬忆音频演示会议整理结果。`,
      { source: "audio-demo" },
    );

    setLatestMeeting(result);
    return res.json({
      ...result,
      message: "音频接口已预留，当前返回 mock 会议整理结果",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
