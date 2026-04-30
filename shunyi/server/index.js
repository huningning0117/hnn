import "dotenv/config";
import cors from "cors";
import express from "express";
import meetingRoutes from "./routes/meetingRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

function formatLocalLogTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(
      `${formatLocalLogTime()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
});

app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    service: "shunyi-server",
    message: "瞬忆后端服务运行中",
  });
});

app.use("/api/meeting", meetingRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "接口不存在",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: "INVALID_JSON",
      message: "请求 JSON 格式不正确",
    });
  }

  return res.status(error.status || 500).json({
    error: error.code || "INTERNAL_SERVER_ERROR",
    message: error.message || "服务器内部错误",
  });
});

app.listen(port, () => {
  console.log(`shunyi-server listening on http://localhost:${port}`);
});
