import markdown from "./chapter12.md?raw";
import type { Chapter } from "./types";

export const chapter12: Chapter = {
  number: 12,
  shortTitle: "分布式系统",
  title: "分布式系统与架构设计",
  subtitle: "当状态跨进程、跨机器、跨时间存在时，网络不确定性会成为系统语义的一部分。",
  opening: [
    "分布式系统的复杂性来自不同节点在不同时间看到不同事实。超时使结果未知，重试会重复，复制会滞后；设计必须先确定由谁保存并裁决状态。",
    "本章从状态归属和服务边界出发，逐步讨论复制、一致性、事务、消息、服务发现与隔离，并给出面向架构面试的推导方法。",
  ],
  goals: [
    "为状态选择单一事实源、复制路径、分片键和一致性目标。",
    "准确解释线性一致性、可串行化、最终一致性、CAP 与共识的边界。",
    "理解 2PC、Saga、Outbox、幂等与消息重投如何处理跨系统状态变化。",
    "在同步 RPC、消息、缓存、读写分离、发现与负载均衡之间作可解释的取舍。",
  ],
  markdown,
  furtherReading: [
    { title: "Designing Data-Intensive Applications（书籍）", href: "https://dataintensive.net/" },
    { title: "PostgreSQL：事务隔离", href: "https://www.postgresql.org/docs/current/transaction-iso.html" },
    { title: "Apache Kafka：Delivery Semantics", href: "https://kafka.apache.org/documentation/#semantics" },
    { title: "Google SRE：Addressing Cascading Failures", href: "https://sre.google/sre-book/addressing-cascading-failures/" },
  ],
};
