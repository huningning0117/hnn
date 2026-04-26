# 城职灵导 CityNav AI

城职灵导是一个面向手机端的校园 AI 导览 H5 Demo。项目用静态前端实现路线生成、SVG 校园地图高亮、模拟 AI 路线说明、Web Speech API 语音导览和目的地打卡，适合部署到 GitHub Pages。

## 技术架构

- HTML5：页面结构、移动端 viewport、内联 SVG 校园地图。
- CSS3：移动优先响应式布局，使用 Grid/Flexbox 适配手机与桌面预览。
- JavaScript：基于校园路径图的 Dijkstra 最短路线生成、路线文案生成、地图高亮、打卡状态和语音导览。
- Web Speech API：在支持的浏览器中播放中文导览语音。
- GitHub Pages：通过静态文件直接部署。

## 项目结构

```text
CityNav-AI/
├── assets/                 # 地点图标与备用 SVG 资源
├── css/style.css           # 响应式样式
├── data/locations.json     # 校园地点与路径数据
├── docs/                   # 产品、路演与演示文档
├── js/app.js               # 路线生成与交互逻辑
├── index.html              # H5 入口页面
└── README.md
```

## 本地运行

静态页面需要通过本地服务访问，避免浏览器拦截 `data/locations.json`：

```bash
cd CityNav-AI
python -m http.server 5500
```

打开 `http://localhost:5500` 即可体验。直接打开 `index.html` 时，页面会自动使用 `app.js` 内置的备用数据。

## 核心功能

- 起点与终点选择：支持校门口、教学楼、实训楼、食堂、图书馆、活动中心。
- 快捷路线：内置技能节报到、作品展示、下课就餐、饭后自习四个场景。
- SVG 地图：根据路线动态高亮路径，并标记起点和终点。
- 模拟 AI 文案：自动生成路线摘要、分段步骤、新生提示和活动提示。
- 语音导览：点击“播放语音导览”后调用浏览器 Web Speech API。
- 校园打卡：到达目的地后点亮地点章，记录保存在 `localStorage`。

## GitHub Pages 部署

仓库根目录已准备 GitHub Actions 工作流：`.github/workflows/citynav-ai-pages.yml`。推送到 `main` 后，工作流会把 `CityNav-AI` 目录作为静态站点发布到 GitHub Pages。

首次使用时需要在 GitHub 仓库设置中启用 Pages，并将 Source 设为 GitHub Actions。发布成功后，可通过仓库 Pages 地址访问手机端页面。

## 后续扩展

- 替换为真实校园 GIS 或官方平面图坐标。
- 接入真实大模型 API，让路线说明根据用户身份、时间和活动动态生成。
- 增加二维码定位、无障碍路线、室内楼层导航和活动排队状态。
