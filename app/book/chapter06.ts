import markdown from "./chapter06.md?raw";
import type { Chapter } from "./types";

export const chapter06: Chapter = {
  number: 6,
  shortTitle: "缓存与流量保护",
  title: "缓存、Redis、限流与流量保护",
  subtitle: "缓存是一份可能过期的副本；流量控制在系统过载前拒绝超额请求。",
  opening: [
    "缓存引入一份可能陈旧、可能丢失、可能与真源不同步的数据副本。使用缓存前要确定允许陈旧的时间，并定义缓存失效时的回源与降级路径。",
    "本章把缓存和流量保护放在同一条资源链上：请求量、下游故障或热点数据超出正常范围时，系统通过副本、容量上限和降级保留核心服务。",
  ],
  goals: [
    "把数据库真源、缓存副本、TTL 和失效策略区分清楚。",
    "解释并应对缓存穿透、击穿、雪崩和热点回源。",
    "选择合适的限流、配额、并发限制、背压、熔断和降级策略。",
    "理解 Redis 与分布式锁能解决什么、不能替代什么。",
  ],
  markdown,
  furtherReading: [
    { title: "Redis 文档：数据类型", href: "https://redis.io/docs/latest/develop/data-types/" },
    { title: "Redis 文档：持久化", href: "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/" },
    { title: "Google SRE：Addressing Cascading Failures", href: "https://sre.google/sre-book/addressing-cascading-failures/" },
    { title: "Google SRE Workbook：Error Budget Policy", href: "https://sre.google/workbook/error-budget-policy/" },
  ],
};
