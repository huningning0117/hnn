# API 设计

## 基本约定

- 后端技术栈：Node.js + Express。
- 默认返回 JSON。
- 当前阶段全部返回 mock 数据。
- 后续真实大模型接口需要通过配置开关启用。

## 健康检查

```http
GET /api/health
```

响应示例：

```json
{
  "ok": true,
  "service": "shunyi-ai-server",
  "mode": "mock"
}
```

## APP 请求会议整理结果

```http
POST /api/meeting/summarize
Content-Type: application/json
```

请求示例：

```json
{
  "source": "app",
  "text": "今天讨论了项目答辩，需要突出创新点、用户痛点和软硬件联动。"
}
```

响应示例：

```json
{
  "id": "mock-meeting-001",
  "summary": "本次讨论围绕项目答辩展开，重点包括创新点、用户痛点和软硬件联动展示。",
  "todos": [
    "优化答辩稿中的创新点表达",
    "补充用户痛点说明",
    "准备软硬件联动演示"
  ],
  "keywords": ["答辩", "创新点", "用户痛点", "软硬件联动"],
  "timeline": [
    {
      "time": "演示阶段",
      "content": "完成 APP、后端和 ESP32 的 mock 闭环展示"
    }
  ],
  "mock": true
}
```

## ESP32 上传测试文本

```http
POST /api/hardware/upload-text
Content-Type: application/json
```

请求示例：

```json
{
  "deviceId": "esp32-demo-001",
  "trigger": "button",
  "text": "硬件端触发了一段会议记录测试文本。"
}
```

响应示例：

```json
{
  "ok": true,
  "received": true,
  "message": "测试文本已接收",
  "next": "/api/meeting/summarize"
}
```

## 后续预留

- `POST /api/audio/upload`：真实音频上传，当前不启用。
- `POST /api/ai/summarize`：真实大模型总结接口，当前不启用。
- `GET /api/hardware/status`：硬件状态查询。
