import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import appRoutes from "./routes/appRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import {
  addRequestLog,
  getRequestLogLimit,
  getRequestLogs,
} from "./store/requestLogStore.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dashboardDir = path.join(__dirname, "public", "dashboard");
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-ShunYi-Source"],
};

function formatLocalLogTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}

function getRequestSource(req) {
  const explicitSource = req.get("x-shunyi-source");

  if (explicitSource) {
    return explicitSource;
  }

  if (req.originalUrl.startsWith("/dashboard")) {
    return "dashboard";
  }

  if (req.get("referer")?.includes("/dashboard")) {
    return "dashboard";
  }

  if (req.originalUrl.startsWith("/api")) {
    return "api";
  }

  return "server";
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const requestLog = {
      time: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      source: getRequestSource(req),
    };

    addRequestLog(requestLog);
    console.log(
      `${formatLocalLogTime()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
});

app.get("/dashboard", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(dashboardDir, "index.html"));
});

app.get("/dashboard.css", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(dashboardDir, "dashboard.css"));
});

app.get("/dashboard.js", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(dashboardDir, "dashboard.js"));
});

app.use(
  "/dashboard",
  express.static(dashboardDir, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store");
    },
  }),
);

app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    service: "shunyi-server",
    message: "瞬忆后端服务运行中",
    aiMode: "Mock AI",
    esp32Status: "待接入",
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get("/api/server/logs", (req, res) => {
  res.json({
    logs: getRequestLogs(),
    count: getRequestLogs().length,
    limit: getRequestLogLimit(),
  });
});

app.use("/api/log", eventRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/app", appRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/features", featureRoutes);

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

app.listen(port, "0.0.0.0", () => {
  console.log(`shunyi-server listening on http://localhost:${port}`);
  console.log(`LAN access: http://10.67.191.156:${port}`);
});
