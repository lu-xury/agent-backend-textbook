import markdown from "./chapter13.md?raw";
import type { Chapter } from "./types";

export const chapter13: Chapter = {
  number: 13,
  shortTitle: "Agent 后端",
  title: "Agent 后端：把不确定性关在边界内",
  subtitle: "模型可以提出意图；状态、权限、预算和副作用必须由确定性的运行时负责。",
  opening: [
    "Agent 后端把概率性的模型输出接入会改变外部世界的工具。用户取消、网络超时和服务重启要求 Runtime 用可校验的状态、事件、权限和恢复规则约束执行。",
    "本章把前十二章的知识收束到同一个系统：会话和 Run 建模、模型候选调用验证、工具授权与审计，以及长任务的取消、恢复和评估。",
  ],
  goals: [
    "区分语言模型生成的候选意图与运行时可执行的确定性决策。",
    "为 Session、Run、事件、工具调用和确认动作设计清晰状态机。",
    "在模型输出、RAG、远程工具、并发、取消、预算和恢复处守住边界。",
    "使用评测、Trace、审计和人工确认持续验证 Agent 行为。",
  ],
  markdown,
  furtherReading: [
    { title: "OpenAI：Building agents", href: "https://platform.openai.com/docs/guides/agents" },
    { title: "Model Context Protocol Specification", href: "https://modelcontextprotocol.io/specification" },
    { title: "OWASP：Top 10 for LLM Applications", href: "https://genai.owasp.org/llm-top-10/" },
    { title: "OpenTelemetry：GenAI Observability", href: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
    { title: "Anthropic：Building effective agents", href: "https://www.anthropic.com/engineering/building-effective-agents" },
  ],
};
