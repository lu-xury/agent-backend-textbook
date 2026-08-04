# Agent 后端开发教科书

面向大模型 Agent 开发者的交互式中文教材。目标不是把读者训练成某一种语言的框架使用者，而是建立能审查、调试和维护 AI 生成后端代码的基础能力。

## 内容

- 13 章后端与 Agent Runtime 知识
- P0 / P1 学习优先级
- Python、C++、Rust 三条实践主线
- 章节搜索、学习进度与完成标准
- 桌面端与移动端响应式布局

## 本地运行

```bash
npm ci
npm run dev
```

## 构建 GitHub Pages

```bash
npm run build
```

静态产物生成在 `dist/`。推送到 `main` 后，仓库中的 GitHub Actions 工作流会自动构建并部署教材。

## 在线地址

<https://lu-xury.github.io/agent-backend-textbook/>
