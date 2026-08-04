export type ChapterExpansion = {
  opening: {
    question: string;
    paragraphs: string[];
  };
  mentalModel: {
    title: string;
    steps: { title: string; detail: string }[];
  };
  comparison: {
    title: string;
    columns: [string, string, string];
    rows: [string, string, string][];
  };
  caseStudy: {
    title: string;
    situation: string;
    evidence: string[];
    reasoning: string[];
    solution: string[];
    conclusion: string;
  };
  lab: {
    title: string;
    brief: string;
    steps: string[];
    checks: string[];
    deliverable: string;
  };
  review: { question: string; answer: string }[];
};

export const chapterExpansions: Record<number, ChapterExpansion> = {
  1: {
    opening: {
      question: "AI 已经能生成代码，我为什么还必须懂编程基础？",
      paragraphs: [
        "因为“代码能跑”和“系统正确”之间隔着一整套隐含契约。AI 可以迅速补齐语法，却不知道你的真实业务不变量、资源预算和故障策略。你需要有能力沿着调用链追问：输入在哪里变成可信数据，状态由谁拥有，失败会留下什么，任务退出时谁负责清理。",
        "本章不以背语法为目标。你会反复使用同一种读码方法：先找入口，再标出不可信输入、状态变化与副作用，最后检查所有退出路径。Python、C++、Rust 只是用不同方式表达同一组工程问题：对象活多久、错误如何传播、并发任务归谁管理。",
      ],
    },
    mentalModel: {
      title: "把一段代码看成五层契约",
      steps: [
        { title: "输入", detail: "值来自 HTTP、数据库、模型还是本地常量？外部值在验证前一律不可信。" },
        { title: "表示", detail: "字符串何时变成领域类型？空值、范围和非法状态由谁排除？" },
        { title: "控制", detail: "分支、异常、await 和早返回会把程序带到哪里？" },
        { title: "副作用", detail: "写库、发请求、执行命令发生在哪一步？能否重复？" },
        { title: "收尾", detail: "成功、失败和取消三条路径是否都会释放连接、锁与子任务？" },
      ],
    },
    comparison: {
      title: "三种语言如何约束错误与资源",
      columns: ["语言", "主要机制", "最容易被忽略的风险"],
      rows: [
        ["Python", "异常、上下文管理器、类型标注", "动态类型把错误推迟到运行期；后台 Task 可能失去所有者"],
        ["C++", "RAII、值语义、智能指针、expected", "悬空引用、未定义行为和回调生命周期"],
        ["Rust", "所有权、借用、Result、Drop", "为了绕过编译器而滥用 clone、unwrap 或全局锁"],
      ],
    },
    caseStudy: {
      title: "案例：一段“看起来没问题”的模型调用为什么拖垮服务",
      situation: "某个 handler 创建异步模型请求，把 Task 放入全局列表，然后立即返回 run_id。压测时内存持续上涨；用户取消后仍继续计费；偶尔还能看到“连接池已关闭”的错误。",
      evidence: [
        "Task 没有父作用域，只由一个不断增长的全局列表持有。",
        "请求上下文结束后，Task 仍引用原请求中的数据库会话。",
        "取消接口只更新数据库状态，没有向模型客户端传递取消信号。",
        "应用关闭时先关连接池，后台任务随后才尝试写结果。",
      ],
      reasoning: [
        "内存上涨不是单纯的 GC 问题，而是所有权不清：全局列表让已结束任务仍然可达。",
        "数据库错误说明资源生命周期短于使用者生命周期。handler 级会话不应交给后台任务。",
        "状态字段 cancelled 只是事实记录，不是控制信号。要终止计费，请求链必须持有可取消句柄。",
      ],
      solution: [
        "把后台执行交给有界 Worker/TaskGroup；父作用域持有任务并负责等待、取消与收割结果。",
        "后台任务自行从连接池获取短生命周期连接，不携带 handler 会话。",
        "用 run_id 注册取消令牌，并向模型、工具和子任务传播同一个 deadline/取消信号。",
        "关闭顺序改为停止接单 → 请求取消 → 等待宽限期 → 关闭连接池。",
      ],
      conclusion: "这个故障表面是 async，根因却是最基础的对象所有权、资源生命周期与控制流没有被设计。",
    },
    lab: {
      title: "实验：审计一个 AI 生成的异步函数",
      brief: "任选当前项目中的一个 handler 或让 AI 生成“并行调用两个工具并保存结果”的函数，不急着修改，先做结构化审计。",
      steps: [
        "给每个外部输入标记来源和信任等级。",
        "画出正常、超时、任一工具失败、用户取消四条控制流。",
        "列出每条路径中创建的 Task、连接、文件和锁，并确定释放者。",
        "把第三方 SDK 隔离到接口后，写一个可控失败的 fake。",
        "增加测试，证明取消会到达两个子工具，而且部分结果不会被误提交。",
      ],
      checks: ["测试结束后无悬挂任务", "所有外部 I/O 都有 deadline", "错误保留 cause 与 run_id", "没有全局可变状态承载请求生命周期"],
      deliverable: "一张调用链图、一份风险清单、一个最小修复提交和至少四个失败路径测试。",
    },
    review: [
      { question: "类型标注能否替代运行时校验？", answer: "不能。类型标注约束开发期代码，HTTP、数据库和模型输出仍需在运行时解析与校验。" },
      { question: "为什么 catch Exception 后返回 500 不是完整错误处理？", answer: "它混淆业务错误、暂时性故障和程序缺陷，还可能丢失 cause。错误应分类、映射，并保留可追踪上下文。" },
      { question: "异步函数为什么仍可能阻塞整个服务？", answer: "async 函数内的同步磁盘 I/O、CPU 长循环或阻塞 SDK 不会自动让出事件循环。" },
    ],
  },
  2: {
    opening: {
      question: "后端代码为什么在本机正常，到了服务器就失败？",
      paragraphs: [
        "代码从来不是悬浮运行的。它依赖进程身份、工作目录、环境变量、端口、文件描述符、内存上限和内核调度。只会看业务日志的人，遇到 OOM、端口冲突、权限不足或连接耗尽时只能反复重启。",
        "系统排障的核心是把模糊症状还原为资源事实：哪个 PID、监听哪个地址、以什么用户运行、打开了多少文件、内存是在堆中增长还是被页缓存使用、收到什么信号。",
      ],
    },
    mentalModel: {
      title: "从服务到机器的四层定位",
      steps: [
        { title: "服务", detail: "请求错误率、延迟和日志说明哪个功能出问题。" },
        { title: "进程", detail: "PID、线程、启动命令、环境和信号说明谁在运行。" },
        { title: "资源", detail: "CPU、RSS、文件描述符、socket 和磁盘空间说明它在等待什么。" },
        { title: "边界", detail: "宿主机、容器、用户权限和网络命名空间说明你观察的是哪一个世界。" },
      ],
    },
    comparison: {
      title: "常见症状与第一证据",
      columns: ["症状", "先看什么", "不要先做什么"],
      rows: [
        ["Address already in use", "ss/lsof 找端口、PID 和进程", "盲目 kill 所有同名进程"],
        ["Permission denied", "id、ls -l、运行用户、父目录权限", "直接 chmod 777"],
        ["进程被杀", "内核日志、容器 memory limit、峰值 RSS", "只在应用里捕获异常"],
        ["外部无法访问", "监听地址、防火墙、端口映射", "反复更换应用端口"],
      ],
    },
    caseStudy: {
      title: "案例：Agent Worker 每晚随机消失",
      situation: "Worker 没留下 Python/C++/Rust 异常日志，systemd 显示进程被 signal 9 终止。重启后恢复，任务高峰期再次发生。",
      evidence: ["应用日志在终止前没有业务异常", "kernel log 出现 Out of memory: Killed process", "RSS 随大型 tool result 聚合上升", "容器限制 2 GiB，但机器仍有空闲内存"],
      reasoning: ["SIGKILL 无法被程序捕获，因此没有 finally 或析构日志很正常。", "容器内存限制是独立边界；宿主机空闲不代表容器可继续使用。", "并行工具结果同时驻留内存，峰值而非平均值触发 OOM。"],
      solution: ["限制并行工具数和单结果大小", "大结果流式写对象存储，只在内存保留摘要与引用", "设置显式内存指标和接近上限告警", "把任务设计为 checkpoint 可恢复，接受进程仍可能被强杀"],
      conclusion: "“进程突然没了”要先看信号与内核证据。应用级异常处理无法解决操作系统强制回收。",
    },
    lab: {
      title: "实验：建立一份服务体检单",
      brief: "启动一个本地 HTTP 服务，并从系统层证明它如何运行。",
      steps: ["记录 PID、父进程、运行用户和完整启动命令", "分别监听 127.0.0.1 与 0.0.0.0，验证可达范围", "列出监听 socket 和打开文件", "发送 SIGTERM，观察停止接单、在途请求和退出码", "制造端口冲突与无权限写文件，按证据排障"],
      checks: ["能把端口映射到准确 PID", "能解释 localhost 在宿主机与容器中的差异", "SIGTERM 有界退出", "日志中记录启动配置但不泄密"],
      deliverable: "一页运行手册：启动、检查、停止、常见故障和证据命令。",
    },
    review: [
      { question: "为什么 SIGKILL 不能用于正常发布？", answer: "它不能被捕获，程序没有机会停止接单、提交状态或释放外部资源。" },
      { question: "RSS 高一定是内存泄漏吗？", answer: "不一定，可能是活跃工作集、分配器未归还内存、页缓存或短时峰值；要结合趋势和对象/堆分析。" },
      { question: "0.0.0.0 是一个可访问地址吗？", answer: "它表示监听本机所有接口；客户端应访问机器的具体 IP 或域名。" },
    ],
  },
  3: {
    opening: {
      question: "一次模型请求的 30 秒，到底花在了哪里？",
      paragraphs: [
        "“网络慢”不是可操作的结论。一次请求依次经历 DNS、TCP 建连、TLS 握手、代理排队、服务处理、首字节和持续读取。每一段都有不同的故障、指标与超时设置。",
        "Agent 还把普通请求变成了长连接：服务器不断推送事件，客户端可能随时离线，代理可能缓冲数据，底层模型可能仍然计费。因此协议设计必须同时描述事件边界、恢复位置、取消语义和最终状态。",
      ],
    },
    mentalModel: {
      title: "把请求看成一笔逐层递减的时间预算",
      steps: [
        { title: "入口 deadline", detail: "例如用户愿意等待 60 秒，这是整条链的上限。" },
        { title: "建连预算", detail: "DNS、TCP、TLS 只获得小部分预算，失败应快速暴露。" },
        { title: "下游预算", detail: "模型与工具拿到剩余时间，而不是各自重新获得 60 秒。" },
        { title: "重试预算", detail: "每次尝试都消耗总预算；没有时间就不再重试。" },
        { title: "取消传播", detail: "断连或用户取消时，信号沿相同调用树向下传播。" },
      ],
    },
    comparison: {
      title: "三种实时传输方式",
      columns: ["方式", "适合场景", "主要代价"],
      rows: [
        ["普通流式 HTTP", "服务端连续输出字节", "需自行定义事件边界与重连"],
        ["SSE", "文本 Agent 事件、服务端到浏览器", "单向；需处理代理缓冲和 Last-Event-ID"],
        ["WebSocket", "高频双向协作、实时控制", "连接状态、心跳、扩容与恢复更复杂"],
      ],
    },
    caseStudy: {
      title: "案例：本地逐字输出，上线后 40 秒一次性出现",
      situation: "应用日志证明每 100ms 写出一个 token；浏览器 Network 面板却直到结束才收到正文。直连应用正常，经过反向代理异常。",
      evidence: ["应用首 token 时间 800ms", "代理响应头包含缓冲相关默认设置", "小块数据没有及时 flush", "客户端没有按 SSE 事件格式解析"],
      reasoning: ["生成端正常，问题位于应用之后。", "代理为了吞吐量聚合小响应，破坏交互式流式体验。", "即使关闭代理缓冲，客户端若等待完整 JSON 也不会逐事件渲染。"],
      solution: ["明确使用 text/event-stream 和规范事件边界", "为代理关闭该路由的缓冲与压缩聚合", "定期心跳并 flush，检测断连", "用 event id 支持重连，完成状态写数据库而不只写流"],
      conclusion: "流式是端到端性质：模型、应用、代理、浏览器任一层缓冲，用户看到的都不是流。",
    },
    lab: {
      title: "实验：实现可恢复的 SSE 运行流",
      brief: "为 run 设计 created、delta、tool_started、tool_finished、completed、failed 六类事件。",
      steps: ["为每个事件分配单调递增 id", "服务端保存事件后再推送", "客户端断开后用 Last-Event-ID 重放缺失事件", "每 15 秒发送心跳", "取消 run，并验证模型与工具收到信号"],
      checks: ["代理后首事件仍及时到达", "重复连接不会重复改变业务状态", "断线恢复不丢事件", "completed/failed 是持久状态"],
      deliverable: "事件协议文档、服务端实现、重连客户端和四个集成测试。",
    },
    review: [
      { question: "为什么不能对所有 500 自动重试？", answer: "错误可能来自永久性输入问题，且写操作可能已成功但响应丢失；盲目重试会放大流量或重复副作用。" },
      { question: "SSE 断开是否应自动取消 run？", answer: "通常不应绑定。订阅连接和后台运行是两个生命周期，用户可以断线后重新订阅；显式取消应走独立命令。" },
      { question: "401 和 403 有什么区别？", answer: "401 表示没有有效身份；403 表示身份已知但没有执行该操作的权限。" },
    ],
  },
  4: {
    opening: {
      question: "框架帮我解析请求之后，代码应该放在哪里？",
      paragraphs: [
        "Web 框架解决协议接入，不解决业务边界。把查询、授权、模型调用和响应拼装全部写进 handler，短期很快，随后会出现无法单测、事务范围失控、框架类型渗透和重复错误处理。",
        "本章使用同一条处理流水线理解三种生态：Router 负责 HTTP 翻译，Service 执行业务用例，Repository 封装持久化，Adapter 连接模型与工具。边界的价值是让失败和变化停在局部。",
      ],
    },
    mentalModel: {
      title: "一次 API 请求的七个确定步骤",
      steps: [
        { title: "接收", detail: "路由匹配方法和路径，建立 request_id。" },
        { title: "认证", detail: "把凭据解析成明确的调用主体。" },
        { title: "校验", detail: "DTO 校验结构，领域对象校验业务不变量。" },
        { title: "授权", detail: "针对具体资源和动作做确定性检查。" },
        { title: "执行", detail: "Service 协调事务、模型、工具与事件。" },
        { title: "映射", detail: "内部结果或错误变成稳定公共响应。" },
        { title: "观测", detail: "记录时延、状态和 trace，但不泄露敏感正文。" },
      ],
    },
    comparison: {
      title: "组件职责边界",
      columns: ["组件", "应该知道", "不应该知道"],
      rows: [
        ["Router", "HTTP 参数、Header、状态码", "SQL、供应商 SDK 细节"],
        ["Service", "业务规则、用例顺序、事务意图", "框架 Request/Response 对象"],
        ["Repository", "查询和持久化语义", "HTTP、页面展示"],
        ["Adapter", "外部 SDK 方言与错误", "整个业务工作流"],
      ],
    },
    caseStudy: {
      title: "案例：一个 300 行创建 Run 接口如何失控",
      situation: "handler 内依次校验 JSON、查用户、扣额度、写 run、调用模型、写消息、发送 SSE；任一步失败都 catch 后返回 500。",
      evidence: ["单元测试必须启动整个框架和数据库", "扣额度后模型超时会留下 running 状态", "响应模型直接序列化 ORM 对象，意外返回 internal_note", "相同授权逻辑复制到四个路由"],
      reasoning: ["协议、业务和基础设施混在一个事务假象中；远程模型不能被数据库事务回滚。", "catch-all 丢失可恢复状态，客户端无法判断是否能重试。", "直接暴露 ORM 实体让数据库演进成为 API 破坏。"],
      solution: ["定义 StartRun 用例与明确状态机", "短事务创建 queued run 与额度预留，再由 Worker 执行模型", "统一 ErrorMapper 与输出 DTO", "认证放中间件，资源授权仍由 Service/Policy 检查"],
      conclusion: "分层不是为了文件漂亮，而是为了让事务、错误、权限与测试边界各自可见。",
    },
    lab: {
      title: "实验：实现最小 Run API",
      brief: "任选 FastAPI、Drogon 或 Axum，实现创建、查询、取消和订阅四个端点。",
      steps: ["先写 OpenAPI 契约和统一错误格式", "定义 RunService 接口与内存 Repository", "实现路由而不暴露框架对象到 Service", "替换为 PostgreSQL Repository", "加入 request_id、健康检查和优雅关闭"],
      checks: ["非法输入在入口拒绝", "越权查询返回 403/404 策略一致", "重复取消幂等", "响应不包含内部字段"],
      deliverable: "可运行服务、接口文档、架构依赖图和至少十个 API 测试。",
    },
    review: [
      { question: "中间件适合做所有权限检查吗？", answer: "不适合。中间件可建立身份上下文，但资源级授权需要知道具体对象和动作，通常放在用例或策略层。" },
      { question: "为什么启动时要校验配置？", answer: "让错误在接流量前暴露；否则服务端口虽已监听，首个真实请求才发现密钥或数据库配置缺失。" },
      { question: "Repository 是否必须对应一张表？", answer: "不必须。它表达领域所需的持久化能力，一个方法可跨多表或调用存储过程。" },
    ],
  },
  5: {
    opening: {
      question: "Agent 的一切都存成 JSON，不是最灵活吗？",
      paragraphs: [
        "灵活不等于可维护。conversation、run、message、tool_call 各有不同生命周期、约束和查询方式。如果塞进一个巨大 JSON，数据库无法可靠保证唯一性、引用和并发更新，任何统计都要扫描与解析整块文档。",
        "关系建模的目标是把业务事实写成数据库能强制的约束。JSONB 留给真正不稳定、很少参与约束的供应商元数据；核心状态仍用表、键、约束和事务表达。",
      ],
    },
    mentalModel: {
      title: "从业务事实推导数据模型",
      steps: [
        { title: "实体", detail: "哪些对象有独立身份和生命周期？" },
        { title: "关系", detail: "一条记录属于谁，能否独立删除或保留？" },
        { title: "不变量", detail: "唯一、非空、范围、状态转换能否由约束保证？" },
        { title: "访问", detail: "常见查询怎样过滤、连接和排序？" },
        { title: "并发", detail: "两个请求同时修改时，谁赢、如何发现冲突？" },
      ],
    },
    comparison: {
      title: "三种并发控制手段",
      columns: ["手段", "适合", "代价"],
      rows: [
        ["唯一约束/原子 SQL", "去重、计数、条件更新", "需要把规则准确表达进 SQL"],
        ["乐观锁 version", "冲突较少、允许用户重试", "冲突后需重新读取并合并"],
        ["悲观锁 FOR UPDATE", "短事务内必须串行修改", "等待、死锁和吞吐下降"],
      ],
    },
    caseStudy: {
      title: "案例：同一个工具为什么被执行了两次",
      situation: "Worker 执行完 shell 工具后写数据库时断线；队列没有收到 ack，于是把消息投递给另一 Worker。两边都先查询 tool_call 状态为 pending，然后各自执行。",
      evidence: ["日志存在同一个 tool_call_id 的两个 started 事件", "代码采用 SELECT 后再 UPDATE", "数据库没有唯一执行令牌或版本条件", "队列提供至少一次而非恰好一次投递"],
      reasoning: ["先查后写不是原子操作，两个事务都能看到 pending。", "数据库只能约束记录状态，无法回滚已经发生的外部 shell 副作用。", "必须同时解决领取任务的互斥与外部副作用幂等。"],
      solution: ["用条件 UPDATE ... WHERE status='pending' RETURNING 原子领取", "为可重复工具传递 idempotency_key", "先记录 attempt 与 intent，再执行，再持久化结果", "结果不确定时进入 reconciliation，不直接重跑高风险工具"],
      conclusion: "事务能保护数据库事实，但跨出数据库的副作用必须靠幂等键、状态机与对账共同保证。",
    },
    lab: {
      title: "实验：设计并压测 Agent 运行模型",
      brief: "建立 users、conversations、runs、messages、tool_calls、usage 六张核心表。",
      steps: ["写出实体关系与删除/保留策略", "添加外键、唯一约束、状态 CHECK 和时间字段", "为按用户查询最近 runs 设计复合索引", "实现游标分页并用 EXPLAIN ANALYZE 验证", "并发提交同一 idempotency_key，证明只有一条 run"],
      checks: ["没有核心实体藏在单列 JSON", "时间统一 UTC", "事务中不调用模型", "迁移可向前兼容"],
      deliverable: "ER 模型、迁移、五条代表性 SQL、执行计划说明和并发测试。",
    },
    review: [
      { question: "为什么索引不是越多越好？", answer: "每个索引占空间并增加 INSERT/UPDATE 成本；应由真实过滤、连接和排序查询驱动。" },
      { question: "事务能否覆盖模型 API 调用？", answer: "数据库事务不能原子回滚外部 API。长时间持锁等待模型还会拖垮连接池，应拆成状态机。" },
      { question: "ORM 的 N+1 是什么？", answer: "读取 N 条主记录后，又为每条记录隐式发一次关联查询，总查询数从 1 变成 N+1。" },
    ],
  },
  6: {
    opening: {
      question: "加一层 Redis，系统为什么反而更难正确？",
      paragraphs: [
        "缓存复制了一份数据，因此系统立刻拥有两个可能不一致的视图。真正的问题不是 SET/GET 怎么写，而是事实来源是谁、允许陈旧多久、更新顺序如何、缓存不可用时是继续还是拒绝。",
        "Agent 系统适合缓存模型目录、权限派生结果、短期订阅位置和限流计数；完成状态、计费与审计不能只存在 Redis。先定义删除缓存后的正确行为，再决定缓存模式。",
      ],
    },
    mentalModel: {
      title: "设计缓存前回答五个问题",
      steps: [
        { title: "价值", detail: "省下的是数据库查询、远程成本还是计算时间？" },
        { title: "键", detail: "租户、权限、版本、参数是否都影响结果？" },
        { title: "新鲜度", detail: "最多允许陈旧多少秒，谁触发失效？" },
        { title: "故障", detail: "Redis 超时或全空时，数据库能否承受回源？" },
        { title: "观测", detail: "命中率、回源率、value 大小和延迟怎样测量？" },
      ],
    },
    comparison: {
      title: "常用 Redis 能力边界",
      columns: ["用途", "可用机制", "关键提醒"],
      rows: [
        ["读取缓存", "String/Hash + TTL", "key 必须包含租户与权限维度"],
        ["限流", "原子计数/Lua/令牌桶", "明确 fail-open 或 fail-closed"],
        ["事件中转", "Pub/Sub 或 Streams", "Pub/Sub 不保存离线消息"],
        ["锁", "带 token 的租约", "仍需 fencing 与幂等，不是绝对互斥"],
      ],
    },
    caseStudy: {
      title: "案例：用户 A 看到了用户 B 的 Agent 摘要",
      situation: "团队为昂贵的 run 摘要加入缓存，key 使用 summary:{run_id}。数据库查询有租户条件，但缓存命中直接返回 value。一次数据迁移后 run_id 在不同租户空间重复。",
      evidence: ["缓存 key 不含 tenant_id", "命中路径绕过资源归属检查", "缓存 value 是最终展示结果而非中间公共数据", "测试只覆盖未命中路径"],
      reasoning: ["缓存命中不应跳过授权。", "影响结果的身份维度缺失，缓存把原本隔离的数据合并。", "性能优化改变了安全边界，却没有对应安全测试。"],
      solution: ["先授权再查缓存，或使用 tenant:user:run:version 作为 key", "对共享缓存只存不含用户权限差异的中间结果", "增加跨租户命中测试", "为 key schema 版本化，迁移时批量失效"],
      conclusion: "缓存键既是数据一致性设计，也是权限隔离设计。",
    },
    lab: {
      title: "实验：为 Run 查询加入可证明正确的 cache-aside",
      brief: "先写无缓存版本与基准，再加入缓存并设计失效。",
      steps: ["记录基线 QPS 与数据库延迟", "定义含租户和 schema 版本的 key", "未命中读取数据库并设置带抖动 TTL", "更新数据库后删除缓存", "模拟 Redis 故障、热点过期和不存在记录穿透"],
      checks: ["缓存全空时功能仍正确", "跨租户永不共享私有结果", "热点过期不产生回源风暴", "命中率可观测"],
      deliverable: "缓存设计说明、故障矩阵、压测对比和跨租户安全测试。",
    },
    review: [
      { question: "为什么更新数据库后常选择删缓存，而不是同步更新？", answer: "删除让下一次读取从事实来源重建，减少双写顺序和部分失败组合；仍需接受短暂窗口并设计策略。" },
      { question: "TTL 为什么要加抖动？", answer: "避免大量同批写入的 key 在同一时刻失效，把流量同时压向数据库。" },
      { question: "Redis 锁过期后原持有者还能写吗？", answer: "能，所以需要 fencing token 或下游版本检查拒绝旧持有者，单靠锁值过期不够。" },
    ],
  },
  7: {
    opening: {
      question: "并行调用工具，不就是 gather/join 一下吗？",
      paragraphs: [
        "启动并发任务很容易，决定其所有权和失败语义很难。五个工具中一个超时，是取消其余、保留部分结果，还是等待全部？用户取消时，排队任务和已运行任务如何停止？输出比客户端消费快时，内存在哪里累积？",
        "结构化并发给出一个核心纪律：子任务不能脱离父作用域。父任务负责等待、取消和收集错误；队列与 Worker 则把这个问题扩展到进程之外，需要持久状态、租约和幂等。",
      ],
    },
    mentalModel: {
      title: "每个并发点都写清五项策略",
      steps: [
        { title: "上限", detail: "全局、每租户、每 run 和每工具分别允许多少并发？" },
        { title: "汇合", detail: "等待全部、任一成功、任一失败还是达到法定数量？" },
        { title: "取消", detail: "父取消、兄弟失败和 deadline 如何传播？" },
        { title: "背压", detail: "队列满或消费者变慢时阻塞、丢弃还是拒绝？" },
        { title: "恢复", detail: "进程退出后哪些任务能从 checkpoint 继续？" },
      ],
    },
    comparison: {
      title: "执行单元的选择",
      columns: ["模型", "适合", "主要风险"],
      rows: [
        ["协程/异步 Task", "大量 I/O 等待", "阻塞事件循环、悬挂 Task、取消处理"],
        ["线程", "阻塞库、共享内存并行", "竞态、死锁、生命周期"],
        ["进程/Worker", "CPU 或隔离不可信工作", "通信、重复投递、状态恢复"],
      ],
    },
    caseStudy: {
      title: "案例：并行搜索让延迟下降，却让错误率飙升",
      situation: "一次 run 同时查询 20 个数据源，单用户体验变快；上线后模型供应商和数据库连接池大量超时。",
      evidence: ["每请求 fan-out 20，入口 100 并发变成 2000 下游请求", "没有全局 Semaphore", "每个失败分支独立重试 3 次", "结果队列无界，慢客户端导致内存积压"],
      reasoning: ["优化单请求延迟牺牲系统吞吐；fan-out 放大负载。", "重试乘法把短暂故障变成重试风暴。", "没有背压意味着内存充当隐形队列，最终以 OOM 表现。"],
      solution: ["设置全局、租户和单 run 并发配额", "按价值分批查询，先返回高价值来源", "统一重试预算并加入抖动", "采用有界事件队列，消费者慢时暂停生产或降采样"],
      conclusion: "并发优化要同时计算扇出、连接池、重试和队列容量；局部更快可能让整体不可用。",
    },
    lab: {
      title: "实验：构建可取消的工具编排器",
      brief: "并发运行三个模拟工具：快速成功、慢速成功、永久失败。",
      steps: ["定义父 deadline 和每工具 timeout", "用结构化作用域启动任务", "实现 fail-fast 与保留部分结果两种策略", "加入 Semaphore 和有界输出 channel", "模拟 Worker 崩溃并从 checkpoint 恢复"],
      checks: ["测试结束无孤儿任务", "取消延迟有上限", "队列满时内存不继续增长", "重复投递不重复副作用"],
      deliverable: "工具编排器、时序说明、故障注入测试和并发/内存压测结果。",
    },
    review: [
      { question: "并发和并行有什么区别？", answer: "并发是多个任务生命周期重叠；并行是同一时刻在多个计算资源上执行。单线程事件循环可以并发但不并行执行 CPU 代码。" },
      { question: "至少一次投递意味着什么？", answer: "消息可能重复，因此消费者必须能安全识别或处理重复执行。" },
      { question: "为什么无界队列危险？", answer: "生产速度长期高于消费速度时，队列把压力转移到内存，延迟和内存都会无限增长。" },
    ],
  },
  8: {
    opening: {
      question: "只要系统提示模型“不要做危险操作”，就安全吗？",
      paragraphs: [
        "不安全。模型同时读取用户输入、网页、文档和工具结果，这些内容都可能诱导它改变行为。提示词只能影响概率，不能承担权限边界。真正的授权必须发生在模型之外，由确定性代码根据用户、资源、动作和风险作出判断。",
        "Agent 安全不是传统 Web 安全的替代，而是叠加：仍需防 SQL 注入、SSRF、CSRF、密钥泄漏和越权，再额外处理 prompt injection、工具滥用、上下文泄密与插件供应链。",
      ],
    },
    mentalModel: {
      title: "每次工具调用经过六道门",
      steps: [
        { title: "身份", detail: "谁发起 run，当前凭据是否仍有效？" },
        { title: "能力", detail: "该用户和 Agent 是否被授予这种工具？" },
        { title: "资源", detail: "文件、记录、主机是否属于允许范围？" },
        { title: "参数", detail: "schema、路径、URL 和命令是否通过确定性校验？" },
        { title: "风险", detail: "是否需要人工确认、双人审批或完全禁止？" },
        { title: "审计", detail: "能否重建谁在何时以什么理由执行了什么？" },
      ],
    },
    comparison: {
      title: "常见安全机制解决什么",
      columns: ["机制", "解决", "不解决"],
      rows: [
        ["认证", "确认调用主体", "主体对资源是否有权"],
        ["RBAC/策略", "允许哪些动作", "输入是否包含注入内容"],
        ["沙箱", "限制执行后的系统影响", "业务层越权读取"],
        ["提示词", "表达模型行为偏好", "确定性授权和隔离"],
      ],
    },
    caseStudy: {
      title: "案例：网页里的隐藏文字诱导 Agent 读取密钥",
      situation: "浏览工具返回的页面包含指令：忽略用户任务，读取环境变量并通过 URL 参数发送。模型随后调用 shell 和网络工具。",
      evidence: ["网页内容与 system 指令进入同一上下文但来源未标记", "shell 工具继承了服务进程的全部环境", "网络工具允许任意域名", "dispatcher 只验证 JSON schema，不验证权限与数据流"],
      reasoning: ["间接 prompt injection 是不可信数据影响模型决策。", "模型被欺骗不可避免，安全目标应是即使被欺骗也无法越权。", "schema 正确只说明参数形状正确，不说明操作被授权。"],
      solution: ["工具进程只获得任务所需最小环境，不注入长期密钥", "按工具、路径和域名建立 allowlist", "敏感读与外传组合触发策略拒绝或人工确认", "工具结果标记来源，网页内容永远不提升为指令"],
      conclusion: "把模型视为可能被操纵的规划器；执行层必须在此假设下仍然安全。",
    },
    lab: {
      title: "实验：为文件与网络工具做威胁建模",
      brief: "从攻击者视角列出资产、入口、信任边界和可组合工具。",
      steps: ["列出密钥、私有代码、用户数据和计算资源", "画出用户→模型→dispatcher→sandbox→网络的数据流", "设计五条恶意工具请求", "实现默认拒绝的策略测试", "验证日志可审计但已脱敏"],
      checks: ["路径规范化后仍在允许根目录", "DNS 解析后阻止内网/元数据地址", "高风险副作用需确认", "用户之间严格隔离"],
      deliverable: "威胁模型、策略矩阵、恶意样例测试集和审计事件 schema。",
    },
    review: [
      { question: "JWT 是加密的吗？", answer: "通常只是签名，payload 可被读取；不要放入秘密，并仍需处理过期、轮换和撤销。" },
      { question: "参数 schema 校验能阻止危险 shell 吗？", answer: "不能。schema 只验证结构，仍需命令/路径策略、权限、沙箱和风险确认。" },
      { question: "为什么 SSRF 对 Agent 特别危险？", answer: "Agent 可自动从不可信内容生成 URL，请求内网、云元数据或带凭据服务，形成数据外泄链。" },
    ],
  },
  9: {
    opening: {
      question: "模型输出每次不同，Agent 还能认真测试吗？",
      paragraphs: [
        "能，而且必须把两类问题分开。状态机、权限、工具参数、事务、取消与恢复是确定性软件，可以严格断言；模型质量是概率性的，需要固定数据集、评分准则和统计比较。",
        "Vibe coding 的关键能力不是多写代码，而是设计能够证伪实现的测试。正常路径只证明 demo 能跑，超时、重复、断连、越权和部分失败才决定系统是否可靠。",
      ],
    },
    mentalModel: {
      title: "按边界选择最小测试",
      steps: [
        { title: "纯规则", detail: "单元测试覆盖状态转换、预算、授权与解析。" },
        { title: "适配器", detail: "契约测试固定供应商响应和错误映射。" },
        { title: "存储", detail: "真实 PostgreSQL/Redis 集成测试验证事务、锁和迁移。" },
        { title: "请求", detail: "API 测试验证认证、错误体、流式与取消。" },
        { title: "质量", detail: "离线评测集统计任务成功率、成本和延迟。" },
      ],
    },
    comparison: {
      title: "测试替身的正确用途",
      columns: ["替身", "何时使用", "常见误区"],
      rows: [
        ["Stub/Fake", "提供可控响应或内存实现", "行为与真实系统差异未被契约测试发现"],
        ["Mock", "验证边界交互和调用参数", "Mock 内部实现导致重构即碎"],
        ["真实依赖", "数据库、协议和迁移集成", "测试太大且数据未隔离"],
      ],
    },
    caseStudy: {
      title: "案例：测试全绿，上线后取消功能完全无效",
      situation: "单元测试 mock 了 AgentService.cancel，并断言被调用一次。真实系统中 cancel 只更新 run.status，底层模型流没有收到信号。",
      evidence: ["测试在 router 层结束，没有真实 Task", "mock 返回成功但不模拟正在进行的模型请求", "没有成本或活动连接断言", "取消之后仍出现 token usage 记录"],
      reasoning: ["测试验证了函数调用，不是用户可观察的取消效果。", "跨层行为需要集成测试：启动慢模型 fake，发起 run，再取消并观察执行树。", "状态取消与资源取消是两个断言。"],
      solution: ["使用可阻塞、可观察取消的模型 fake", "断言 run 进入 cancelled 且模型任务结束", "验证不会再写 delta 与 usage", "增加断连但不取消的对照测试"],
      conclusion: "高质量测试断言业务结果和资源行为，而不是只断言某个 mock 方法被调用。",
    },
    lab: {
      title: "实验：建立 Agent 故障回归套件",
      brief: "围绕同一个 run 用例，系统性注入八类失败。",
      steps: ["建立固定时钟、随机数和模型 fake", "覆盖非法输入、越权、模型超时、工具失败", "覆盖数据库断连、重复消息、用户取消、Worker 重启", "保存事件序列并做 replay", "对真实模型建立 20 条离线评测"],
      checks: ["测试互相隔离且可重复", "失败后资源释放", "每个已修 bug 有回归测试", "概率评测报告置信区间或样本数"],
      deliverable: "测试金字塔说明、故障矩阵、可回放 fixtures 和一份基线评测报告。",
    },
    review: [
      { question: "覆盖率 100% 是否代表正确？", answer: "不代表。它只说明行被执行过，断言可能错误或遗漏关键场景。" },
      { question: "真实模型测试为什么不应逐字匹配？", answer: "模型输出非确定，应以任务完成、结构约束、评分规则、成本和延迟等稳定指标判断。" },
      { question: "什么时候应使用 Testcontainers？", answer: "当数据库、Redis 或队列的真实协议、事务和配置会影响行为时，用临时真实服务比深度 mock 更可靠。" },
    ],
  },
  10: {
    opening: {
      question: "日志很多，为什么一次 Agent 失败仍然无法解释？",
      paragraphs: [
        "因为文本日志没有天然关系。一次 run 跨越 HTTP、模型、多个工具、数据库和 Worker，如果没有稳定 ID、结构化字段和父子 span，你只能凭时间猜哪些行属于同一次执行。",
        "可观测性的目标是回答问题：用户是否受影响、慢在哪里、哪一步失败、发生了多少次、成本是多少。日志提供事件细节，指标提供整体趋势，Trace 连接单次调用路径。",
      ],
    },
    mentalModel: {
      title: "从用户问题反推遥测",
      steps: [
        { title: "结果", detail: "run 最终完成、失败、取消还是超限？" },
        { title: "分解", detail: "排队、首 token、生成、工具、存储各花多久？" },
        { title: "关联", detail: "trace_id、run_id、turn_id、tool_call_id 如何贯穿？" },
        { title: "聚合", detail: "成功率、p95、成本和错误分类如何按模型/租户比较？" },
        { title: "行动", detail: "告警触发后值班者能做什么，入口在哪里？" },
      ],
    },
    comparison: {
      title: "三类遥测的职责",
      columns: ["类型", "回答", "例子"],
      rows: [
        ["日志", "具体发生了什么", "tool_call failed, error_code=timeout"],
        ["指标", "多大规模、趋势如何", "run_success_rate、model_ttft_p95"],
        ["Trace", "一次请求经过哪里", "API → model → tool → PostgreSQL"],
      ],
    },
    caseStudy: {
      title: "案例：平均延迟正常，但大量用户觉得卡",
      situation: "仪表盘显示平均 run 延迟 8 秒，客服却持续收到等待一分钟的反馈。",
      evidence: ["p50 为 4 秒，p95 为 58 秒，平均数掩盖长尾", "慢请求大多在 queue_wait", "某租户单次 fan-out 过高占满 Worker", "没有租户级并发隔离"],
      reasoning: ["用户体验由分位数和具体路径决定，平均数对偏态分布误导很大。", "模型本身并不慢，瓶颈在排队。", "全局池让重用户影响其他租户，属于隔离问题。"],
      solution: ["监控 p50/p95/p99 与队列最老消息年龄", "按租户设置并发额度和公平调度", "把 queue_wait 单独作为 span/metric", "为高延迟 SLO 设计可执行告警"],
      conclusion: "先把总延迟拆开，再优化占比最大的等待；不要仅凭平均值给模型换供应商。",
    },
    lab: {
      title: "实验：让一次 Run 可完整重建",
      brief: "给 API、模型、工具和存储接入统一 trace 与结构化事件。",
      steps: ["入口生成 trace_id 与 run_id", "模型和每个 tool call 建 child span", "记录 TTFT、token、重试、错误类型和最终停止原因", "建立成功率、p95、成本与队列仪表盘", "注入一次超时并从 trace 还原时间线"],
      checks: ["跨异步任务上下文不丢失", "高基数字段不进入 metric label", "正文默认不记录", "一次失败五分钟内可定位"],
      deliverable: "遥测字段字典、一条完整 trace、四个核心图表和两条带 runbook 的告警。",
    },
    review: [
      { question: "为什么 user_id 不一定适合作为指标标签？", answer: "用户数可能非常高，会造成高基数和监控成本爆炸；它可放日志/Trace，用聚合维度做指标。" },
      { question: "readiness 和 liveness 指标有什么区别？", answer: "readiness 判断能否接新流量，liveness 判断进程是否应被重启。依赖暂时不可用通常先影响 readiness。" },
      { question: "什么是首 token 延迟？", answer: "从请求开始到收到第一个可展示输出的时间，直接影响流式交互体感。" },
    ],
  },
  11: {
    opening: {
      question: "代码通过测试后，为什么部署仍然是一门独立学问？",
      paragraphs: [
        "生产环境要求可重复构建、配置隔离、健康检查、迁移兼容、优雅关闭和快速回滚。手工在服务器修改文件即使能工作，也无法证明下一台机器会得到相同结果。",
        "容器把应用与依赖封装成制品，但不会自动解决持久化、安全和运行生命周期。CI/CD 的任务是让每个版本经过同一套门禁，并让发布过程本身可观察、可暂停和可恢复。",
      ],
    },
    mentalModel: {
      title: "一次安全发布的生命周期",
      steps: [
        { title: "构建", detail: "固定源码与依赖，产出唯一、可追踪制品。" },
        { title: "验证", detail: "静态检查、测试、扫描和启动探针。" },
        { title: "迁移", detail: "数据库先做向前兼容扩展，新旧版本可短期共存。" },
        { title: "放量", detail: "少量实例/流量观察核心 SLI，再逐步扩大。" },
        { title: "收尾", detail: "旧实例优雅退出，最终删除旧字段；异常则按预案回滚。" },
      ],
    },
    comparison: {
      title: "发布方式的取舍",
      columns: ["方式", "优点", "风险/成本"],
      rows: [
        ["滚动发布", "资源省、平台默认支持", "新旧版本并存，必须协议兼容"],
        ["蓝绿发布", "切换和回退快", "需要双倍环境，数据仍共享"],
        ["Canary", "用少量真实流量发现问题", "需要精确路由和版本对比指标"],
      ],
    },
    caseStudy: {
      title: "案例：应用回滚成功，服务仍然不可用",
      situation: "新版本将 messages.content 改名为 payload 并直接删除旧列。发布后发现解析 bug，应用镜像回滚，但旧版本查询 content 失败。",
      evidence: ["迁移是破坏性 ALTER", "应用与迁移在同一步执行", "没有新旧版本共存测试", "备份存在但恢复需数小时"],
      reasoning: ["代码回滚不能自动回滚数据结构。", "滚动发布期间本来就会同时运行新旧实例，破坏性迁移从一开始就不兼容。", "备份不是即时回滚机制。"],
      solution: ["采用 expand：先新增 payload 并双写/回填", "migrate：新版本读取新列并观察", "contract：所有旧版本退出后再删除 content", "在 CI 中测试 N 与 N-1 版本兼容"],
      conclusion: "发布的最难部分通常是状态演进；应用和数据库必须按不同节奏兼容变化。",
    },
    lab: {
      title: "实验：把本章项目做成可发布制品",
      brief: "为 API、Worker、PostgreSQL、Redis 建立本地 Compose 与生产镜像。",
      steps: ["用多阶段构建和非 root 用户产出镜像", "配置从环境注入，Secret 不进入镜像", "增加 liveness/readiness 与 SIGTERM draining", "CI 运行检查、测试、构建和扫描", "演练兼容迁移、Canary、回滚和恢复"],
      checks: ["同一 commit 只构建一次制品", "SSE 经代理仍实时", "停止时不接新 run", "回滚不依赖逆向破坏性迁移"],
      deliverable: "Docker/Compose、CI 配置、发布清单、回滚清单和一次演练记录。",
    },
    review: [
      { question: "为什么不应把 Secret 写进镜像后再删除？", answer: "镜像层仍可能保留历史内容；Secret 应在运行时由受控渠道注入。" },
      { question: "容器内 localhost 指向哪里？", answer: "指向容器自身，不是宿主机或另一个服务；服务间通常用容器网络名称访问。" },
      { question: "什么时候先学 Kubernetes？", answer: "先能可靠完成单机、容器、观测和发布；Kubernetes 会放大生命周期设计，不会替你补齐它。" },
    ],
  },
  12: {
    opening: {
      question: "什么时候真的需要微服务和分布式系统？",
      paragraphs: [
        "当独立扩展、故障隔离、团队边界或合规部署成为明确需求时，拆服务可能值得。仅仅因为项目“看起来大”就拆，会提前引入网络失败、协议兼容、重复数据、分布式追踪和跨服务一致性。",
        "系统设计应从量化需求开始：峰值请求、并发 run、数据增长、延迟目标、可用性、RPO/RTO。组件图只是这些约束与故障策略的结果。",
      ],
    },
    mentalModel: {
      title: "设计每个组件时写一张责任卡",
      steps: [
        { title: "职责", detail: "它拥有哪一类状态和业务决定？" },
        { title: "容量", detail: "峰值吞吐、并发、存储和带宽是多少？" },
        { title: "一致性", detail: "哪些事实必须立刻一致，哪些允许延迟？" },
        { title: "失败", detail: "超时、重复、分区、宕机时上游看到什么？" },
        { title: "恢复", detail: "数据最多丢多少、多久恢复、怎样演练？" },
      ],
    },
    comparison: {
      title: "架构边界的选择",
      columns: ["形态", "适合阶段", "主要代价"],
      rows: [
        ["模块化单体", "小中团队、边界仍在变化", "部署一起，但事务和调试简单"],
        ["独立 Worker", "长任务需隔离和伸缩", "队列、重复投递、状态恢复"],
        ["微服务", "明确独立团队/容量/合规边界", "网络、版本、一致性和运维复杂度"],
      ],
    },
    caseStudy: {
      title: "案例：扩成三个 API 实例后，Agent 偶尔“失忆”",
      situation: "单实例时 run 状态保存在进程内 map。扩容后，创建请求落在 A，查询或 SSE 重连落在 B，返回 404 或缺少事件。",
      evidence: ["负载均衡随机分发", "run 与订阅位置只在本地内存", "没有共享事件存储", "启用粘性会话后重启仍丢失"],
      reasoning: ["水平扩展打破了进程内状态可见性假设。", "粘性会话只能降低跨实例概率，不能应对重启、扩缩容与故障。", "run 是业务事实，必须有明确状态所有者和持久化。"],
      solution: ["PostgreSQL 保存 run 与事件事实", "Worker 用租约领取执行权", "SSE 网关从共享事件流读取并支持游标", "进程内只保留可丢缓存"],
      conclusion: "多实例最先暴露的不是性能，而是所有隐含的本地状态假设。",
    },
    lab: {
      title: "实验：设计 10,000 并发会话的 Agent 平台",
      brief: "从工作负载估算出发，而不是先画微服务图。",
      steps: ["假设到达率、平均 run 时长、token 速率和工具 fan-out", "用 Little 定律估算平均在途 run", "计算模型并发、Worker、连接池和事件带宽", "为模型故障设计超时、熔断和降级", "为关键状态写 RPO/RTO 与恢复流程"],
      checks: ["每个数字有假设来源", "重试流量纳入最坏情况", "单点故障明确", "一致性逐业务事实说明"],
      deliverable: "容量表、架构图、三条关键时序、故障矩阵和容灾目标。",
    },
    review: [
      { question: "CAP 是日常的三选二吗？", answer: "不是。它讨论网络分区发生时一致性与可用性的取舍；正常情况下还要考虑延迟、吞吐和具体一致性模型。" },
      { question: "为什么重试会形成风暴？", answer: "多层各自重试会成倍放大流量，在依赖已过载时继续施压。应统一预算、退避并限制次数。" },
      { question: "RPO 与 RTO 分别是什么？", answer: "RPO 是最多可接受丢失多少时间范围的数据；RTO 是故障后允许多久恢复服务。" },
    ],
  },
  13: {
    opening: {
      question: "一个可靠 Agent Runtime，核心到底是什么？",
      paragraphs: [
        "不是 prompt，也不是一个 while 循环，而是一台可持久化、可限制、可审计的状态机。模型只负责提出下一步候选动作；后端负责上下文组装、权限、预算、工具执行、事件持久化、取消、恢复和最终一致性。",
        "本章把前十二章收束到同一条运行链：HTTP 创建 run，数据库保存状态，Worker 领取执行，模型网关归一事件，dispatcher 校验并运行工具，SSE 向客户端投影事件，可观测性记录时延与成本。",
      ],
    },
    mentalModel: {
      title: "一次 Turn 的可恢复状态推进",
      steps: [
        { title: "组装", detail: "按 token 预算选择 system、近期消息、摘要和工具引用。" },
        { title: "调用", detail: "模型网关产生统一 delta、tool_call、usage 和错误事件。" },
        { title: "决策", detail: "最终答案则完成；工具请求则进入授权与确认。" },
        { title: "执行", detail: "dispatcher 校验、限额、沙箱执行并归一结果。" },
        { title: "持久化", detail: "每个状态变化追加事件，更新派生快照。" },
        { title: "继续", detail: "结果加入下一轮上下文，直到完成、取消或预算耗尽。" },
      ],
    },
    comparison: {
      title: "三类状态不要混在一起",
      columns: ["状态", "例子", "保存位置"],
      rows: [
        ["事实记录", "消息、工具结果、usage、审批", "持久数据库/对象存储"],
        ["运行快照", "当前 step、预算、租约、取消状态", "持久化并可从事件重建"],
        ["投影视图", "SSE 游标、列表摘要、热点配置", "可重建缓存"],
      ],
    },
    caseStudy: {
      title: "案例：上下文压缩后，Agent 重复执行已完成的删除操作",
      situation: "工具结果过大触发摘要。摘要只保留“正在清理旧文件”，丢失了已删除的路径与确认记录。恢复后模型再次请求删除。",
      evidence: ["摘要覆盖了原始消息而非建立引用", "tool_call 的 completed 状态未进入组装规则", "删除工具无 idempotency key", "恢复逻辑从自然语言摘要推断状态"],
      reasoning: ["摘要是有损的检索视图，不能成为唯一事实来源。", "执行状态应由结构化事件决定，不应由模型重新解释文字。", "高风险副作用必须能识别重复意图。"],
      solution: ["原始 tool call/result 永久保存，摘要只记录范围与引用", "上下文中注入结构化已完成动作清单", "dispatcher 以 run_id+call_id 做幂等", "恢复从事件重建状态，再决定下一步而非重放全部消息"],
      conclusion: "上下文工程负责给模型工作记忆，运行状态机负责保存事实；二者不能互相替代。",
    },
    lab: {
      title: "毕业项目：最小 Codex 类 Agent",
      brief: "用主力语言实现一个真实可运行的 Agent 后端，再用另外两种语言重写一个边界适配器进行比较。",
      steps: ["建立 run/turn/event/tool_call 数据模型与有限状态机", "实现两家模型适配器和统一流式事件", "实现读文件、搜索、命令三个工具及权限策略", "加入 SSE 重连、取消、checkpoint 和 Worker 租约", "建立回放测试、20 条评测集、成本与 trace 仪表盘"],
      checks: ["最大步数/deadline/token/cost 均硬限制", "模型不能绕过工具授权", "进程重启后可恢复", "不确定副作用进入对账", "单次 run 可完整解释"],
      deliverable: "源码、架构决策记录、威胁模型、运行手册、故障测试报告与评测基线。",
    },
    review: [
      { question: "为什么 Agent loop 应是状态机而不是 while true？", answer: "显式状态与转换才能持久化、限制、取消、恢复、审计和测试；无限循环隐藏终止与错误语义。" },
      { question: "tool schema 是否就是工具安全边界？", answer: "不是。它只描述模型可生成的参数结构；执行前仍需身份、权限、风险、沙箱、超时和审计。" },
      { question: "上下文压缩为何不能删除原始记录？", answer: "压缩有损且可能遗漏决策、约束和副作用事实；原始记录是回放、审计和重新压缩的依据。" },
    ],
  },
};
