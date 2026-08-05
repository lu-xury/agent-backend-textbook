# 后端教材面试覆盖审计（2026-08）

## 审计规则

本次把“重复至少三轮”解释为：**每轮重新抽取至少 7 套题集或面经，完成一次覆盖映射并实际修订书稿**，而不是三轮合计七套。首次三轮检查 21 套；用户要求再重复三轮后，第 4–6 轮又检查 21 个不同 URL，累计 42 套来源。面经只用于判断“会问什么、怎样追问”，不作为技术事实依据；新增技术解释继续由 RFC、Linux Kernel/man-pages、PostgreSQL/MySQL、Redis、Kafka、OWASP、OpenTelemetry 与 Kubernetes 官方资料校正。转载汇总可能有选择偏差，不能据此承诺覆盖某家公司未来的全部题目。

## 第一轮：算法、操作系统、网络与数据库基础

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 1 | [Waking-Up](https://github.com/wolverinn/Waking-Up) | 作者以后端校招、字节 offer 为背景整理 | OS、计网、数据库的连续追问 |
| 2 | [字节后台开发面经](https://github.com/DiffYao/Interview-Note/blob/main/%E5%AD%97%E8%8A%82%E8%B7%B3%E5%8A%A8-%E5%90%8E%E5%8F%B0%E5%BC%80%E5%8F%91%E9%9D%A2%E7%BB%8F.md) | 字节 | DNS、TCP、调度、Top-N SQL、隔离级别 |
| 3 | [字节 C++ 后端题集](https://github.com/0voice/cpp_backend_awsome_blog/blob/main/%E3%80%90NO.61%E3%80%91%E5%AD%97%E8%8A%82%E8%B7%B3%E5%8A%A8%E9%9D%A2%E8%AF%95%E9%A2%98%E6%B1%87%E6%80%BB%20--%20C%2B%2B%E5%90%8E%E7%AB%AF%EF%BC%88%E5%90%AB%E7%AD%94%E6%A1%88%EF%BC%89.md) | 字节 | 内存、进程负载、B/B+ 树、原子性 |
| 4 | [腾讯 Linux C++ 后台题集](https://github.com/0voice/cpp_backend_awsome_blog/blob/main/%E3%80%90NO.416%E3%80%91%E7%9B%98%E7%82%B9%E8%85%BE%E8%AE%AFlinux%20C%2B%2B%E5%90%8E%E5%8F%B0%E5%BC%80%E5%8F%91%E9%9D%A2%E8%AF%95%E9%A2%98.md) | 腾讯 | Linux、C++、网络、服务器编程 |
| 5 | [腾讯后台面经整合](https://m.nowcoder.com/discuss/353147085639852032) | 腾讯多份记录 | 缺页、VFS、中断、锁、SYN flood |
| 6 | [米哈游 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/mihayou.html) | 米哈游 | 进程线程、虚拟内存、网络与算法 |
| 7 | [小红书 Java 面试](https://xiaolincoding.com/backend_interview/internet_medium/xiaohongshu.html) | 小红书 | I/O 多路复用、InnoDB、Redis 线程模型 |

**本轮结论与改动**：原书有概念骨架，但手写题与内核/网络实际路径不足。第 1 章增加 C++ LRU、不变量与复杂度；第 2 章增加进程状态、僵尸/孤儿、`select`/`poll`/`epoll`、Reactor、页缓存、`mmap` 与零拷贝边界；第 3 章增加五元组、监听队列、HTTP/1.1 消息分帧与 request smuggling；第 5 章增加分组 Top-N 和 InnoDB 聚簇/二级索引。

## 第二轮：缓存、消息、并发与分布式场景

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 8 | [腾讯 C++ 后端资料汇总](https://github.com/KyelYang/c-plus-Interview) | 腾讯 WXG/TEG 等 | CAS、线程池、epoll、LRU、项目深挖 |
| 9 | [米哈游 Go 面经](https://github.com/CocaineCong/Golang-Interview/blob/main/e.%20%E7%B1%B3%E5%93%88%E6%B8%B8.md) | 米哈游 | 协程、IPC、信号、信号量 |
| 10 | [阿里 Java 题目整理](https://github.com/javastacks/javastack/blob/master/articles/%E9%9D%A2%E8%AF%95/%E5%8F%B2%E4%B8%8A%E6%9C%80%E5%85%A8%E9%98%BF%E9%87%8C%20Java%20%E9%9D%A2%E8%AF%95%E9%A2%98%E6%80%BB%E7%BB%93.md) | 阿里 | Redis 持久化、复制、集群与竞争 |
| 11 | [腾讯后台暑期实习面经](https://www.nowcoder.com/discuss/603209336625590272) | 腾讯 | 分布式事务、缓存事故、MQ 选型 |
| 12 | [多厂 offer 面经](https://www.nowcoder.com/discuss/353158203158503424) | 阿里、腾讯、字节、美团、网易 | 消息不丢、缓存同步、并发与 JVM |
| 13 | [京东 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/jingdong.html) | 京东 | Redis 持久化、限流、RocketMQ |
| 14 | [饿了么 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/elme.html) | 饿了么 | upsert、数据库过载、hot key、MQ |

**本轮结论与改动**：原书对模式解释较好，但产品运行语义还不够。第 6 章增加 Redis Cluster slot/hash tag、重定向、热 key 与端到端慢排查；第 7 章增加消费者组 rebalance、offset 所有权、poll 阻塞与 lag；第 12 章增加负载均衡算法与一致性哈希，并明确它们不解决热点、复制和业务一致性。已有的缓存一致性、Outbox、幂等、限流、熔断、Saga 与 Quorum 内容通过复核，无需为题量重复扩写。

## 第三轮：安全、质量、可观测性、部署与综合能力

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 15 | [字节 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/byte_dance.html) | 字节 | 项目吞吐、线程状态、事务、Redis |
| 16 | [腾讯 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/tencent.html) | 腾讯 | 语言运行时、数据结构、并发与场景题 |
| 17 | [美团 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/meituan.html) | 美团 | 项目深挖、MySQL、缓存与高并发 |
| 18 | [百度 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/baidu.html) | 百度 | 锁、大数据量文件处理、算法 |
| 19 | [滴滴 Java 面试](https://xiaolincoding.com/backend_interview/internet_giants/didi.html) | 滴滴 | 项目、并发、中间件与场景分析 |
| 20 | [后端高频题汇总](https://www.nowcoder.com/discuss/889150185626955776) | 字节、腾讯、美团等近期样本 | 缓存、MySQL、并发与真实追问频次 |
| 21 | [SRE / AI Infra 面试题](https://github.com/jfang2048/SRE-Job-Description/blob/main/SRE_AI_infra%E9%9D%A2%E8%AF%95%E9%A2%98%E6%80%BB%E7%BB%93%E7%89%88.md) | SRE/基础设施岗位 | Kubernetes 排障、日志/指标/Trace、容量与恢复 |

**本轮结论与改动**：综合面更重视“用证据排故”和“解释项目取舍”，不是再背一遍组件定义。第 8–11 章现有的 OAuth/OIDC、对象级授权、XSS/CSRF/SSRF、供应链、测试层级、属性/模糊测试、SLO、遥测基数与采样、容器、Kubernetes 控制循环、发布/回滚已覆盖采样主题；本轮通过练习与完整性门禁强化从症状到证据、从发布到停止条件的回答路径。语言框架专属题（JVM、Spring）没有硬塞进语言无关的后端基础教材；读者应在本书之外按目标岗位补一门语言运行时与主流框架。

## 第二次重复审计：第 4–6 轮（新增 21 套）

### 第四轮：系统底层、网络数据路径与数据库存储引擎

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 22 | [腾讯后台开发社招六面](https://www.nowcoder.com/discuss/353147569817722880) | 腾讯 | TCP 拥塞控制、Linux 内核网络、索引与项目实战 |
| 23 | [25 暑期实习与秋招面经](https://www.nowcoder.com/discuss/759208803077275648) | 腾讯、阿里云等 C++/基础平台 | 共享内存回收、Linux 分配器、LevelDB、并发索引 |
| 24 | [个人秋招面经汇总](https://www.nowcoder.com/discuss/535846390849601536) | 腾讯安全等多家公司 | DPDK、traceroute、地址翻译、文件映射、TSAN |
| 25 | [2025 春招实习面经汇总](https://www.nowcoder.com/discuss/736868736837173248) | 美团、阿里、蚂蚁、字节等 | LSM Tree、高性能服务器调优、缓存更新与 MySQL 锁 |
| 26 | [记录 2024 所有面试](https://www.nowcoder.com/discuss/613153503015395328) | 大疆、美团、飞书等 | 数据库范式、缓冲池淘汰、隔离实现与线程安全 |
| 27 | [游戏服务端开发/测试开发面经](https://www.nowcoder.com/discuss/353156331521646592) | 网易雷火、米哈游等 | Linux 网络系统调用、MySQL、内存与游戏服务端基础 |
| 28 | [四年经验后端社招经历](https://www.nowcoder.com/discuss/459394452424024064) | 米哈游、富途等 | 三大基础课、微服务治理、项目横向比较与技术取舍 |

**本轮结论与改动**：网络章已有 traceroute、PMTUD、TCP 字节流、HTTP/2/3 与 QUIC，复核后不重复扩写；真正缺失的是 OS 内存分配层级与文件系统对象，以及数据库内存/存储引擎路径。第 2 章新增用户态分配器、伙伴系统、Slab/SLUB、VFS、inode、dentry、硬/软链接、目录权限与 `/proc`/`/sys`；第 5 章新增缓冲池、脏页、checkpoint，以及 B+ 树与 LSM 的读/写/空间放大取舍。

### 第五轮：缓存、消息、并发与分布式交易

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 29 | [美团/快手 Java 面试记录](https://www.nowcoder.com/discuss/722397808745033728) | 美团、快手 | Redis 持久化、线程池、限流、MQ 重复消费、线上无日志排障 |
| 30 | [字节后端日常实习三面](https://www.nowcoder.com/discuss/712318562139901952) | 字节 | 秒杀库存、Redis fork、消息同步性、数据库锁与系统设计 |
| 31 | [字节抖音电商后端一面](https://www.nowcoder.com/discuss/642293651615285248) | 字节 | RocketMQ 延时、消息积压与消费者扩展 |
| 32 | [TikTok 后端日常实习后续](https://www.nowcoder.com/discuss/686735730227286016) | TikTok | MQ 可靠性、分布式事务、锁与幂等 |
| 33 | [京东健康后端开发实习一面](https://www.nowcoder.com/discuss/861995389170298880) | 京东健康 | Redis、文档异步任务与组件选型证据 |
| 34 | [滴滴后端三年社招面经](https://www.nowcoder.com/discuss/353156607364243456) | 滴滴 | Redis 渐进 rehash、大 key、热迁移与分布式事务 |
| 35 | [MiniMax Agent 后端一面](https://www.nowcoder.com/discuss/756866751832268800) | MiniMax | Seata AT/XA/TCC、前后镜像、回滚边界 |

**本轮结论与改动**：第 6 章新增 L1/L2 多级缓存、版本化失效和缓存故障时的回源保护；第 7 章补齐 Kafka ISR、`acks=all`、`min.insync.replicas`、幂等生产与安全重放；第 12 章新增全局 ID 的选择、在线重分片状态机，以及 TCC 的 Try/Confirm/Cancel、空回滚、防悬挂与适用边界。原书已有 Outbox、Saga、2PC、消费者幂等、rebalance/lag 和限流/熔断，保留并复核而不重复堆术语。

### 第六轮：测试、SRE、云原生与 Agent 工程

| # | 题集 / 面经 | 公司或样本性质 | 暴露的追问 |
| --- | --- | --- | --- |
| 36 | [腾讯/百度 Agent 面经汇总](https://www.nowcoder.com/discuss/878600528970735616) | 腾讯、百度等 8 个 Agent 样本汇总 | 多 Agent 编排、失败恢复、资金安全、RAG 热更新与项目真实性 |
| 37 | [腾讯 WXG 大模型应用开发](https://www.nowcoder.com/discuss/769357001628397568) | 腾讯 WXG | 工具调用容错、记忆系统落地与项目深挖 |
| 38 | [后端/Agent 日常实习记录](https://www.nowcoder.com/discuss/718550138490290176) | 亚信等后端/Agent 样本 | RAG、向量存储、Kafka、任务重复领取和大分片 |
| 39 | [SRE 秋招总结](https://www.nowcoder.com/discuss/353158591374893056) | 字节、腾讯、美团、网易 | cgroup、容器资源视图、Pod 创建、DNS 与半连接队列 |
| 40 | [测试开发公司详细问题](https://www.nowcoder.com/discuss/353158268111495168) | 米哈游、哔哩哔哩、携程等 | 测试框架、用例设计、测试阶段、Bug 跟踪与测试计划 |
| 41 | [京东运维开发面经](https://www.nowcoder.com/discuss/478505627115880448) | 京东 | 文件权限、inode、`/proc`/`/sys`、Docker 隔离与容器网络 |
| 42 | [网易互娱基础架构运维开发](https://www.nowcoder.com/discuss/353156915016441856) | 网易互娱 | 高负载/OOM、iptables、Cgroup、CI/CD、Prometheus 与多租户 |

**本轮结论与改动**：第 9 章新增等价类、边界值、决策表、状态迁移和基于风险的测试计划；第 11 章新增 network namespace、veth、CNI、Service DNAT、SNAT 与分层排障路径；第 13 章新增 Recall@k/Precision@k/nDCG/MRR 的检索分层评测，以及版本化索引构建、双写/追平、原子切换、回退和删除传播。安全、可观测性与发布章节原有威胁建模、SLO/burn rate、incident/postmortem、SBOM、金丝雀和恢复演练已覆盖本轮样本，因此只补真实缺口。

## 最终判断

经过两组各三轮、累计 42 套样本的交叉审计，教材现在对**语言无关的后端基础与实用知识**覆盖较完整，能够支撑从概念题、机制追问到场景题的回答；发现的缺口都写回对应章节，而非附加一份孤立题库。但“覆盖全面”不等于保证通过面试：算法现场编码、C++/Rust/Python 语言细节、目标公司的框架栈、项目数据与行为面仍需单独准备。

建议读者对每个主题采用四层回答：一句话定义并划清边界；解释关键数据结构或状态转换；给出工程选择或代码；最后说明并发、超时、重复、资源耗尽与故障切换时会怎样。只会第一层，仍属于背名词。

## 技术事实核对资料

- Linux：[epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)、[select(2)](https://man7.org/linux/man-pages/man2/select.2.html)、[accept(2)](https://man7.org/linux/man-pages/man2/accept.2.html)、[mmap(2)](https://man7.org/linux/man-pages/man2/mmap.2.html)、[sendfile(2)](https://man7.org/linux/man-pages/man2/sendfile.2.html)
- Linux 内核：[Memory Allocation Guide](https://docs.kernel.org/core-api/memory-allocation.html)、[Virtual File System](https://docs.kernel.org/filesystems/vfs.html)
- 网络：[HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)、[HTTP/1.1, RFC 9112](https://www.rfc-editor.org/rfc/rfc9112.html)、[TCP, RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html)
- 数据与消息：[MySQL InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/en/innodb-buffer-pool.html)、[RocksDB Overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview)、[Redis Cluster Specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)、[Kafka Design](https://kafka.apache.org/43/design/design/)
- 安全与运行：[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)、[OpenTelemetry Concepts](https://opentelemetry.io/docs/concepts/)、[Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
