import markdown from "./chapter10.md?raw";
import type { Chapter } from "./types";

export const chapter10: Chapter = {
  number: 10,
  shortTitle: "可观测性与稳定性",
  title: "可观测性、SLO 与故障处理",
  subtitle: "日志、指标和 Trace 提供解释系统行为的互补证据。",
  opening: [
    "线上请求变慢时，工程师需要回答哪些用户受影响、影响从何时开始、哪条依赖路径变慢，以及可靠性预算消耗了多少。回答这些问题依赖预先设计的遥测证据。",
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
