import markdown from "./chapter07.md?raw";
import type { Chapter } from "./types";

export const chapter07: Chapter = {
  number: 7,
  shortTitle: "任务与消息队列",
  title: "任务、消息队列与异步系统",
  subtitle: "异步系统依靠明确的状态、容量、投递语义与恢复路径运行。",
  opening: [
    "同步调用在当前控制流中交付结果；异步任务先持久化待办状态，再由消费者推进。选择依据是确认时点、状态归属、容量和失败恢复方式。",
    "本章讨论队列和事件系统的基本语义：消息何时算被接收、为什么重复投递是常态、怎样保护消费者和下游系统，以及什么范围内才能诚实地谈“恰好一次”。",
  ],
  goals: [
    "判断一次工作应同步完成、异步排队，还是只是并发等待。",
    "解释生产者、消费者、确认、重试、DLQ、顺序与分区的边界。",
    "通过有界队列、背压、消费者幂等和状态机控制异步系统。",
    "理解 Outbox 与最终一致性的目标和局限。",
  ],
  markdown,
  furtherReading: [
    { title: "Apache Kafka：Delivery Semantics", href: "https://kafka.apache.org/documentation/#semantics" },
    { title: "RabbitMQ：Consumer Acknowledgements", href: "https://www.rabbitmq.com/docs/confirms" },
    { title: "Google Cloud：Pub/Sub delivery guarantees", href: "https://cloud.google.com/pubsub/docs/subscriber" },
    { title: "Designing Data-Intensive Applications：可靠消息处理（书籍）", href: "https://dataintensive.net/" },
  ],
};
