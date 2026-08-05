import markdown from "./chapter10.md?raw";
import type { Chapter } from "./types";

export const chapter10: Chapter = {
  number: 10,
  shortTitle: "可观测性与稳定性",
  title: "可观测性、SLO 与故障处理",
  subtitle: "日志、指标和 Trace 不是三套报表；它们是解释系统行为的互补证据。",
  opening: [
    "当线上请求变慢时，最有价值的问题不是“哪台机器 CPU 高”，而是“哪些用户受影响、从何时开始、哪条依赖路径变慢、是否正在耗尽可靠性预算”。回答这些问题需要事先设计好证据，而不是事故发生后临时加日志。",
    "本章从三类遥测数据讲到 SLO、告警、响应和复盘，帮助你把监控从一堆图表变成能指导决策的系统。",
  ],
  goals: [
    "说明日志、指标、Trace、Profile 各自回答的问题，并通过上下文关联它们。",
    "正确解读吞吐、错误率、直方图与 p50/p95/p99 的含义和限制。",
    "设计用户导向的 SLI、SLO、错误预算和可执行告警。",
    "用故障分级、缓解、复盘和容量模型形成持续改进闭环。",
  ],
  markdown,
  furtherReading: [
    { title: "OpenTelemetry：Observability Primer", href: "https://opentelemetry.io/docs/concepts/observability-primer/" },
    { title: "Prometheus：Histograms and summaries", href: "https://prometheus.io/docs/practices/histograms/" },
    { title: "Google SRE：Service Level Objectives", href: "https://sre.google/sre-book/service-level-objectives/" },
    { title: "Google SRE Workbook：Alerting on SLOs", href: "https://sre.google/workbook/alerting-on-slos/" },
  ],
};
