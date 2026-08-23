# PinMind

把碎片化文章、文字和截图整理为结构化知识卡片的 AI 知识管理 MVP。

## 在线体验

- [Web Demo](https://pinmind-api.onrender.com/demo)
- [Android APK](https://github.com/yaoaizhegeshijie666-byte/PinMind/releases/latest/download/PinMind-MVP.apk)
- [APK 发布页](https://github.com/yaoaizhegeshijie666-byte/PinMind/releases/latest)

Web Demo 内置代表性内容，可直接浏览今日知识、历史知识、知识库、未收录和来源记录。正式页面支持链接与单张截图导入。

## 核心能力

- 网页链接与截图采集
- 视觉模型识别截图
- 关键信息保留与结构化知识卡片生成
- 今日知识、知识库、来源记录与历史归档
- Web 与 Android 双端体验

## 技术结构

- Web：原生 HTML、CSS、JavaScript
- API：Python HTTP 服务
- Database：SQLite / PostgreSQL
- AI：OpenRouter
- Android：WebView 容器与原生分享接收
