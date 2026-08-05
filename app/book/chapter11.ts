import markdown from "./chapter11.md?raw";
import type { Chapter } from "./types";

export const chapter11: Chapter = {
  number: 11,
  shortTitle: "容器与部署",
  title: "Linux、容器、配置与部署",
  subtitle: "部署不是把镜像推上去；它定义进程怎样启动、接流量、改变数据、退出和恢复。",
  opening: [
    "生产发布是一段受约束的状态变化：新版本必须能获得正确配置、通过启动检查、渐进接收流量、与旧版本共存，并在异常时安全地停止或恢复。镜像、容器、Kubernetes、健康检查和迁移都是这段变化中的工具。",
    "本章解释部署系统的基本对象和时间顺序，并重点区分容易混淆的健康检查、资源限制、发布策略、回滚和数据恢复。",
  ],
  goals: [
    "区分构建产物、镜像、容器、虚拟机、配置和 Secret 的职责。",
    "为服务设计正确的启动、存活、就绪、终止与资源限制行为。",
    "理解滚动、蓝绿、金丝雀发布的风险和数据库迁移的兼容窗口。",
    "区分代码回滚、数据恢复、备份目标与实际故障处置。",
  ],
  markdown,
  furtherReading: [
    { title: "Docker Docs：Images and containers", href: "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/" },
    { title: "Kubernetes：Liveness, Readiness, Startup Probes", href: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes" },
    { title: "Kubernetes：Resource Management", href: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" },
    { title: "The Twelve-Factor App：Config", href: "https://12factor.net/config" },
  ],
};
