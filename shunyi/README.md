# 瞬忆 · AI 记忆助手

「瞬忆 · AI 记忆助手」是用于技能节比赛展示的软硬件联动 Demo。当前阶段优先保证演示闭环稳定，先使用 mock AI 数据完成 APP、后端服务和 ESP32 端的接口联动，后续再逐步接入真实大模型和真实硬件数据。

## 项目结构

```text
shunyi_ai/
├─ README.md
├─ docs/
│  ├─ project-plan.md
│  ├─ demo-script.md
│  ├─ api-design.md
│  └─ hardware-wiring.md
├─ app/
├─ server/
├─ hardware/
│  └─ shunyi-esp32/
└─ scripts/
```

## Android 打包

当前 APP 已接入 Capacitor，Android 包名为 `com.shunyi.memory`，应用名称为「瞬忆」。

常用命令：

```powershell
npm install
npm run build
npx cap sync android
npx cap open android
```

其中 `npm run build` 会把 `app/` 下的静态资源复制到 `dist/`，Capacitor 的 `webDir` 指向 `dist/`。

Android Studio 打开目录：

```text
android/
```

## 模块边界

- `app/`：手机 APP 展示端。当前不申请真实麦克风权限，不做后台录音。
- `server/`：Node.js + Express 后端服务，负责返回 mock 会议整理结果，并预留真实大模型接口。
- `hardware/shunyi-esp32/`：ESP-IDF 项目目录，仅放本项目 ESP32 代码，不写入 ESP-IDF 官方安装目录。
- `docs/`：项目计划、接口设计、演示脚本和硬件接线说明。
- `scripts/`：后续放构建、打包、启动和演示辅助脚本。

## 当前安全边界

当前 Demo 不加入以下功能：

- 后台录音
- 静默监听
- 剪贴板监听
- 键盘捕获
- APP 真实麦克风权限申请
- 真实音频上传

## 当前阶段目标

1. 先稳定完成 mock 演示闭环。
2. APP、server、hardware 三部分保持独立。
3. 接口协议先统一，后续再替换真实语音识别、音频上传和大模型调用。
4. ESP32 端仅做 Wi-Fi 连接、采集触发和 HTTP 上传测试文本的演示。
