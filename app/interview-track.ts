export type InterviewQuestion = {
  question: string;
  answer: string;
  followUp: string;
};

export type InterviewDrill = {
  title: string;
  prompt: string;
  strongSignals: string[];
};

export type InterviewChapter = {
  number: number;
  verdict: string;
  focus: string[];
  questions: InterviewQuestion[];
  drills: InterviewDrill[];
  traps: string[];
};

export const interviewAssessment = {
  verdict: "完成全书后，你应该不只会复述概念，还能把概念落到代码、数据、并发、故障和取舍上。",
  upgradedTo: "这一页是全书最后的能力校准：先完成 13 章正文和章末训练，再用综合实战卷自测。目标不是刷题，而是确认你能把基础知识组织成可运行、可解释、可恢复的工程方案。",
  standards: [
    "能在 2 分钟内讲清概念：定义、适用场景、反例、常见坑。",
    "能在 5 分钟内落到工程：接口、SQL、并发控制、缓存策略、监控指标。",
    "遇到追问能说明取舍：复杂度、一致性、可用性、成本、安全边界。",
    "至少能手写核心小题：LRU、限流器、生产者消费者、事务并发、SSE 协议、状态机。",
  ],
};

export const algorithmInterviewTrack = {
  title: "算法与代码题补强",
  note: "高水平后端训练通常不会只看系统知识。教材主线是后端系统，但你还必须并行训练算法题。建议每天 45 到 60 分钟，先覆盖高频模板，再追求速度。",
  drills: [
    "数组与哈希：两数之和、三数之和、最长连续序列。重点说清 **O(n)** 时间和去重边界。",
    "双指针与滑动窗口：最长无重复子串、最小覆盖子串。重点说清窗口何时扩张、何时收缩。",
    "栈与队列：有效括号、单调栈、用队列实现栈。重点说清不变量。",
    "堆与 TopK：前 K 高频元素、合并 K 个有序链表。重点说清 **O(n log k)**。",
    "树与图：层序遍历、最近公共祖先、岛屿数量、课程表。重点说清 DFS/BFS 与 visited。",
    "动态规划：爬楼梯、最长递增子序列、编辑距离。重点说清状态定义和转移。",
    "工程代码题：LRU Cache、令牌桶限流器、阻塞队列、线程安全计数器。",
    "SQL 手写题：连续登录、TopN、去重、留存、慢查询索引设计。",
  ],
};

export const mockInterviewGauntlet = {
  title: "六套综合实战卷",
  note: "当你把 13 章学完，不要立刻说“我准备好了”。用下面六套卷子自测：每套限时 45 到 60 分钟，要求边讲边写，回答必须能落到代码、SQL、指标或状态机。",
  rounds: [
    {
      name: "算法与工程代码卷",
      scenario: "手写 LRU Cache、令牌桶限流器和一道滑动窗口题。要求先讲不变量，再写代码，最后分析复杂度和并发改造。",
      mustCover: ["O(1) 数据结构组合", "容量为 0、重复 key、并发访问", "窗口扩张收缩条件", "测试用例覆盖边界"],
    },
    {
      name: "后端基础深挖卷",
      scenario: "连续回答 TCP/TLS、HTTP 幂等、事务隔离、索引、缓存击穿、线程与协程、JWT 和 SSRF。",
      mustCover: ["每题先一句话定义", "给出反例和线上故障", "说明监控或验证证据", "不把框架默认行为当答案"],
    },
    {
      name: "数据库与并发卷",
      scenario: "设计 run/task/tool_call 表，并处理两个 Worker 同时领取任务、模型扣费成功但进程崩溃、事件流按 sequence 恢复。",
      mustCover: ["UNIQUE、外键和 CHECK", "SELECT FOR UPDATE 或原子 UPDATE", "租约和幂等键", "EXPLAIN 与复合索引"],
    },
    {
      name: "系统设计卷",
      scenario: "设计支持 10 万并发 Agent Run 的后端平台，要求覆盖 API、队列、Worker、模型网关、SSE、PostgreSQL、Redis 和观测。",
      mustCover: ["容量估算先行", "控制面和执行面隔离", "状态不放单机内存", "模型故障降级和成本预算"],
    },
    {
      name: "故障排查卷",
      scenario: "线上出现三连故障：SSE 不流式、Worker 被 OOM kill、重复创建收费 run。你要按证据定位根因并给出短期止血与长期修复。",
      mustCover: ["代理缓冲与心跳", "cgroup 内存和峰值 RSS", "幂等键与结果未知", "回归测试和告警补齐"],
    },
    {
      name: "项目深挖卷",
      scenario: "围绕你的 Agent Runtime 项目讲 15 分钟，评审继续追问状态机、工具权限、上下文压缩、模型 fallback、成本和安全。",
      mustCover: ["讲清你负责的边界", "用真实取舍而非口号回答", "能画出 run 事件时间线", "承认限制并给出演进路线"],
    },
  ],
};

export const interviewChapters: Record<number, InterviewChapter> = {
  1: {
    number: 1,
    verdict: "本章如果只学到类型、函数、异常的概念，还达不到工程要求。一线团队会继续追问你：为什么这样设计边界、异常会不会吞掉根因、异步任务谁负责取消、代码题能否手写到没有明显边界漏洞。",
    focus: ["值语义与引用语义", "异常与 Result 的取舍", "资源释放", "异步任务所有权", "可测试接口设计"],
    questions: [
      {
        question: "Python、C++、Rust 在对象生命周期上最大的差异是什么？",
        answer: "**Python 靠引用计数和 GC 管对象生命，C++ 靠开发者用 RAII 绑定作用域，Rust 用所有权和借用在编译期限制悬空引用。** 回答时不要只说语法，要落到后端资源：连接、锁、文件、后台任务都必须有明确拥有者。",
        followUp: "如果一个后台任务捕获了请求级数据库连接，会发生什么？你应该把连接生命周期改到哪里？",
      },
      {
        question: "为什么不建议 catch 所有异常后返回 500？",
        answer: "因为业务错误、依赖暂时故障、结果未知和程序缺陷需要不同处理。强答案要包含：错误分类、HTTP 映射、日志保留 cause、是否可重试、是否需要告警。",
        followUp: "模型调用超时但可能已经扣费，这属于哪类错误？客户端能不能自动重试？",
      },
      {
        question: "依赖注入到底解决什么问题？",
        answer: "它让核心逻辑依赖稳定契约，而不是依赖具体 SDK、全局变量或框架对象。这样测试可替换，供应商可替换，生命周期也更清楚。",
        followUp: "什么情况下你不会新增接口抽象？",
      },
    ],
    drills: [
      {
        title: "手写 LRU Cache",
        prompt: "实现 get/put 均为 O(1) 的 LRU Cache。要求说明哈希表、双向链表、不变量和容量为 0 的边界。",
        strongSignals: ["能讲清哈希定位节点，链表维护最近使用顺序", "能处理更新已有 key、淘汰尾节点、容量边界", "能说明并发环境下需要锁或分段锁"],
      },
      {
        title: "审查 AI 生成函数",
        prompt: "给一段创建后台任务的 handler，指出至少五个风险：输入校验、资源生命周期、取消、错误分类、测试替身。",
        strongSignals: ["不是泛泛说健壮性，而是指出具体失败路径", "能给出最小修复和对应测试", "能说明 Python/C++/Rust 下各自的资源风险"],
      },
    ],
    traps: ["把类型标注当成运行时校验", "只会背 RAII，不会说数据库连接如何释放", "把 async 等同于自动并行", "说依赖注入只是为了方便 mock"],
  },
  2: {
    number: 2,
    verdict: "本章要达到工程强度，必须能把现象还原成操作系统事实。技术评审常给一句“服务偶发挂掉”或“端口访问不了”，看你能不能问出 PID、信号、监听地址、cgroup、文件描述符这些证据。",
    focus: ["进程线程协程", "虚拟内存与 OOM", "文件描述符", "信号与优雅退出", "容器网络和资源限制"],
    questions: [
      {
        question: "进程、线程、协程的区别是什么？",
        answer: "进程是资源隔离单位，线程共享进程地址空间，协程是用户态调度的执行流。回答要补上场景：不可信工具优先进程隔离，I/O 等待适合协程，CPU 密集需要多核或进程池。",
        followUp: "为什么 Python asyncio 不能让 CPU 密集任务自动变快？",
      },
      {
        question: "服务没有异常日志却退出，你怎么排查？",
        answer: "先看退出码和信号，再看内核日志、容器 memory limit、RSS 峰值、OOM killer、systemd 或编排器事件。SIGKILL 无法被应用捕获，所以没有 finally 日志不奇怪。",
        followUp: "宿主机还有内存，容器为什么仍然 OOM？",
      },
      {
        question: "127.0.0.1、0.0.0.0 和容器端口映射怎么解释？",
        answer: "127.0.0.1 是本命名空间回环地址，0.0.0.0 表示监听所有本地接口，容器里的 localhost 指容器自己。外部访问还需要端口映射、防火墙和监听地址共同正确。",
        followUp: "容器里 curl 成功，宿主机访问失败，你会看哪些命令？",
      },
    ],
    drills: [
      {
        title: "现场排障题",
        prompt: "服务启动报 Address already in use，同时线上偶发 Too many open files。写出你的排查顺序和证据命令。",
        strongSignals: ["ss/lsof 找端口和 PID", "查看 ulimit 与 /proc/PID/fd 数量", "定位未关闭 socket 或响应体", "说明短期止血和长期修复"],
      },
      {
        title: "优雅退出设计",
        prompt: "设计一个 Agent Worker 收到 SIGTERM 后的退出流程，要求不丢任务、不重复外部副作用。",
        strongSignals: ["停止领取新任务", "传播取消或写 checkpoint", "释放租约和连接池", "宽限期后依靠恢复流程兜底"],
      },
    ],
    traps: ["CPU 低就说机器没压力", "用 chmod 777 解决权限题", "把 SIGKILL 当成可清理信号", "分不清宿主机 localhost 和容器 localhost"],
  },
  3: {
    number: 3,
    verdict: "网络章节达到工程强度后，你不能只背三次握手、四次挥手。你要能解释一次请求慢在哪里、为什么重试会重复写、SSE 为什么上线后不流式、代理和浏览器分别改变了什么。",
    focus: ["DNS/TCP/TLS 阶段定位", "HTTP 语义", "超时与 deadline", "重试和幂等", "SSE 与 WebSocket"],
    questions: [
      {
        question: "一次 HTTPS 请求从域名到响应经历哪些阶段？",
        answer: "DNS 解析、TCP 建连、TLS 握手、发送 HTTP 请求、服务器处理、首字节返回、持续读取响应。强回答要能把超时拆开：连接超时、池等待、读超时和总 deadline。",
        followUp: "如果 p95 很高但服务端处理时间不高，你会怀疑哪些网络阶段？",
      },
      {
        question: "GET、POST、PUT、PATCH 的语义怎么区分？",
        answer: "GET 应安全可缓存；POST 常用于创建或动作；PUT 倾向整体替换且幂等；PATCH 是部分更新。状态码和错误体共同构成长期契约。",
        followUp: "取消任务接口应该用 GET 吗？为什么？",
      },
      {
        question: "写接口失败后能不能自动重试？",
        answer: "不能默认重试。要先判断失败是否暂时性、操作是否幂等、响应丢失时结果是否未知。创建类接口应使用幂等键或查询对账。",
        followUp: "客户端提交创建 run，请求返回前断线，如何避免创建两个 run？",
      },
    ],
    drills: [
      {
        title: "设计 SSE 协议",
        prompt: "为 Agent run 设计 SSE 事件：created、delta、tool_started、tool_finished、completed、failed。要求支持断线恢复。",
        strongSignals: ["事件有 id 和类型", "持久化后再推送", "支持 Last-Event-ID 重放", "代理禁缓冲并发送心跳"],
      },
      {
        title: "网络超时题",
        prompt: "入口 deadline 60 秒，下游 A/B/C 都可能慢。设计超时、重试和取消策略。",
        strongSignals: ["总预算逐层递减", "只重试可安全重放操作", "指数退避加抖动", "取消信号传给所有下游"],
      },
    ],
    traps: ["能 ping 通就说 HTTP 正常", "状态码 200 就等于业务成功", "对所有 500 无脑重试", "认为 flush 一定绕过代理缓冲"],
  },
  4: {
    number: 4,
    verdict: "框架章节的训练重点不是背 FastAPI、Drogon 或 Axum API，而是能把请求处理拆成协议、校验、授权、业务、事务、错误映射和观测。评审会看你有没有边界感。",
    focus: ["Router-Service-Repository", "DTO 与领域模型", "统一错误模型", "中间件边界", "API 兼容演进"],
    questions: [
      {
        question: "为什么不建议把所有逻辑写在 handler 里？",
        answer: "handler 应做 HTTP 翻译，业务用例应放 Service，数据访问放 Repository，外部 SDK 放 Adapter。混在一起会导致事务范围不清、无法单测、授权重复、错误格式漂移。",
        followUp: "如果 handler 只有 30 行，但直接返回 ORM 对象，问题在哪里？",
      },
      {
        question: "DTO 校验和业务校验有什么区别？",
        answer: "DTO 校验解决格式和类型，业务校验解决当前状态、资源归属、额度、权限和不变量。外部输入通过 schema 后仍不等于业务合法。",
        followUp: "Pydantic/Serde 校验通过后，为什么还可能越权？",
      },
      {
        question: "中间件适合做什么，不适合做什么？",
        answer: "适合请求 ID、日志、计时、认证上下文、跨路由指标；不适合具体资源授权和业务状态转换，因为它通常不知道目标资源和动作语义。",
        followUp: "SSE 请求的耗时应该在什么时候记录？",
      },
    ],
    drills: [
      {
        title: "设计 Run API",
        prompt: "设计创建、查询、取消、订阅 run 的 HTTP 契约，写出状态码、错误体和幂等策略。",
        strongSignals: ["统一错误 code", "创建支持 idempotency key", "取消幂等", "订阅和任务生命周期分离"],
      },
      {
        title: "重构巨型 Handler",
        prompt: "把一个 300 行 handler 拆成 Router、Service、Repository、ModelAdapter，并说明每层测试方式。",
        strongSignals: ["Service 不依赖 Request", "事务不包远程模型调用", "输出 DTO 不暴露内部字段", "Fake 用于模型和时钟"],
      },
    ],
    traps: ["把目录多当成架构好", "用中间件承载资源授权", "自动 OpenAPI 就当契约完全正确", "把 ORM 实体直接序列化给前端"],
  },
  5: {
    number: 5,
    verdict: "数据库是后端核心战场。本章要提升到能手写 SQL、解释索引、讲清事务隔离、处理并发写入和 migration。只会说“用 ORM”远远不够。",
    focus: ["关系建模", "SQL 与 JOIN", "索引和执行计划", "事务隔离与锁", "迁移和连接池"],
    questions: [
      {
        question: "索引为什么能加速查询？什么时候会失效或不划算？",
        answer: "索引用额外空间和写入成本换有序定位。复合索引要匹配过滤和排序顺序；低选择性、函数包裹、隐式类型转换、返回大量行都可能让优化器不用索引。",
        followUp: "按 run_id 和 sequence 拉事件流，应该建什么索引？为什么？",
      },
      {
        question: "事务隔离级别解决什么问题？",
        answer: "它定义并发事务能看到哪些变化。读已提交、可重复读、串行化在脏读、不可重复读、幻读和写冲突上的保证不同。回答要落到业务不变量，而不是盲目最高级别。",
        followUp: "两个 Worker 同时领取 pending 任务，你如何保证只有一个成功？",
      },
      {
        question: "为什么先查再插会有竞态？",
        answer: "两个并发请求可能都查到不存在，然后都插入。跨实例唯一性必须依靠数据库 UNIQUE、UPSERT、行锁或原子 UPDATE。应用层检查只能改善错误消息。",
        followUp: "创建 run 的幂等键表应该怎么设计？",
      },
    ],
    drills: [
      {
        title: "手写 SQL",
        prompt: "给 users、runs、tool_calls、usage 四张表，写出每个用户最近 7 天成本 Top10，并说明索引。",
        strongSignals: ["先确定结果粒度", "正确 JOIN 和 GROUP BY", "时间范围使用可索引条件", "能解释复合索引列顺序"],
      },
      {
        title: "事务并发题",
        prompt: "设计 Worker 领取任务 SQL，要求多实例并发下不重复领取，并能处理 Worker 崩溃。",
        strongSignals: ["原子 UPDATE 或 SELECT FOR UPDATE SKIP LOCKED", "租约字段和过期回收", "attempt 记录", "状态机防止倒退"],
      },
    ],
    traps: ["把 JSONB 当万能建模", "只说建索引不看执行计划", "事务里调用远程模型", "用 SQLite 代替所有 PostgreSQL 行为测试"],
  },
  6: {
    number: 6,
    verdict: "缓存章节的工程强度在于能说清真源、一致性、异常和限流。评审不想听“加 Redis 变快”，而是要听你如何避免越权旧数据、缓存风暴、锁误用和限流维度错误。",
    focus: ["cache-aside", "TTL 与淘汰", "穿透击穿雪崩", "分布式锁", "限流和配额"],
    questions: [
      {
        question: "缓存和数据库如何保持一致？",
        answer: "先定义数据库是真源，缓存是派生副本。常见 cache-aside 是读缓存，未命中读库回填，写库后删除缓存。敏感数据要缩短 TTL、带版本或直接不缓存。",
        followUp: "为什么先删缓存再写库可能把旧值重新回填？",
      },
      {
        question: "缓存穿透、击穿、雪崩分别是什么？",
        answer: "穿透是大量不存在 key 回源，击穿是热点 key 过期瞬间集中回源，雪崩是大量 key 同时失效。应对包括负缓存、布隆过滤、singleflight、随机 TTL、限流和降级。",
        followUp: "热门模型配置同时过期，你怎么保护数据库？",
      },
      {
        question: "Redis 分布式锁安全吗？",
        answer: "简单 SETNX 不是绝对互斥。锁需要唯一令牌、过期、释放校验、续租或 fencing token；优先用数据库约束、单写者、队列分区和幂等替代锁。",
        followUp: "持锁者暂停超过 TTL 后恢复继续写，会发生什么？",
      },
    ],
    drills: [
      {
        title: "实现令牌桶限流器",
        prompt: "按用户和租户限制请求、并发、token 成本。写出 Redis key、原子脚本思路和失败策略。",
        strongSignals: ["维度包含 tenant/user/resource", "原子检查和扣减", "返回 429 与 retry-after", "Redis 故障时区分 fail-open/fail-closed"],
      },
      {
        title: "设计权限缓存",
        prompt: "缓存 workspace 权限，要求权限变更后不越权，Redis 短暂不可用时行为明确。",
        strongSignals: ["真源仍是数据库", "缓存 key 包含版本或更新时间", "安全路径失败关闭", "日志记录降级原因"],
      },
    ],
    traps: ["缓存命中率高就认为设计好", "Redis 挂了返回空权限默认允许", "所有 key 用同一 TTL", "把 Pub/Sub 当可靠队列"],
  },
  7: {
    number: 7,
    verdict: "并发章节是区分普通 CRUD 和高水平后端的关键。工程强度要求你能解释竞态、锁、背压、队列语义、幂等和恢复；还能写出有界并发或生产者消费者代码。",
    focus: ["事件循环", "结构化并发", "锁和竞态", "有界队列", "至少一次投递与幂等"],
    questions: [
      {
        question: "并发和并行有什么区别？",
        answer: "并发是多个任务生命周期重叠，并行是同一时刻在多个执行资源上运行。I/O 密集适合异步并发，CPU 密集需要多核、进程池或专门 Worker。",
        followUp: "为什么同步 SDK 放进 async handler 会拖慢所有请求？",
      },
      {
        question: "什么是背压？",
        answer: "背压让生产者感知消费者能力，避免无界排队把内存打爆。实现手段包括有界队列、Semaphore、限流、拒绝策略和分级资源池。",
        followUp: "模型一次返回 200 个工具调用，你会怎么限制？",
      },
      {
        question: "至少一次投递为什么要求消费者幂等？",
        answer: "因为 ack 丢失、Worker 崩溃或网络分区都会导致同一消息被重新投递。消费者必须用幂等键、状态机、唯一约束或外部操作对账，保证重复执行不产生重复副作用。",
        followUp: "付费工具执行成功但 ack 前崩溃，恢复时怎么处理？",
      },
    ],
    drills: [
      {
        title: "有界并发调度器",
        prompt: "实现最多 N 个工具并发执行，任一失败时按策略取消或收集部分结果，并限制总输出大小。",
        strongSignals: ["所有子任务有父作用域", "Semaphore 或工作队列控制并发", "错误和取消能汇合", "输出预算超限时可解释"],
      },
      {
        title: "Worker 恢复题",
        prompt: "队列至少一次投递，Worker 可能在任意步骤崩溃。设计状态、租约、重试和死信。",
        strongSignals: ["任务消息只带稳定 ID", "DB 状态机和租约", "attempt 与错误分类", "不可确定副作用进入 reconciliation"],
      },
    ],
    traps: ["多跑几次测试证明没有竞态", "无界队列先堆内存再说", "cancel 会杀掉一切并自动回滚", "选择 exactly-once 队列就不用幂等"],
  },
  8: {
    number: 8,
    verdict: "安全章节要达到一线工程水平，必须把认证、授权、输入、Secret、审计和 Agent 工具边界讲成确定性策略。尤其不能把 Prompt 当安全边界。",
    focus: ["认证授权区别", "JWT/Session/OAuth", "SQL 注入/XSS/SSRF/CSRF", "RBAC/ABAC", "Prompt injection 与工具沙箱"],
    questions: [
      {
        question: "认证和授权有什么区别？",
        answer: "认证确认调用者是谁，授权判断这个主体是否能对具体资源执行具体动作。强回答要强调每次资源查询和工具调用都要带 tenant/user/action 条件。",
        followUp: "用户已登录但猜测另一个 run_id，如何防止越权读取？",
      },
      {
        question: "JWT 的优点和风险是什么？",
        answer: "JWT 便于无状态验证和跨服务传递声明，但内容通常可解码，撤销困难，长有效期风险大。权限变化和高风险动作不能只依赖旧 token。",
        followUp: "用户被移出 workspace 后，旧 token 还能调用工具怎么办？",
      },
      {
        question: "Prompt injection 怎么防？",
        answer: "不能只靠更强 system prompt。检索内容和工具输出都视为不可信数据；模型只提出意图，后端策略层确定性校验身份、资源、参数、风险和确认。",
        followUp: "网页内容诱导模型读取本地密钥，工具层应如何阻断？",
      },
    ],
    drills: [
      {
        title: "SSRF 防护设计",
        prompt: "实现 URL 抓取工具，禁止访问内网、metadata、file 协议和重定向后的危险地址。",
        strongSignals: ["解析后校验协议和主机", "DNS 后校验 IP 网段", "每次重定向重新检查", "网络 allowlist 和超时"],
      },
      {
        title: "工具权限矩阵",
        prompt: "为只读、可逆写、高风险写三类工具设计授权、确认、审计和输出限制。",
        strongSignals: ["用户主体逐次授权", "确认绑定参数哈希", "Secret 不进模型上下文", "审计能还原谁对什么做了什么"],
      },
    ],
    traps: ["登录成功等于有资源权限", "JWT 是加密且天然可撤销", "ORM 自动免疫所有注入", "隐藏工具描述就算完成授权"],
  },
  9: {
    number: 9,
    verdict: "测试章节的工程强度不是会写几个 happy path，而是能为并发、超时、取消、数据库约束和模型非确定性设计测试。高水平评审会看你是否知道什么该 mock，什么必须真实测。",
    focus: ["测试金字塔", "Mock/Fake 边界", "数据库集成测试", "异步取消测试", "故障注入和回放"],
    questions: [
      {
        question: "单元测试、集成测试、端到端测试怎么分工？",
        answer: "单元测试验证核心规则，集成测试验证真实边界如数据库/HTTP/序列化，端到端覆盖少量关键旅程。越真实越慢越脆弱，所以不是越多越好。",
        followUp: "为什么数据库事务和 UNIQUE 不能只用 Mock 测？",
      },
      {
        question: "Mock、Stub、Fake 的区别是什么？",
        answer: "Stub 返回预设结果，Mock 验证交互，Fake 是简化但可运行实现。模型、时钟、通知适合 Fake；SQL、索引、事务应尽量用真实数据库集成测。",
        followUp: "层层 Mock ORM 调用有什么问题？",
      },
      {
        question: "Agent 输出不稳定，怎么做回归测试？",
        answer: "不要逐字匹配自然语言。应断言结构化事件、状态机、工具调用、权限和成本预算；质量用离线数据集和 rubric，记录模型与 prompt 版本。",
        followUp: "温度设为 0 是否能保证永远相同？",
      },
    ],
    drills: [
      {
        title: "设计测试矩阵",
        prompt: "为创建 run 写测试矩阵：正常、非法输入、越权、数据库唯一冲突、模型超时、取消、重复投递。",
        strongSignals: ["每类风险有对应层级测试", "外部模型用可控 Fake", "数据库约束用真实库", "失败路径断言最终状态"],
      },
      {
        title: "并发复现题",
        prompt: "两个 Worker 同时领取同一任务，普通测试复现不了。设计确定性并发测试。",
        strongSignals: ["使用 barrier 固定交错", "断言最终只有一个 owner", "失败代码可稳定失败", "修复后保留回归测试"],
      },
    ],
    traps: ["端到端测试越多越专业", "flaky test 重跑到绿就行", "Mock 掉数据库还能证明事务正确", "逐字匹配模型回答"],
  },
  10: {
    number: 10,
    verdict: "可观测性训练要能把日志、指标、Trace、SLO 和成本联系起来。成熟工程师不会只说“打日志”，而会说字段、基数、采样、告警阈值和隐私边界。",
    focus: ["结构化日志", "Trace 上下文传播", "指标和标签基数", "SLO 和告警", "Agent 成本观测"],
    questions: [
      {
        question: "日志、指标、Trace 分别解决什么问题？",
        answer: "日志记录离散事件和上下文，指标观察总体趋势和告警，Trace 还原跨服务因果链。三者通过 request_id、trace_id、run_id 等稳定 ID 关联。",
        followUp: "为什么只有 request_id 不够？",
      },
      {
        question: "Prometheus 指标为什么不能把 user_id/run_id 当 label？",
        answer: "因为高基数标签会造成存储和查询爆炸。高基数细节放日志或 Trace，指标标签保持有限枚举，如 route、status、model、error_type。",
        followUp: "你会怎样设计 Agent 的 token 成本指标？",
      },
      {
        question: "如何定位一次 Agent 请求慢在哪里？",
        answer: "拆成排队、路由、数据库、模型首 token、生成、工具、保存和推送。用 histogram 看 p95/p99，用 span 看阶段耗时，并记录队列年龄和供应商请求 ID。",
        followUp: "平均延迟下降，为什么用户仍可能觉得慢？",
      },
    ],
    drills: [
      {
        title: "观测字段设计",
        prompt: "为 tool_call_started/succeeded/failed 设计结构化日志字段，要求可关联、可聚合、可脱敏。",
        strongSignals: ["run_id/turn_id/tool_call_id", "tenant 和风险等级", "duration 和 error_type", "不记录 Secret 和完整敏感正文"],
      },
      {
        title: "SLO 告警题",
        prompt: "为 run 创建成功率和首 token 延迟设计 SLI/SLO/告警。",
        strongSignals: ["以用户旅程定义成功", "关注 p95/p99", "多窗口燃烧率", "告警附排查入口"],
      },
    ],
    traps: ["日志越多越好", "ERROR 越敏感越安全", "平均值代表用户体验", "接入 OTel 后上下文自动跨队列"],
  },
  11: {
    number: 11,
    verdict: "部署章节的一线强度在于能讲清不可变交付、配置、Secret、CI、migration、回滚和长任务排空。只会写 Dockerfile 不够，必须能说明发布失败如何止损。",
    focus: ["Dockerfile 和镜像层", "运行时配置与 Secret", "CI/CD", "兼容 migration", "滚动发布和优雅关闭"],
    questions: [
      {
        question: "Docker 镜像和容器有什么区别？",
        answer: "镜像是不可变只读模板，容器是镜像在运行时加可写层、网络、卷和资源限制形成的进程。生产变更应回到源码和镜像构建，而不是手改容器。",
        followUp: "为什么 RUN rm 删除密钥仍可能泄漏在镜像层？",
      },
      {
        question: "数据库 migration 如何做到零停机？",
        answer: "使用 expand-migrate-contract：先新增兼容结构，部署双读写或兼容代码，回填数据，确认稳定后再移除旧结构。滚动期间新旧应用必须能共存。",
        followUp: "为什么回滚应用不一定能回滚数据？",
      },
      {
        question: "长连接和长任务如何优雅发布？",
        answer: "先 readiness=false 摘除新流量，再等待短请求，向长任务传播取消或写 checkpoint，释放租约和连接，超过宽限期由恢复流程接手。",
        followUp: "SSE 流式路由经过 Nginx 上线后不流式，你会检查哪些配置？",
      },
    ],
    drills: [
      {
        title: "写 Dockerfile 审查清单",
        prompt: "审查一个 Dockerfile：依赖缓存、.dockerignore、非 root、多阶段、Secret、镜像大小和 SBOM。",
        strongSignals: ["区分构建时和运行时配置", "不把 .env 复制进镜像", "固定基础镜像版本", "生产镜像最小权限运行"],
      },
      {
        title: "发布方案题",
        prompt: "Agent loop 新版本可能成本翻倍。设计灰度、监控、自动停止和回滚。",
        strongSignals: ["按 1%-10%-50% 放量", "比较成功率、p95、错误率、成本", "prompt/model/schema 版本化", "外部副作用不可简单回滚时有补偿"],
      },
    ],
    traps: ["latest 标签就是最新可靠版本", "现场构建比制品推广更安全", "K8s 自动提供正确架构", "terminationGracePeriod 无限大最好"],
  },
  12: {
    number: 12,
    verdict: "系统设计是高水平后端训练的高分区。本章必须训练你从需求、容量、数据一致性、故障、扩展、成本讲到落地方案。不能只画组件图。",
    focus: ["容量估算", "服务边界", "一致性取舍", "限流熔断降级", "队列与 outbox", "容灾 RTO/RPO"],
    questions: [
      {
        question: "系统设计题第一步做什么？",
        answer: "先澄清需求和约束：用户规模、QPS、读写比例、延迟、可用性、一致性、安全、成本和增长。然后估算容量，识别核心读写路径，再选择组件。",
        followUp: "为什么上来画微服务图通常不是好答案？",
      },
      {
        question: "CAP 应该怎么在系统设计里讲？",
        answer: "CAP 讨论网络分区下的一致性和可用性取舍，不是平时随意三选二。应针对具体数据说一致性要求：权限和扣费偏强一致，进度展示可以短暂陈旧。",
        followUp: "用户取消 run 后读到旧状态，哪些数据可以旧，哪些不能旧？",
      },
      {
        question: "outbox 模式解决什么问题？",
        answer: "它把数据库状态变更和待发布消息写进同一事务，后台发送器再可靠投递。这样避免“库写成功但消息没发”或“消息发了但库没写”的不一致。",
        followUp: "outbox 发送成功但标记已发送前崩溃，会不会重复？如何处理？",
      },
    ],
    drills: [
      {
        title: "系统设计题：10 万并发 Agent Run",
        prompt: "设计支持 10 万并发 run 的 Agent 平台。要求说明 API、队列、Worker、PostgreSQL、Redis、SSE、模型网关和观测。",
        strongSignals: ["先估算事件吞吐和 token 成本", "控制面和执行面隔离", "状态持久化而非存在单机内存", "模型故障有超时、熔断、降级"],
      },
      {
        title: "一致性题",
        prompt: "创建 run 后必须入队执行。设计数据库事务、outbox、消费者幂等和对账。",
        strongSignals: ["单库事务写 run 与 outbox", "发送器至少一次投递", "消费者用幂等键", "定期扫描未发送和卡住状态"],
      },
    ],
    traps: ["架构图越复杂越高级", "微服务天然比单体强", "有副本就不用备份", "分布式锁能替代业务幂等"],
  },
  13: {
    number: 13,
    verdict: "Agent 后端专项要对齐你的项目方向，但训练仍会按后端标准追问：状态机、工具权限、模型网关、上下文压缩、成本、安全和恢复。强答案必须把概率模型限制在确定性 Runtime 里。",
    focus: ["Agent loop 状态机", "事件溯源和回放", "上下文预算", "模型网关归一", "工具沙箱", "成本和评测"],
    questions: [
      {
        question: "为什么 Agent loop 要写成状态机？",
        answer: "因为状态机能明确每一步、终止条件、预算、暂停、取消、恢复和审计。while true 调模型看似简单，但无法可靠解释循环、工具执行、人工确认和重启恢复。",
        followUp: "waiting_human 状态为什么不能只是一个挂起协程？",
      },
      {
        question: "上下文压缩的底线是什么？",
        answer: "压缩是有损派生表示，不能覆盖原始事件记录。必须保留约束、决策、未完成任务、引用和版本；大工具结果外置，调用前计算 token 预算。",
        followUp: "工具结果把 system 约束挤出窗口，会有什么风险？",
      },
      {
        question: "模型网关为什么需要事件归一？",
        answer: "不同供应商的流式 delta、tool call、usage 和错误语义不同。内部协议稳定后，前端、日志、测试和业务层不依赖某家 SDK，同时仍保留原始元数据用于诊断。",
        followUp: "fallback 到另一个模型时，哪些语义不能悄悄改变？",
      },
    ],
    drills: [
      {
        title: "设计 Codex 类 Agent Runtime",
        prompt: "设计一个可流式、可取消、可恢复、可审计的 Agent Runtime。要求覆盖 run/turn/event、模型网关、工具 Dispatcher、SSE、checkpoint 和权限。",
        strongSignals: ["事件先持久化再推送", "loop 有最大步数、deadline、token 和成本上限", "工具每次调用重新授权", "恢复处理结果未知而非盲目重放"],
      },
      {
        title: "上下文压缩题",
        prompt: "多轮对话和工具输出超出窗口。设计压缩、检索、引用、原始记录和回归测试。",
        strongSignals: ["摘要有版本和覆盖范围", "不可丢约束单独保护", "原始事件不被摘要覆盖", "用回归集验证压缩质量"],
      },
    ],
    traps: ["模型会自己知道何时停", "上下文越长越好", "JSON Schema 通过就代表工具安全", "最终答案质量高就能忽略过程成本"],
  },
};

export const interviewCjkCharacters = [
  interviewAssessment.verdict,
  interviewAssessment.upgradedTo,
  ...interviewAssessment.standards,
  algorithmInterviewTrack.title,
  algorithmInterviewTrack.note,
  ...algorithmInterviewTrack.drills,
  mockInterviewGauntlet.title,
  mockInterviewGauntlet.note,
  ...mockInterviewGauntlet.rounds.flatMap((round) => [round.name, round.scenario, ...round.mustCover]),
  ...Object.values(interviewChapters).flatMap((chapter) => [
    chapter.verdict,
    ...chapter.focus,
    ...chapter.questions.flatMap((item) => [item.question, item.answer, item.followUp]),
    ...chapter.drills.flatMap((item) => [item.title, item.prompt, ...item.strongSignals]),
    ...chapter.traps,
  ]),
].join("").match(/[\u3400-\u9fff]/g)?.length ?? 0;
