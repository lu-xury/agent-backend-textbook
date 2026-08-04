"use client";

import { useEffect, useMemo, useState } from "react";
import { chapterExpansions } from "./textbook-expansions";
import { deepChapters, deepVolumeCjkCharacters } from "./textbook-volume";
import type { DeepUnit } from "./volume/types";

type Language = "python" | "cpp" | "rust";
type Level = "P0" | "P1";

type CodeSet = Record<Language, string>;

type Lesson = {
  id: string;
  title: string;
  level: Level;
  lead: string;
  paragraphs?: string[];
  points?: string[];
  code?: { title: string; note: string; snippets: CodeSet };
  takeaway?: string;
};

type Chapter = {
  number: number;
  short: string;
  title: string;
  subtitle: string;
  hours: string;
  outcome: string;
  goals: string[];
  lessons: Lesson[];
  practice: string[];
  done: string[];
};

const languages: { id: Language; label: string; ecosystem: string }[] = [
  { id: "python", label: "Python", ecosystem: "FastAPI · asyncio" },
  { id: "cpp", label: "C++", ecosystem: "Drogon · Boost.Asio" },
  { id: "rust", label: "Rust", ecosystem: "Axum · Tokio" },
];

const languageGuidance: Record<number, Record<Language, string>> = {
  1: { python: "用 uv + pytest + ruff 建一个类型清晰的小包；重点理解对象引用、异常、上下文管理器与 asyncio。", cpp: "用 CMake + Catch2 + clang-tidy 建一个小库；重点理解值语义、引用、智能指针、RAII 与协程生命周期。", rust: "用 Cargo 建一个库与二进制；重点理解所有权、借用、Result、trait、迭代器与 async Future。" },
  2: { python: "观察 CPython 进程、GIL、multiprocessing 与文件描述符；用 signal 处理优雅退出。", cpp: "观察线程、堆栈、动态库和 core dump；用 RAII 管理系统资源，用 stop_token 协作停止。", rust: "理解可执行文件、Send/Sync、panic 与系统调用边界；用 tracing 观察 Tokio 运行时。" },
  3: { python: "使用 httpx/asyncio 实验连接池、deadline 与 SSE 客户端。", cpp: "使用 Boost.Asio/Beast 理解 socket、executor、timer、TLS 与对象生命周期。", rust: "使用 reqwest/hyper 理解 Future、连接池、Tower timeout 与流式 Body。" },
  4: { python: "主线框架：FastAPI + Pydantic + Uvicorn。", cpp: "主线框架：Drogon；需要更底层控制时学习 Boost.Asio/Beast。", rust: "主线框架：Axum + Tower + Serde + Tokio。" },
  5: { python: "使用 psycopg/asyncpg 或 SQLAlchemy，并始终观察真实 SQL。", cpp: "使用 libpqxx 或 Drogon ORM，重点管理连接、事务的 RAII 边界。", rust: "使用 SQLx 或 Diesel，让查询、事务与错误类型保持显式。" },
  6: { python: "使用 redis-py asyncio 客户端，测试超时、池耗尽和降级。", cpp: "使用 redis-plus-plus/hiredis，明确连接所有权与异步回调生命周期。", rust: "使用 redis crate，结合 Tokio Semaphore 控制并发和超时。" },
  7: { python: "主线：asyncio TaskGroup；CPU 工作交给进程池，后台队列可选 Celery/Dramatiq。", cpp: "主线：std::jthread/stop_token + Asio executor；明确每个对象在哪个线程销毁。", rust: "主线：Tokio task、JoinSet、channel 与 CancellationToken；用类型系统约束跨线程共享。" },
  8: { python: "关注动态类型输入校验、依赖注入中的权限上下文和 subprocess 沙箱。", cpp: "关注内存安全、未定义行为、依赖供应链与系统调用沙箱。", rust: "利用内存安全基础，但仍要防逻辑授权错误、不安全代码与依赖风险。" },
  9: { python: "pytest + pytest-asyncio + testcontainers；用 Protocol 替换边界。", cpp: "Catch2/GoogleTest + Sanitizers + Valgrind；用接口或模板注入测试替身。", rust: "cargo test + proptest + testcontainers；结合 clippy 与 Miri 检查边界。" },
  10: { python: "logging/structlog + OpenTelemetry；注意异步上下文中的 trace 传播。", cpp: "spdlog + OpenTelemetry C++；关注线程、协程与回调间上下文传播。", rust: "tracing + tracing-opentelemetry；用 span 贯穿 Future 和工具任务。" },
  11: { python: "构建精简运行镜像，固定解释器和依赖锁；明确 Worker 数与异步模型。", cpp: "使用多阶段构建产出最小二进制，处理动态库、符号和 core dump。", rust: "多阶段构建 release 二进制，处理 libc/静态链接选择并保留诊断信息。" },
  12: { python: "不要让进程内 dict 成为多实例共享状态；关注 Worker 模型和全局对象。", cpp: "关注线程安全、服务发现、连接池隔离及二进制协议兼容。", rust: "用显式状态容器与 trait boundary 组织服务，关注异步锁和分布式一致性区别。" },
  13: { python: "适合快速构建编排层：FastAPI + asyncio + Pydantic；CPU/不可信工具放进隔离 Worker。", cpp: "适合高性能工具运行时与底层沙箱；模型编排层仍需保持状态机与协议清晰。", rust: "适合可靠 Agent Runtime：Axum + Tokio + Serde；所有权有助于约束任务和资源生命周期。" },
};

const chapters: Chapter[] = [
  {
    number: 1,
    short: "代码基础",
    title: "编程与代码基础",
    subtitle: "建立跨语言的代码阅读、边界设计与错误定位能力",
    hours: "12–16 小时",
    outcome: "你能沿着请求追踪数据与控制流，理解 Python、C++、Rust 的资源和错误模型，并审查 AI 生成代码的边界。",
    goals: [
      "读懂值、引用、所有权与生命周期对程序行为的影响",
      "用函数、模块、类型与接口建立清晰边界",
      "正确处理错误、资源释放、同步与异步任务",
      "掌握依赖注入、常见模式、工程目录和质量工具",
    ],
    lessons: [
      {
        id: "execution-model",
        title: "1.1 从数据流和控制流读代码",
        level: "P0",
        lead: "阅读后端代码时先找入口、数据和副作用，不要从第一行开始逐字翻译。",
        paragraphs: [
          "控制流回答“下一步执行哪里”：顺序、分支、循环、函数调用和异常跳转。数据流回答“值从哪里来、经过什么转换、最终写到哪里”。后端故障通常出现在两者交叉处，例如参数被转成错误类型，或写库前遗漏权限检查。",
          "三种语言的核心差异不在 if/for 语法，而在值的传递方式。Python 名称绑定到对象；C++ 需要区分值、引用、指针及对象生命周期；Rust 把所有权、借用和生命周期放进编译期规则。",
        ],
        points: [
          "先定位入口：HTTP handler、消息消费者、CLI main 或定时任务",
          "标出不可信输入：请求体、Header、数据库结果、模型输出、工具返回",
          "标出副作用：写数据库、文件、网络请求、发送消息、执行命令",
          "沿调用链追踪：输入 → 校验 → 业务规则 → 副作用 → 响应",
        ],
        code: {
          title: "同一段业务逻辑：解析并校验任务",
          note: "注意三种语言如何表达“可能失败”和“数据所有权”，而不是只比较语法。",
          snippets: {
            python: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Task:\n    name: str\n    retries: int\n\ndef parse_task(payload: dict) -> Task:\n    name = str(payload.get("name", "")).strip()\n    retries = int(payload.get("retries", 0))\n    if not name:\n        raise ValueError("name is required")\n    if not 0 <= retries <= 5:\n        raise ValueError("retries must be 0..5")\n    return Task(name=name, retries=retries)`,
            cpp: `#include <expected>\n#include <string>\n\nstruct Task {\n  std::string name;\n  int retries;\n};\n\nstd::expected<Task, std::string> parse_task(\n    std::string name, int retries) {\n  if (name.empty())\n    return std::unexpected("name is required");\n  if (retries < 0 || retries > 5)\n    return std::unexpected("retries must be 0..5");\n  return Task{std::move(name), retries};\n}`,
            rust: `#[derive(Debug)]\nstruct Task {\n    name: String,\n    retries: u8,\n}\n\nfn parse_task(name: String, retries: u8)\n    -> Result<Task, String>\n{\n    if name.trim().is_empty() {\n        return Err("name is required".into());\n    }\n    if retries > 5 {\n        return Err("retries must be 0..5".into());\n    }\n    Ok(Task { name, retries })\n}`,
          },
        },
        takeaway: "审查 AI 代码时，先画出入口、校验点和副作用；如果三者混在一个巨型函数里，维护风险已经出现。",
      },
      {
        id: "functions-types",
        title: "1.2 函数、类型、模块与契约",
        level: "P0",
        lead: "函数不是代码容器，而是一份契约：需要什么、保证什么、可能怎样失败。",
        paragraphs: [
          "好的函数名称表达意图，参数数量有限，返回值能描述结果。类型是可执行的设计文档：它把“不允许的状态”尽量挡在业务逻辑之外。模块则负责建立可替换、可测试的边界。",
          "Python 的类型标注主要由静态检查器验证；C++ 的模板、concept 和类型系统在编译期工作；Rust 常用 enum、trait 和泛型表达业务状态。不要为了抽象而抽象，先让边界对应真实的变化原因。",
        ],
        points: [
          "输入 DTO 与领域对象分开：外部格式不应渗透整个系统",
          "避免 bool 参数和裸字符串承载多个业务含义",
          "让错误成为契约的一部分：异常、expected 或 Result",
          "模块依赖指向稳定抽象，而不是具体 SDK",
        ],
        code: {
          title: "用接口隔离模型供应商",
          note: "业务层只依赖 ChatModel 契约，因此可以测试、替换供应商或添加缓存。",
          snippets: {
            python: `from typing import Protocol\n\nclass ChatModel(Protocol):\n    async def complete(self, prompt: str) -> str: ...\n\nclass AgentService:\n    def __init__(self, model: ChatModel):\n        self._model = model\n\n    async def run(self, goal: str) -> str:\n        return await self._model.complete(goal)`,
            cpp: `struct ChatModel {\n  virtual ~ChatModel() = default;\n  virtual Task<std::string> complete(\n      std::string prompt) = 0;\n};\n\nclass AgentService {\n public:\n  explicit AgentService(ChatModel& model)\n      : model_(model) {}\n private:\n  ChatModel& model_;\n};`,
            rust: `#[async_trait]\ntrait ChatModel: Send + Sync {\n    async fn complete(&self, prompt: &str)\n        -> anyhow::Result<String>;\n}\n\nstruct AgentService<M: ChatModel> {\n    model: M,\n}`,
          },
        },
        takeaway: "当业务代码直接 import 某家模型 SDK 时，供应商细节已经越过边界；先定义你的契约，再写适配器。",
      },
      {
        id: "errors-resources",
        title: "1.3 错误、资源与生命周期",
        level: "P0",
        lead: "可靠后端的关键不是永不出错，而是错误发生后资源仍能释放、状态仍然一致。",
        paragraphs: [
          "错误可分为可预期业务错误、暂时性基础设施错误和程序缺陷。三者应采用不同策略：给用户可理解反馈、有限重试与降级、立即暴露并修复。不要用一个 catch-all 把它们全部变成 500。",
          "Python 用 with/finally 管理资源；C++ 依靠 RAII，让析构函数释放资源；Rust 通过所有权与 Drop 在离开作用域时清理。数据库连接、锁、文件和网络响应都必须有明确归还路径。",
        ],
        points: [
          "只捕获你能处理的错误，保留原始 cause 和上下文",
          "错误日志包含操作、实体 ID、请求 ID，但不包含密钥和完整隐私数据",
          "跨越事务边界前想清楚：前半段成功、后半段失败时如何恢复",
          "析构或 finally 中不要静默执行可能失败的关键业务操作",
        ],
        code: {
          title: "资源释放：三种语言的惯用写法",
          note: "共同目标是让早返回和异常路径也不会泄漏连接。",
          snippets: {
            python: `async def load_user(pool, user_id: str):\n    async with pool.acquire() as conn:\n        row = await conn.fetchrow(\n            "SELECT * FROM users WHERE id=$1",\n            user_id,\n        )\n        if row is None:\n            raise UserNotFound(user_id)\n        return dict(row)`,
            cpp: `User load_user(ConnectionPool& pool, Id id) {\n  auto connection = pool.acquire(); // RAII handle\n  auto row = connection->query_one(\n      "SELECT * FROM users WHERE id = ?", id);\n  if (!row) {\n    throw UserNotFound{id};\n  }\n  return to_user(*row);\n} // connection automatically returned`,
            rust: `async fn load_user(\n    pool: &PgPool, id: Uuid\n) -> Result<User, AppError> {\n    let user = sqlx::query_as!(\n        User, "SELECT * FROM users WHERE id = $1", id\n    )\n    .fetch_optional(pool)\n    .await?\n    .ok_or(AppError::UserNotFound(id))?;\n    Ok(user)\n}`,
          },
        },
        takeaway: "看到 open/acquire/lock，就立即寻找对应的 close/release/unlock，以及早返回时是否仍然成立。",
      },
      {
        id: "iteration-composition",
        title: "1.4 迭代、闭包与代码复用",
        level: "P0",
        lead: "生成器、迭代器和闭包让你处理流式数据而不必一次加载全部内容。",
        paragraphs: [
          "Agent 后端经常处理 token 流、日志流和大型工具结果。迭代器把“如何产生下一个值”与“如何消费值”分开，生成器可以按需生产。闭包捕获周围状态，适合小型回调，但捕获生命周期必须清楚。",
          "装饰器、C++ 泛型包装器和 Rust 宏/高阶函数都能添加日志、重试等横切能力。它们会隐藏控制流，因此必须保持薄、可预测，并避免在装饰层偷偷改变业务语义。",
        ],
        points: [
          "大型结果优先流式迭代，避免无界内存增长",
          "闭包捕获的是值还是引用？异步执行时对象还存在吗？",
          "重试装饰器只能包住幂等操作或带幂等键的操作",
          "能用普通函数表达时，不要首先使用元编程",
        ],
        takeaway: "抽象的价值是减少重复决策，不是减少代码行数；隐藏关键控制流的“聪明代码”通常不划算。",
      },
      {
        id: "async-model",
        title: "1.5 同步、异步与取消",
        level: "P0",
        lead: "async 让一个线程在等待 I/O 时服务其他任务，但不会自动让 CPU 计算变快。",
        paragraphs: [
          "事件循环调度就绪任务。await 表示当前任务可以暂停，让出执行权；如果在异步函数中执行阻塞 I/O 或长时间 CPU 计算，整个执行器仍可能被卡住。Python 常把 CPU 工作交给进程池；C++ 需要明确执行器和对象生命周期；Rust 的 Future 是惰性的，通常由 Tokio 调度。",
          "生产代码必须同时设计超时和取消。用户关闭页面后，HTTP handler、模型请求、并行工具与数据库查询应形成可传播的取消链。只停止向客户端输出，不等于停止底层计费任务。",
        ],
        points: [
          "每个外部 I/O 都设置合理超时",
          "区分连接超时、读取超时和整个操作的 deadline",
          "限制并发数量，避免一次请求创建无界任务",
          "明确取消后的清理、提交点和可恢复状态",
        ],
        code: {
          title: "并发调用两个独立工具",
          note: "并发不是 fire-and-forget：错误、超时与取消仍要汇合到父任务。",
          snippets: {
            python: `async with asyncio.timeout(10):\n    weather, calendar = await asyncio.gather(\n        get_weather(city),\n        get_calendar(user_id),\n    )`,
            cpp: `auto [weather, calendar] = co_await when_all(\n    get_weather(city, stop_token),\n    get_calendar(user_id, stop_token)\n);\n// deadline timer requests stop for both children`,
            rust: `let result = tokio::time::timeout(\n    Duration::from_secs(10),\n    async { tokio::try_join!(\n        get_weather(&city),\n        get_calendar(user_id),\n    ) },\n).await??;`,
          },
        },
        takeaway: "任何创建子任务的地方都要回答：谁等待它、谁取消它、错误交给谁、退出时它是否还活着？",
      },
      {
        id: "engineering-basics",
        title: "1.6 包、配置、Git 与调试",
        level: "P0",
        lead: "工程基础的目标是让任何人都能重现运行环境，并从一次失败快速定位到代码位置。",
        paragraphs: [
          "锁文件记录实际依赖版本；配置区分代码默认值、环境差异和秘密。不要把 API Key 写进仓库，也不要让每个模块各自读取环境变量。由程序入口一次读取、校验，再注入业务模块。",
          "遇到错误先读最内层原因和第一处属于你项目的栈帧，然后构造最小复现。Git 提交应小而完整，说明为何改变。AI 生成的大批代码尤其要拆分审查，避免把格式化、重构和功能混成一次变更。",
        ],
        points: [
          "Python：uv/poetry + pyproject.toml；C++：CMake + Conan/vcpkg；Rust：Cargo",
          "开发、测试、生产共享配置结构，但使用不同值",
          "掌握 status、diff、log、branch、commit、rebase 的基本语义",
          "日志定位 → 栈追踪 → 最小复现 → 假设 → 实验 → 回归测试",
        ],
        takeaway: "如果项目不能用一条清晰命令安装、测试和启动，它还不是可维护的工程。",
      },
      {
        id: "design-principles",
        title: "1.7 设计原则与依赖注入",
        level: "P1",
        lead: "SOLID 不是五条背诵题，而是控制变化传播范围的工具。",
        paragraphs: [
          "单一职责指一个模块只有一种变化原因；开闭原则鼓励通过新增实现扩展；里氏替换要求实现遵守契约；接口隔离避免依赖不需要的方法；依赖倒置让高层业务不依赖低层 SDK。",
          "依赖注入只是把依赖从外部传进来。优先构造函数注入，它让对象的必要条件可见。全局 service locator 会隐藏依赖，测试也更困难。",
        ],
        points: [
          "先识别真实变化轴：模型供应商、存储、工具运行环境、通知渠道",
          "核心业务定义接口，外围适配器实现接口",
          "组合优于继承，尤其适合可替换策略",
          "抽象至少应服务两个真实实现或一个明确测试边界",
        ],
        takeaway: "不要预先为所有可能性建抽象；在变化边界出现时，用最小接口把变化关在局部。",
      },
      {
        id: "patterns-structure",
        title: "1.8 模式、目录与质量门禁",
        level: "P1",
        lead: "模式为反复出现的问题提供词汇；目录则把这些边界变成可导航的地图。",
        paragraphs: [
          "工厂负责创建不同实现；策略封装可替换算法；适配器把外部方言变成内部契约；观察者分发事件。Agent 项目常用 registry + factory 创建工具，用 adapter 归一不同模型，用 strategy 选择压缩算法。",
          "推荐按业务能力组织，而不是把所有 class、utils、helpers 堆在技术目录。自动格式化、lint、类型检查、单元测试应成为提交前固定门禁。",
        ],
        points: [
          "目录能否让新人快速找到一次请求的完整实现？",
          "utils 是否在掩盖缺失的领域概念？",
          "循环依赖通常意味着边界或职责错误",
          "Python：ruff/mypy；C++：clang-format/clang-tidy；Rust：rustfmt/clippy",
        ],
        takeaway: "把模式当成沟通语言，而不是目标；如果一个简单函数足够，就不需要策略工厂管理器。",
      },
    ],
    practice: [
      "实现 Task 配置解析器：三种语言任选其一，包含类型校验、领域错误和单元测试。",
      "为模型调用定义 ChatModel 接口，写一个真实适配器和一个测试假实现。",
      "实现并发调用两个工具：设置总超时，任一失败时取消另一个，并记录结构化错误。",
      "审查一段 AI 生成代码，画出入口、数据转换、副作用、资源和异常路径。",
    ],
    done: [
      "能不依赖 IDE 沿调用栈说明一次请求的完整路径",
      "能解释 Python 引用、C++ RAII、Rust 所有权解决的不同问题",
      "能为外部 I/O 添加超时、取消与错误上下文",
      "能用接口和依赖注入隔离一个第三方 SDK",
      "项目可以通过固定命令完成格式化、检查、测试和启动",
    ],
  },
  {
    number: 2,
    short: "Linux 与系统",
    title: "计算机与 Linux 基础",
    subtitle: "理解后端程序实际运行的机器、进程、内存与文件系统",
    hours: "10–14 小时",
    outcome: "你能定位端口、进程、权限、资源和信号问题，解释程序为什么只在某台机器或容器中失败。",
    goals: ["理解进程、线程、内存与文件描述符", "熟练检查 Linux 运行状态", "掌握权限、信号和服务生命周期", "建立从症状到系统资源的排障路径"],
    lessons: [
      { id: "machine-model", title: "2.1 CPU、内存、磁盘与网络", level: "P0", lead: "程序性能取决于它在等待哪种资源。", paragraphs: ["CPU 执行指令，内存保存工作集，磁盘负责持久化，网络连接远端系统。延迟相差多个数量级，因此减少一次远程调用常常比微调循环更重要。", "先判断工作是 CPU 密集、内存受限、磁盘 I/O 还是网络 I/O，再决定并行、缓存、批处理或索引。"], points: ["观察 CPU 使用率、负载、内存与 swap", "理解 OOM killer 与内存泄漏的区别", "区分吞吐量、延迟和尾延迟", "NUMA、页缓存等细节放到遇到真实问题时深入"], takeaway: "优化前先测量；“慢”必须被还原成某一段等待时间。" },
      { id: "process-file", title: "2.2 进程、线程、文件与权限", level: "P0", lead: "进程拥有独立地址空间，线程共享进程资源，文件描述符统一表示文件和 socket。", paragraphs: ["服务监听端口、打开日志和数据库连接都会消耗文件描述符。权限由用户、组和其他人三组读写执行位组成。", "掌握 ps、top、ss、lsof、tail、rg、chmod、kill 和 curl，并能把 PID、端口与启动命令关联起来。"], points: ["127.0.0.1 只接受本机连接，0.0.0.0 监听所有接口", "权限不足先确认运行用户和目标文件所有者", "不要用 chmod 777 掩盖权限模型问题", "容器有自己的进程、网络与文件视图"], takeaway: "端口被占用时，先用 ss/lsof 找到准确进程，再决定是否停止；不要盲目 kill。" },
      { id: "signals-services", title: "2.3 信号、后台服务与优雅退出", level: "P1", lead: "生产环境会重启你的进程，程序必须知道怎样安全离开。", paragraphs: ["SIGTERM 是请求优雅停止，SIGKILL 则无法捕获。优雅退出通常停止接收新请求、等待在途任务、提交或回滚状态、关闭连接。", "systemd 管理服务的启动、重启、日志和依赖。理解前台/后台进程，但不要用随意的 nohup 代替正式服务管理。"], points: ["为优雅退出设置最大等待时间", "避免新任务在 draining 阶段进入", "检查打开文件数和连接泄漏", "理解虚拟内存、页缓存与 swap 的基本作用"], takeaway: "能启动不等于能运营；重启、升级和崩溃恢复都是程序生命周期的一部分。" },
    ],
    practice: ["启动一个 HTTP 服务，分别监听 127.0.0.1 和 0.0.0.0，用 ss 与 curl 验证差异。", "找到服务 PID、打开文件和监听端口，发送 SIGTERM 并观察优雅退出。", "制造一个权限错误和端口占用错误，写下诊断步骤。"],
    done: ["能根据端口找到进程与启动命令", "能解释容器内外 localhost 的不同含义", "能读懂 CPU、内存和磁盘基本指标", "能设计服务的优雅退出顺序"],
  },
  {
    number: 3,
    short: "网络与 HTTP",
    title: "网络与 HTTP",
    subtitle: "掌握后端之间真正交换数据的协议与故障边界",
    hours: "12–16 小时",
    outcome: "你能设计规范 API，理解连接、超时、流式传输和代理行为，并通过网络证据定位故障。",
    goals: ["理解 DNS、TCP、TLS 与 HTTP 分层", "设计清晰的请求、响应与错误模型", "掌握 SSE、WebSocket 与流式响应", "正确处理超时、重试、幂等和断连"],
    lessons: [
      { id: "network-stack", title: "3.1 从域名到响应", level: "P0", lead: "一次请求要经历域名解析、建连、TLS、发送、服务处理和响应读取。", paragraphs: ["DNS 把域名解析为地址；TCP 提供可靠字节流；TLS 认证服务器并加密传输；HTTP 规定消息语义。分层定位能避免把所有网络错误都归咎于接口。"], points: ["区分 DNS、连接、TLS、首字节和读取超时", "连接池复用连接，减少握手开销", "代理和负载均衡器是请求路径的一部分", "用 curl -v 检查状态、Header 和重定向"], takeaway: "“请求超时”不是根因；先指出它卡在连接、服务处理还是响应读取。" },
      { id: "http-contract", title: "3.2 HTTP 与 REST 契约", level: "P0", lead: "方法、状态码和 Header 共同表达请求语义。", paragraphs: ["GET 应安全且可缓存，PUT 通常表达整体替换并应幂等，PATCH 是部分更新，POST 常用于创建或动作。状态码要稳定，错误体应包含机器可读 code 和人可读 message。"], points: ["401 是未认证，403 是已认证但无权限", "409 表示状态冲突，422 表示语义校验失败", "分页、过滤、排序需要一致约定", "CORS 是浏览器跨源策略，不是服务器认证"], takeaway: "API 是长期契约；数据库字段和框架异常不应直接暴露成公共协议。" },
      { id: "streaming", title: "3.3 SSE、WebSocket 与流式响应", level: "P0", lead: "Agent 输出天然是长连接事件流。", paragraphs: ["SSE 基于 HTTP，适合服务端到客户端的文本事件，浏览器支持重连；WebSocket 是全双工消息通道，适合双方高频通信。普通 chunked 响应更底层，但需要自行定义事件边界。"], points: ["定义 event、id、data 与终止事件", "发送心跳并检测客户端断连", "代理缓冲会让“流式”变成一次性返回", "限制单事件和累计输出大小"], takeaway: "选择协议先看通信方向和恢复需求；多数文本 Agent 流优先 SSE。" },
      { id: "resilience", title: "3.4 超时、重试与幂等", level: "P1", lead: "重试会放大流量，也可能重复执行副作用。", paragraphs: ["只重试暂时性失败，并使用指数退避和随机抖动。总 deadline 应传递给下游，避免每层都重新获得完整超时。幂等键让服务识别重复创建请求。"], points: ["连接、单次尝试和总操作分别设限", "429/503 可结合 Retry-After", "写操作重试必须有幂等设计", "客户端断开要向下传播取消"], takeaway: "重试不是异常处理的默认答案；先证明操作可安全重复。" },
    ],
    practice: ["用 curl 完整检查一个 API 的请求、响应、Header 和错误体。", "实现一个 SSE 端点，包含心跳、结束事件和断连取消。", "为创建任务接口添加幂等键，并测试重复请求。"],
    done: ["能解释一次 HTTPS 请求的完整路径", "能为 API 选择正确方法与状态码", "能比较 SSE 与 WebSocket", "能设计 deadline、重试和幂等策略"],
  },
  {
    number: 4,
    short: "API 框架",
    title: "Web 框架与 API 开发",
    subtitle: "把协议、业务与数据访问组织成可测试的服务",
    hours: "14–20 小时",
    outcome: "你能用任一主线语言实现结构清晰、校验完备、可流式输出的 API 服务。",
    goals: ["理解路由、中间件和生命周期", "建立 Router–Service–Repository 分层", "实现校验、错误与 OpenAPI 契约", "掌握版本、限流、Webhook 和优雅关闭"],
    lessons: [
      { id: "framework-map", title: "4.1 三语言框架地图", level: "P0", lead: "框架不同，但处理流水线高度一致。", paragraphs: ["Python 可用 FastAPI/Pydantic，C++ 可用 Drogon 或 Boost.Beast/Asio，Rust 可用 Axum/Serde/Tower/Tokio。学习重点是 request → middleware → handler → service → repository → response。"], points: ["路由层只处理协议适配", "业务规则放 Service", "Repository 隔离持久化", "框架对象不要渗透领域层"], takeaway: "不要同时学三个框架；选一个做完整项目，再用本章对照表迁移概念。" },
      { id: "request-pipeline", title: "4.2 校验、依赖、中间件与错误", level: "P0", lead: "越靠近入口拒绝非法输入，系统内部越简单。", paragraphs: ["请求模型做结构校验，领域层做业务不变量。中间件适合请求 ID、计时、日志和认证上下文，不适合承载具体业务。统一异常映射把内部错误稳定地转换成 API 错误。"], points: ["区分语法校验与业务校验", "依赖注入构造服务而非隐藏全局对象", "不要向客户端返回栈追踪", "响应模型防止意外泄漏字段"], takeaway: "输入通过入口后应成为可信、类型明确的内部对象。" },
      { id: "lifecycle-openapi", title: "4.3 生命周期、流式接口与文档", level: "P0", lead: "连接池和后台任务需要在应用生命周期中集中管理。", paragraphs: ["启动阶段校验配置并创建连接池；关闭阶段停止接流量、等待请求、关闭资源。OpenAPI 是契约工具，示例、错误模型和认证方式也应被描述。"], points: ["不要为每个请求创建数据库池", "流式 handler 处理断连与背压", "健康检查区分 liveness 与 readiness", "API 文档随代码验证而更新"], takeaway: "启动成功应意味着依赖已就绪，而不仅是端口已经监听。" },
      { id: "api-evolution", title: "4.4 版本、分页、限流与 Webhook", level: "P1", lead: "真实 API 要面对演进、滥用和异步通知。", paragraphs: ["优先兼容性演进，重大破坏才引入新版本。大数据集使用游标分页。限流以用户、租户或 API Key 为维度。Webhook 需要签名、重放防护、重试和事件 ID。"], points: ["列表响应保留 next_cursor", "限制 page size", "限流返回 429 和重试提示", "Webhook 消费者必须幂等"], takeaway: "每个公共接口都假设将来需要演进；现在就避免泄漏内部实现。" },
    ],
    practice: ["任选 FastAPI、Drogon 或 Axum，实现用户与任务 CRUD。", "加入统一错误体、请求 ID、OpenAPI、健康检查和优雅关闭。", "增加游标分页与一个带签名的 Webhook。"],
    done: ["API 层与业务层没有框架耦合", "输入、响应和错误均有明确模型", "资源在生命周期内正确创建和释放", "具备版本、分页和限流设计能力"],
  },
  {
    number: 5,
    short: "数据库",
    title: "数据库基础",
    subtitle: "用 PostgreSQL 建模状态、保证一致性并获得可解释性能",
    hours: "18–24 小时",
    outcome: "你能设计 Agent 运行数据模型，写正确 SQL，选择索引和事务边界，并识别 ORM 隐患。",
    goals: ["掌握 SQL 查询与关系建模", "理解索引、事务和隔离", "正确使用连接池、迁移与 ORM", "能分析 N+1、死锁和查询计划"],
    lessons: [
      { id: "relational", title: "5.1 表、关系与 SQL", level: "P0", lead: "关系数据库通过约束保存事实，通过查询组合事实。", paragraphs: ["掌握 SELECT、JOIN、GROUP BY、INSERT、UPDATE、DELETE。主键标识实体，外键保证引用存在，唯一约束防止重复事实。"], points: ["参数化查询防止 SQL 注入", "NULL 表示未知而非空字符串", "时间统一存 UTC", "先写出期望结果，再写 JOIN"], takeaway: "能由数据库强制的不变量，不要只靠应用代码约定。" },
      { id: "modeling-agent", title: "5.2 Agent 数据建模", level: "P0", lead: "会话、消息、运行、步骤和工具调用是不同生命周期的实体。", paragraphs: ["conversation 聚合长期对话，run 表示一次执行，turn/step 表示状态推进，tool_call 与 tool_result 支持审计和重放。usage 单独记录模型、token、成本与延迟。"], points: ["JSONB 适合不稳定的供应商元数据，不替代核心关系", "状态字段配合约束和状态机", "软删除适用于审计需求，不能默认滥用", "大 payload 可拆到对象存储"], takeaway: "按生命周期和查询方式拆表，不要把整个 Agent 世界塞进一列 JSON。" },
      { id: "index-transaction", title: "5.3 索引与事务", level: "P0", lead: "索引用写入和空间成本换查询速度；事务把多步变化变成原子结果。", paragraphs: ["索引顺序应匹配过滤和排序。事务保持 ACID，但不自动解决所有并发业务冲突。事务尽量短，不要在持锁期间调用模型或远程 API。"], points: ["为真实查询建立索引", "用 EXPLAIN ANALYZE 看执行计划", "唯一约束常比“先查再写”可靠", "失败必须回滚，连接必须归还池"], takeaway: "先查后写存在竞态；把唯一性和原子更新交给数据库。" },
      { id: "orm-concurrency", title: "5.4 ORM、隔离与锁", level: "P1", lead: "ORM 减少样板代码，但不会替你理解 SQL。", paragraphs: ["N+1 是循环中隐式发起查询。隔离级别决定并发事务能观察到什么。乐观锁用版本号检测冲突，悲观锁提前锁行；死锁需要固定加锁顺序并有限重试。"], points: ["观察 ORM 实际生成的 SQL", "迁移脚本纳入版本控制", "大变更采用可向前兼容的多阶段迁移", "pgvector 是检索扩展，不代替关系建模"], takeaway: "数据库问题最终要回到 SQL、执行计划、锁与约束，而不是停在 ORM API。" },
    ],
    practice: ["设计 conversation、run、message、tool_call、usage 六张表。", "写出包含 JOIN、聚合和游标分页的查询。", "并发创建同一幂等任务，依靠唯一约束保证只有一条记录。"],
    done: ["能独立完成关系模型与迁移", "会通过执行计划判断索引是否生效", "能选择事务边界与并发控制", "理解 ORM 生成的 SQL 和 N+1"],
  },
  {
    number: 6,
    short: "Redis 与缓存",
    title: "缓存与 Redis",
    subtitle: "用短生命周期状态换取速度，同时管理一致性和失效",
    hours: "8–12 小时",
    outcome: "你能判断何时需要缓存，选择 Redis 数据结构，并避免一致性、击穿和错误锁设计。",
    goals: ["理解缓存价值与代价", "掌握 Redis 结构、TTL 与原子操作", "设计限流、Session 和短期状态", "理解缓存异常与分布式锁风险"],
    lessons: [
      { id: "cache-basics", title: "6.1 缓存模型与 Redis 结构", level: "P0", lead: "缓存是可丢失的派生数据，不应成为无意中的事实来源。", paragraphs: ["String、Hash、Set、Sorted Set 和 Stream 服务不同访问模式。TTL 是业务设计的一部分，而不是随手填的数字。"], points: ["先测量热点和命中率", "Key 包含租户与版本", "限制 value 大小", "定义缓存缺失时的正确行为"], takeaway: "如果删除 Redis 数据会破坏业务事实，你使用的可能不是缓存。" },
      { id: "cache-patterns", title: "6.2 Cache-aside、Session 与限流", level: "P0", lead: "最常见的 cache-aside 是先读缓存，未命中读库后回填。", paragraphs: ["Session 可保存短期认证状态；原子计数器配合窗口实现基础限流；Agent 的临时进度可以缓存，但持久 checkpoint 仍需可靠存储。"], points: ["更新数据库后删除缓存通常比双写简单", "限流维度和失败策略必须明确", "TTL 添加少量随机抖动", "不要缓存未经权限过滤的共享结果"], takeaway: "缓存 key 也是安全边界，必须包含影响结果的身份与参数。" },
      { id: "cache-failures", title: "6.3 穿透、击穿、雪崩与锁", level: "P1", lead: "缓存失效时，后端数据库会承受真实流量。", paragraphs: ["穿透是持续查询不存在数据，击穿是热点 key 瞬间失效，雪崩是大量 key 同时失效。可用负缓存、请求合并、随机 TTL 和降级缓解。", "Redis 锁必须考虑过期、续租、持有者标识和脑裂；优先使用数据库约束、队列分区或单写者模型。"], points: ["Redis 不可用时决定 fail-open 或 fail-closed", "Pub/Sub 不保存离线消息", "Streams 能追踪消费但仍需理解确认语义", "缓存一致性按业务可接受陈旧时间设计"], takeaway: "分布式锁不是一条 SETNX；能不用锁解决时通常更可靠。" },
    ],
    practice: ["为读取任务实现 cache-aside，并记录命中率。", "实现按用户维度的固定窗口或令牌桶限流。", "模拟热点 key 过期，加入请求合并或随机 TTL。"],
    done: ["能选择 Redis 数据结构与 TTL", "能说明数据库和缓存的事实来源", "能处理缓存不可用与批量失效", "不会把简单 Redis 锁当成绝对互斥"],
  },
  {
    number: 7,
    short: "并发与任务",
    title: "并发、异步与任务系统",
    subtitle: "控制协程、线程、队列与 Worker 的生命周期和故障语义",
    hours: "18–24 小时",
    outcome: "你能安全运行并发工具和后台任务，处理竞态、背压、取消、重试与恢复。",
    goals: ["区分并发、并行与三类执行单元", "掌握竞态、锁、背压和结构化并发", "理解队列、Worker、确认与死信", "设计幂等任务和恢复机制"],
    lessons: [
      { id: "concurrency-models", title: "7.1 进程、线程、协程与执行器", level: "P0", lead: "选择执行模型取决于共享状态、任务性质和语言运行时。", paragraphs: ["Python asyncio 适合 I/O，CPU 工作常用多进程；C++ 线程与 Asio 执行器提供细粒度控制；Rust Tokio 以 Future 和 Send/Sync 约束并发安全。"], points: ["不要在事件循环中阻塞", "线程共享内存需要同步", "进程隔离更强但通信更贵", "测量上下文切换和队列等待"], takeaway: "async 是调度模型，不是性能咒语。" },
      { id: "race-backpressure", title: "7.2 竞态、锁与背压", level: "P0", lead: "结果依赖不可控执行顺序时，就存在竞态。", paragraphs: ["用不可变数据、消息传递、单写者和数据库原子操作减少共享可变状态。背压让生产者感知消费者能力，避免内存中形成无界队列。"], points: ["锁范围小且加锁顺序固定", "Semaphore 限制外部调用并发", "队列设置容量和拒绝策略", "不要跨 await 持有不安全锁"], takeaway: "并发 bug 很少靠“多测几次”证明不存在；需要结构上消除不确定共享。" },
      { id: "task-queue", title: "7.3 队列、Worker 与投递语义", level: "P1", lead: "队列把接收请求与执行任务解耦，但引入重复、延迟和顺序问题。", paragraphs: ["至少一次投递最常见，因此消费者必须幂等。确认太早可能丢任务，太晚可能重复任务。失败超过阈值进入死信队列，供诊断和人工处理。"], points: ["任务消息只携带稳定 ID，不携带巨大对象", "记录 attempt 和错误分类", "重试采用退避和上限", "队列长度与最老消息年龄都要监控"], takeaway: "“消息已发送”不等于“业务已完成”，两者需要可观察的状态机。" },
      { id: "structured-tasks", title: "7.4 取消、恢复与结构化并发", level: "P1", lead: "子任务应属于明确的父作用域。", paragraphs: ["结构化并发要求父任务等待子任务结束，错误和取消向正确方向传播。长任务通过 checkpoint 保存可恢复状态，不能只留在 Worker 内存。"], points: ["定义可重试步骤与不可重试提交点", "用幂等键防重复副作用", "租约防止失联 Worker 永久占有任务", "恢复前重新验证外部状态"], takeaway: "后台任务不是脱离管理的线程；它必须有所有者、状态、deadline 和恢复策略。" },
    ],
    practice: ["实现有界并发工具调度器。", "搭建任务队列，支持状态查询、取消、退避重试和死信。", "杀死 Worker 后验证任务能够恢复且不重复副作用。"],
    done: ["能发现共享状态与竞态", "能解释背压和有界队列", "能设计至少一次投递下的幂等消费者", "取消和恢复覆盖整条任务链"],
  },
  {
    number: 8,
    short: "认证与安全",
    title: "认证、权限与安全",
    subtitle: "把用户身份、数据边界和 Agent 工具能力转化为确定性策略",
    hours: "16–22 小时",
    outcome: "你能建立认证授权、秘密管理与审计体系，并防止模型把不可信内容变成高权限操作。",
    goals: ["区分认证、授权和会话", "理解常见 Web 攻击与防护", "管理密钥、日志和依赖风险", "掌握 Prompt injection 与工具沙箱"],
    lessons: [
      { id: "authn-authz", title: "8.1 认证、会话、JWT 与 OAuth", level: "P0", lead: "认证确认你是谁，授权确认你能做什么。", paragraphs: ["密码使用专用慢哈希；Session 便于服务端撤销，JWT 适合有限的无状态场景但仍需轮换和撤销策略；OAuth 让第三方在授权范围内访问资源。"], points: ["Cookie 设置 Secure、HttpOnly、SameSite", "短期 access token 配合轮换 refresh token", "认证失败不泄露账户是否存在", "不要自己发明密码学协议"], takeaway: "JWT 不是权限系统，也不是加密存储。" },
      { id: "web-security", title: "8.2 输入、注入与数据边界", level: "P0", lead: "所有跨信任边界的数据都不可信。", paragraphs: ["参数化 SQL 防注入；输出编码防 XSS；CSRF 防护保护基于 Cookie 的操作；SSRF 防止服务端被诱导访问内网和元数据端点。"], points: ["服务端重复做权限校验", "URL 解析后验证协议、主机和解析地址", "上传限制类型、大小和存储路径", "错误和日志中做脱敏"], takeaway: "校验格式不等于授权访问；每次读取和修改都要带资源所有权判断。" },
      { id: "secrets-rbac", title: "8.3 Secret、RBAC 与审计", level: "P1", lead: "权限应最小化、可撤销、可解释。", paragraphs: ["RBAC 用角色聚合权限，复杂资源可加入属性判断。Secret 不进入仓库、镜像、提示词和普通日志；定期轮换并记录使用主体。"], points: ["区分用户、服务和租户身份", "默认拒绝，显式允许", "高风险动作保留审计事件", "第三方依赖锁版本并扫描漏洞"], takeaway: "如果一次操作无法回答谁、何时、对什么、为何执行，就缺少审计能力。" },
      { id: "agent-security", title: "8.4 Agent 的不可信模型边界", level: "P1", lead: "模型输出是建议，不是已授权指令。", paragraphs: ["Prompt injection 可能来自用户、网页、文档或工具结果。模型不能扩大调用者权限；工具执行层必须用确定性代码校验身份、参数、路径、网络目标和风险等级。"], points: ["读写工具分权，默认最小权限", "Shell、文件和网络运行在沙箱与白名单内", "高风险操作需要人类确认", "限制工具输出大小并隔离秘密", "MCP/插件是新的供应链边界"], takeaway: "真正的安全边界在模型之外：策略引擎、工具适配器和运行沙箱。" },
    ],
    practice: ["实现 Session 或短期 JWT 登录，并加入资源级权限。", "为 URL 抓取工具防御 SSRF。", "建立工具风险分级：只读、可逆写、高风险写，并实现确认机制。"],
    done: ["认证和授权逻辑清晰分离", "能解释并防御常见 Web 攻击", "Secret 不进入代码、日志和模型上下文", "模型无法绕过工具层权限"],
  },
  {
    number: 9,
    short: "测试与调试",
    title: "测试与调试",
    subtitle: "把 Vibe Coding 从“看起来能跑”提升为可验证的软件工程",
    hours: "14–18 小时",
    outcome: "你能设计测试金字塔、构造失败路径、定位根因，并为模型与工具行为建立稳定回归体系。",
    goals: ["掌握单元、集成、契约和端到端测试", "正确使用 mock、fixture 和测试数据库", "建立系统调试与最小复现流程", "测试 Agent 状态、工具、流式与成本边界"],
    lessons: [
      { id: "test-levels", title: "9.1 测试层级与测试设计", level: "P0", lead: "测试选择最小但足以发现目标缺陷的边界。", paragraphs: ["单元测试快速验证纯业务；集成测试验证数据库、队列和框架；契约测试验证服务边界；少量端到端测试覆盖关键旅程。"], points: ["Arrange–Act–Assert", "测试可观察行为而非内部实现", "每个 bug 增加回归测试", "测试名称说明场景和结果"], takeaway: "覆盖率只能说明哪些行执行过，不能说明需求被正确验证。" },
      { id: "fixtures-failures", title: "9.2 Fixture、Mock 与失败路径", level: "P0", lead: "Mock 用于控制边界，不应用来复制整个系统。", paragraphs: ["固定时间、随机数和模型响应能获得可重复测试。数据库集成测试使用隔离事务或临时数据库。主动注入超时、断连、重复消息和部分失败。"], points: ["不要 mock 被测对象内部细节", "外部 SDK 在 adapter 边界替换", "验证事务回滚和资源释放", "并发测试使用可控同步点"], takeaway: "正常路径证明功能存在，失败路径证明系统可运营。" },
      { id: "debugging", title: "9.3 日志、断点与最小复现", level: "P1", lead: "调试是用证据逐步排除假设。", paragraphs: ["先稳定复现，再缩小输入和环境。结合请求 ID 看日志，用断点观察状态，用性能剖析器定位时间，用线程/异步任务 dump 定位卡住位置。"], points: ["一次只验证一个假设", "比较成功与失败请求差异", "保留原始错误 cause", "修复后验证无关路径未回归"], takeaway: "不要一边猜一边改多处；最小实验比大面积重写更快。" },
      { id: "agent-evals", title: "9.4 Agent 回放与回归", level: "P1", lead: "模型输出不稳定，测试应区分确定性基础设施与概率性质量。", paragraphs: ["固定模型响应测试 loop 和 tool dispatcher；保存事件序列做回放；对真实模型使用数据集和评分标准，统计成功率、成本和延迟而非要求逐字一致。"], points: ["测试 tool schema 与参数拒绝", "测试最大步数、取消和恢复", "Prompt/模型版本进入运行元数据", "设置 token 与成本硬上限"], takeaway: "不要用一次漂亮 demo 代替评测；Agent 质量需要可重复数据集和指标。" },
    ],
    practice: ["为任务 API 编写单元、数据库集成与端到端测试。", "注入模型超时、工具失败、队列重复投递和用户取消。", "保存一次 Agent 事件流并在无模型环境中回放。"],
    done: ["测试覆盖正常、边界和故障路径", "外部依赖在正确边界替换", "能用最小复现和证据定位根因", "Agent 回归不依赖逐字相同输出"],
  },
  {
    number: 10,
    short: "可观测性",
    title: "日志、监控与可观测性",
    subtitle: "从一次用户请求追踪到模型、工具、数据库和队列",
    hours: "10–14 小时",
    outcome: "你能用结构化日志、指标和 Trace 解释故障、性能与成本，而不是在海量文本中猜测。",
    goals: ["区分日志、指标、Trace", "建立关联 ID 与结构化事件", "定义 SLI、SLO 和有效告警", "观测 Agent 的 token、步骤、工具与成本"],
    lessons: [
      { id: "three-pillars", title: "10.1 日志、指标与链路", level: "P0", lead: "日志描述事件，指标聚合趋势，Trace 展示一次请求跨组件的路径。", paragraphs: ["三者通过 request_id/trace_id 关联。结构化字段比拼接长字符串更适合查询。错误日志记录上下文但不重复刷屏。"], points: ["统一时间、级别和字段命名", "入口生成或接收 trace context", "模型和工具调用建立 child span", "敏感内容默认不记录"], takeaway: "可观测性不是多打日志，而是能回答系统内部发生了什么。" },
      { id: "metrics-slo", title: "10.2 指标、SLI 与告警", level: "P0", lead: "用户关心可用性、延迟和正确性。", paragraphs: ["常用 RED：请求率、错误率、持续时间；资源用 USE：利用率、饱和度、错误。SLO 把“可靠”变为窗口内的目标，告警应指向用户影响和可执行动作。"], points: ["关注 p95/p99 而不只平均值", "队列监控长度与最老消息年龄", "标签基数必须受控", "每条告警附排查入口"], takeaway: "没有行动方案的告警只是噪音。" },
      { id: "agent-observability", title: "10.3 Agent 运行可观测性", level: "P1", lead: "Agent 是一棵动态调用树，需要事件级追踪。", paragraphs: ["记录 run、turn、model_request、tool_call 的稳定 ID，以及模型版本、token、首 token 延迟、总耗时、重试、工具错误和最终状态。输入输出内容按隐私策略采样或摘要。"], points: ["区分排队、模型、工具和存储耗时", "成本按用户、功能、模型聚合", "标记停止原因：完成、上限、取消、错误", "支持按 run_id 重建时间线"], takeaway: "一次 Agent 失败必须能还原为具体步骤，而不是只留下“生成失败”。" },
    ],
    practice: ["为 API 增加结构化日志、request_id 和 trace。", "建立延迟、错误率、队列年龄和数据库池指标。", "做一张 Agent run 时间线，显示模型与工具耗时、token 和停止原因。"],
    done: ["一次请求可跨服务追踪", "指标能反映真实用户体验", "告警有阈值依据与行动指南", "Agent 成本和失败可定位到步骤"],
  },
  {
    number: 11,
    short: "部署与交付",
    title: "Docker、部署与 CI/CD",
    subtitle: "把可运行代码变成可重复、可升级、可回滚的服务",
    hours: "14–20 小时",
    outcome: "你能容器化并部署服务，管理配置和迁移，建立自动测试、发布、健康检查与回滚流程。",
    goals: ["理解镜像、容器、网络和卷", "掌握反向代理与 HTTPS", "建立 CI/CD 和数据库迁移流程", "理解滚动、蓝绿、灰度和 K8s 基础"],
    lessons: [
      { id: "containers", title: "11.1 Docker 镜像与容器", level: "P0", lead: "镜像是不可变模板，容器是带隔离视图的运行进程。", paragraphs: ["Dockerfile 固化构建步骤，Compose 连接本地服务。容器内文件默认短暂，数据库使用持久卷；服务间通过容器网络和服务名通信。"], points: ["固定基础镜像和依赖版本", "使用非 root 用户", "多阶段构建减小生产镜像", "不要把 Secret 烘焙进镜像"], takeaway: "容器不是虚拟机，也不会自动让应用安全或持久。" },
      { id: "production-edge", title: "11.2 反向代理、HTTPS 与健康检查", level: "P0", lead: "代理终止 TLS、路由请求，并影响超时和流式行为。", paragraphs: ["Nginx 或云负载均衡器需要正确传递客户端信息、关闭 SSE 缓冲、设置连接超时。liveness 判断是否重启，readiness 判断是否接收流量。"], points: ["应用信任代理头必须限定来源", "证书自动续期", "优雅关闭配合摘除流量", "健康端点轻量且语义明确"], takeaway: "生产请求路径包含边缘层；流式和断连问题必须把代理纳入诊断。" },
      { id: "cicd", title: "11.3 CI、迁移、发布与回滚", level: "P0", lead: "每个版本都应经过相同可重复的质量门禁。", paragraphs: ["CI 执行格式、静态检查、测试、镜像构建和安全扫描。数据库采用 expand–migrate–contract 等兼容迁移，确保新旧应用短期共存。"], points: ["构建一次，逐环境推广同一制品", "发布前备份与演练恢复", "回滚应用不一定能回滚数据", "配置与代码版本可追踪"], takeaway: "不能安全回滚的发布流程还没有完成。" },
      { id: "orchestration", title: "11.4 扩缩容与 Kubernetes 概念", level: "P1", lead: "先掌握单机和容器，再理解编排。", paragraphs: ["Kubernetes 用 Deployment 管理副本，用 Service 提供稳定访问，用 ConfigMap/Secret 注入配置。滚动、蓝绿与灰度在速度、资源和风险上不同。"], points: ["应用尽量无状态", "启动、就绪和退出符合编排器预期", "按 CPU、队列或业务指标扩容", "设置资源 request/limit"], takeaway: "K8s 放大已有工程能力；它不会修复错误的状态和生命周期设计。" },
    ],
    practice: ["为 API、PostgreSQL、Redis 编写本地 Compose。", "建立 CI：检查、测试、构建镜像。", "模拟一次兼容迁移、滚动发布和应用回滚。"],
    done: ["任何环境可重复构建同一制品", "配置和 Secret 与镜像分离", "流式请求经过代理仍然工作", "发布包含健康检查、迁移和回滚方案"],
  },
  {
    number: 12,
    short: "系统设计",
    title: "系统设计与分布式系统",
    subtitle: "理解多实例之后的一致性、故障和扩展代价",
    hours: "18–24 小时",
    outcome: "你能从需求和失败模式出发设计服务，解释一致性取舍，并避免把单机假设带入分布式环境。",
    goals: ["掌握单体、服务边界与水平扩展", "理解 CAP、复制和最终一致性", "设计限流、熔断、降级与容灾", "掌握锁、事务、分片和故障恢复的代价"],
    lessons: [
      { id: "architecture", title: "12.1 从需求到架构", level: "P0", lead: "先明确容量、延迟、可用性、一致性和安全目标，再画组件。", paragraphs: ["模块化单体通常是早期最佳选择；微服务在独立扩展、团队自治或隔离需求出现时才值得。无状态 API 更易水平扩展，状态放入有明确一致性语义的存储。"], points: ["估算 QPS、数据量和带宽", "识别读写路径与关键依赖", "为每个组件写失败行为", "避免共享内存状态成为隐性依赖"], takeaway: "架构图不是设计起点；需求、容量和故障模式才是。" },
      { id: "distributed-tradeoffs", title: "12.2 CAP、复制与一致性", level: "P1", lead: "网络分区发生时，系统必须在一致响应与持续服务之间取舍。", paragraphs: ["CAP 针对分区条件，不是让你日常随意三选二。复制产生延迟和冲突，最终一致性要求业务能容忍短期不同视图并有收敛规则。"], points: ["区分强一致读和陈旧读", "读写法定人数只是众多实现之一", "跨服务操作采用状态机和补偿", "向用户表达处理中而非伪装完成"], takeaway: "一致性不是数据库开关，而是每条业务不变量的具体要求。" },
      { id: "resilience-patterns", title: "12.3 限流、熔断、降级与隔离", level: "P1", lead: "分布式故障会级联，韧性机制要限制爆炸半径。", paragraphs: ["超时限制等待，重试应对短暂失败，熔断避免持续攻击坏依赖，bulkhead 隔离资源池，降级保留核心能力。"], points: ["预算从入口 deadline 向下分配", "重试乘法会制造重试风暴", "关键与非关键依赖分离", "混沌演练验证恢复而非只写文档"], takeaway: "所有韧性模式都有成本；组合时尤其要计算最坏流量。" },
      { id: "distributed-state", title: "12.4 锁、事务、分片与恢复", level: "P1", lead: "跨节点状态变化无法依赖单机互斥。", paragraphs: ["优先唯一约束、幂等键、版本号、单写者和消息分区。跨服务可用 Saga/补偿而非追求透明全局事务。分片键决定数据局部性和热点。"], points: ["锁有租约与 fencing token", "outbox 解决数据库写入与发消息一致性", "备份必须定期恢复演练", "RPO 和 RTO 明确可丢数据量与恢复时间"], takeaway: "真正的容灾不是“有备份”，而是能在目标时间内从备份恢复。" },
    ],
    practice: ["为 Agent 平台估算 1 万并发会话的容量。", "画出模型供应商故障时的超时、熔断与降级路径。", "用 outbox 设计“创建运行并发送队列消息”的一致性方案。"],
    done: ["架构选择有需求和容量依据", "能逐条说明一致性要求", "故障不会无限级联", "状态、恢复与容灾目标明确"],
  },
  {
    number: 13,
    short: "Agent 后端",
    title: "Agent 后端专项",
    subtitle: "把模型、工具、状态、上下文和安全边界组合成可靠运行时",
    hours: "24–32 小时",
    outcome: "你能设计一个可流式、可取消、可恢复、可审计、可扩展的 Codex 类 Agent 后端。",
    goals: ["实现 Agent loop、状态机和工具调度", "管理上下文、压缩、记忆与重放", "构建多模型网关和事件归一层", "实现工具沙箱、成本控制与全链路观测"],
    lessons: [
      { id: "agent-loop", title: "13.1 Agent Loop 与状态机", level: "P0", lead: "Agent loop 是受约束的状态推进，不是无限 while true。", paragraphs: ["一次 turn 组装上下文、调用模型、解析事件；若出现 tool call，则校验并执行工具，把结果写回，再继续；若产生最终答案或触发停止条件则结束。所有状态变化先持久化事件。"], points: ["定义最大步数、deadline、token 和成本上限", "状态包含 running、waiting_tool、waiting_human、completed、failed、cancelled", "父子 Agent 有明确预算和取消关系", "人类确认是可恢复状态而不是阻塞线程"], takeaway: "把 loop 写成显式状态机，才能可靠中断、恢复、回放和审计。" },
      { id: "context-engineering", title: "13.2 上下文、压缩与记忆", level: "P0", lead: "上下文窗口是有限工作内存，不是数据库。", paragraphs: ["消息需要稳定 schema 与来源标记。预算先预留输出，再选择 system、近期对话、重要事实和工具结果。压缩应保留决策、未完成任务、约束、引用和错误，原始记录仍单独持久化。"], points: ["token 预算在调用前计算", "大型工具结果存外部并注入摘要与引用", "摘要记录版本和覆盖范围", "检索结果带来源、权限和时间", "记忆写入需明确策略而非模型随意决定"], takeaway: "压缩是有损索引层；绝不能覆盖唯一的原始运行记录。" },
      { id: "model-gateway", title: "13.3 模型网关与事件归一", level: "P0", lead: "内部协议稳定，供应商方言留在适配器。", paragraphs: ["网关统一消息、流式 delta、tool call、usage 和错误分类，同时保留原始供应商元数据用于诊断。模型选择依据能力、延迟、成本、地区和数据策略。"], points: ["区分输入错误、限流、供应商故障和内容拒绝", "fallback 不能悄悄改变安全或能力语义", "结构化输出必须在服务端验证", "prompt caching 的 key 与隐私边界清晰"], takeaway: "归一层应统一共同语义，同时允许访问不可归一的供应商能力。" },
      { id: "tool-runtime", title: "13.4 Tool Registry 与运行沙箱", level: "P0", lead: "Tool schema 只是模型接口，真正执行还需要权限和运行策略。", paragraphs: ["Registry 保存名称、版本、参数 schema、风险等级、超时和输出限制。Dispatcher 做身份授权、参数校验、幂等、执行、取消、错误归一和审计。"], points: ["Shell、文件、网络工具最小权限", "工具输出视为不可信输入", "并行调用设全局与每工具限额", "截断输出保留引用或可继续读取游标", "MCP 客户端执行同样的策略检查"], takeaway: "模型能看见工具不等于用户有权执行工具；授权必须逐次验证。" },
      { id: "runtime-reliability", title: "13.5 Checkpoint、取消与恢复", level: "P1", lead: "长运行 Agent 必须把内存状态变成可持久化事件。", paragraphs: ["每一步先记录 intent/started，再记录 succeeded/failed，副作用使用幂等键。恢复时重建状态并查询不确定外部操作，避免盲目重放。SSE 断开与 run 取消应分离：用户可稍后重新订阅仍在运行的任务。"], points: ["事件序列只追加，派生当前状态", "取消信号传遍模型、工具和子 Agent", "租约标识当前 Worker 所有权", "未知结果进入 reconciliation 而非直接重试"], takeaway: "恢复不是重新运行全部步骤，而是从可信 checkpoint 继续并处理不确定副作用。" },
      { id: "agent-production", title: "13.6 评测、成本、安全与演进", level: "P1", lead: "生产 Agent 同时优化任务成功率、风险、延迟和成本。", paragraphs: ["离线数据集评估能力，在线指标观察真实分布，版本元数据支持对比和回滚。策略层控制模型、工具、预算和数据访问，审计层还原决策链。"], points: ["按 run/用户/租户实施预算", "Prompt、模型、工具 schema 均版本化", "高风险动作双重确认或审批", "Canary 比较成功率、延迟和成本", "异常循环和重复工具调用自动熔断"], takeaway: "最好的 Agent 架构不是最自主，而是在可控预算和权限内稳定完成任务。" },
    ],
    practice: ["实现事件驱动的最小 Agent loop，支持模型流、工具调用和终止条件。", "加入 run/turn/tool_call 持久化、SSE 订阅、取消与 checkpoint 恢复。", "接入两种模型并归一流式事件、usage 和错误。", "为文件、网络和命令工具建立权限、沙箱、超时、输出限制和审计。", "建立 20 个任务的回归集，统计成功率、p95 延迟、token 与成本。"],
    done: ["Loop 是显式、有限且可恢复的状态机", "上下文压缩不丢失原始记录", "模型与工具方言被适配器隔离", "取消、权限和预算贯穿整条调用链", "一次运行可完整回放并解释成本与失败"],
  },
];

function CodeExample({ code, language, setLanguage }: { code: NonNullable<Lesson["code"]>; language: Language; setLanguage: (lang: Language) => void }) {
  return (
    <div className="code-card">
      <div className="code-head">
        <div>
          <strong>{code.title}</strong>
          <span>{code.note}</span>
        </div>
        <div className="language-tabs" role="tablist" aria-label="选择示例语言">
          {languages.map((lang) => (
            <button key={lang.id} className={language === lang.id ? "active" : ""} onClick={() => setLanguage(lang.id)} role="tab" aria-selected={language === lang.id}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      <pre><code>{code.snippets[language]}</code></pre>
    </div>
  );
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function DeepUnitView({ unit, language }: { unit: DeepUnit; language: Language }) {
  const languageLabel = languages.find((item) => item.id === language)?.label ?? language;
  return (
    <article className="deep-unit" id={unit.id}>
      <header className="deep-unit-header">
        <div>
          <span className="deep-unit-kicker">教材正文 · {unit.readingTime}</span>
          <h2>{unit.title}</h2>
        </div>
        <a href="#chapter-top" aria-label="返回本章顶部">↑</a>
      </header>

      <p className="deep-question">{renderInline(unit.question)}</p>
      <div className="deep-prose">
        {unit.paragraphs.map((paragraph, index) => (
          <p key={paragraph}><span>{String(index + 1).padStart(2, "0")}</span>{renderInline(paragraph)}</p>
        ))}
      </div>

      <section className="unit-example">
        <div className="subsection-heading"><span>EXAMPLE</span><h3>举个例子</h3></div>
        <p>{renderInline(unit.caseStudy.symptom)}</p>
        <div className="example-columns">
          <article>
            <b>容易误判</b>
            <p>{renderInline(unit.caseStudy.analysis[0])}</p>
          </article>
          <article>
            <b>正确看法</b>
            <p>{renderInline(unit.caseStudy.correction[0])}</p>
          </article>
        </div>
      </section>

      <section className="interview-drill">
        <div className="subsection-heading"><span>INTERVIEW</span><h3>大厂面试追问</h3></div>
        <p className="interview-core">{renderInline(unit.interview.core)}</p>
        <p>{renderInline(unit.interview.answer)}</p>
        <div className="interview-grid">
          <article>
            <b>继续追问</b>
            <ol>{unit.interview.followUps.map((item) => <li key={item}>{renderInline(item)}</li>)}</ol>
          </article>
          <article>
            <b>常见扣分点</b>
            <ul>{unit.interview.traps.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className="language-deep-dive">
        <div className="subsection-heading"><span>LANGUAGE NOTE</span><h3>{languageLabel} 中怎么落地</h3></div>
        {unit.languageComparison[language].map((paragraph) => <p key={paragraph}>{renderInline(paragraph)}</p>)}
      </section>

      <section className="unit-lab">
        <div className="unit-lab-intro">
          <span>PRACTICE</span>
          <h3>小练习</h3>
          <p>{renderInline(unit.lab.goal)}</p>
        </div>
        <div className="unit-lab-body">
          <ol>{unit.lab.steps.map((step) => <li key={step}>{renderInline(step)}</li>)}</ol>
          <div className="unit-lab-checks">{unit.lab.checks.map((check) => <span key={check}>✓ {check}</span>)}</div>
        </div>
      </section>
    </article>
  );
}

export default function Home() {
  const [activeNumber, setActiveNumber] = useState(1);
  const [language, setLanguage] = useState<Language>("python");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("agent-backend-textbook-progress");
      const savedLang = window.localStorage.getItem("agent-backend-textbook-language") as Language | null;
      if (saved) {
        try { setCompleted(JSON.parse(saved)); } catch { /* ignore malformed local preference */ }
      }
      if (savedLang && languages.some((item) => item.id === savedLang)) setLanguage(savedLang);
      const hash = Number(window.location.hash.replace("#chapter-", ""));
      if (hash >= 1 && hash <= chapters.length) setActiveNumber(hash);
      setPreferencesLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem("agent-backend-textbook-progress", JSON.stringify(completed));
  }, [completed, preferencesLoaded]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem("agent-backend-textbook-language", language);
  }, [language, preferencesLoaded]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return chapters;
    return chapters.filter((chapter) =>
      `${chapter.number} ${chapter.short} ${chapter.title} ${chapter.subtitle} ${chapter.goals.join(" ")} ${chapter.lessons.map((l) => `${l.title} ${l.lead}`).join(" ")} ${deepChapters[chapter.number].units.map((unit) => unit.title).join(" ")}`.toLowerCase().includes(term),
    );
  }, [query]);

  const active = chapters[activeNumber - 1];
  const expansion = chapterExpansions[activeNumber];
  const deepChapter = deepChapters[activeNumber];
  const totalChecks = chapters.reduce((sum, chapter) => sum + chapter.done.length, 0);
  const finishedChecks = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((finishedChecks / totalChecks) * 100);

  const selectChapter = (number: number) => {
    setActiveNumber(number);
    setMenuOpen(false);
    window.history.replaceState(null, "", `#chapter-${number}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCheck = (key: string) => setCompleted((current) => ({ ...current, [key]: !current[key] }));

  return (
    <main className="app-shell">
      <header className="mobile-bar">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="打开章节目录">☰</button>
        <div><b>Agent Backend</b><span>学习教科书</span></div>
        <span className="mobile-progress">{progress}%</span>
      </header>

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">A<span>/</span>B</div>
          <div><b>Agent Backend</b><span>后端开发教科书</span></div>
        </div>

        <div className="progress-card">
          <div><span>总体学习进度</span><b>{progress}%</b></div>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          <small>{finishedChecks} / {totalChecks} 项能力已掌握</small>
        </div>

        <label className="search-box">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节与知识点" aria-label="搜索章节" />
        </label>

        <nav className="chapter-nav" aria-label="教材章节">
          {filtered.map((chapter) => {
            const chapterDone = chapter.done.filter((_, index) => completed[`${chapter.number}-${index}`]).length;
            return (
              <button key={chapter.number} className={activeNumber === chapter.number ? "active" : ""} onClick={() => selectChapter(chapter.number)}>
                <span className="chapter-index">{String(chapter.number).padStart(2, "0")}</span>
                <span className="chapter-name"><b>{chapter.short}</b><small>{chapterDone}/{chapter.done.length} 完成</small></span>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="no-results">没有匹配的章节</p>}
        </nav>

        <div className="stack-note">
          <span>三语言主线</span>
          <div>{languages.map((item) => <b key={item.id}>{item.label}</b>)}</div>
          <small>概念统一 · 生态分别说明</small>
        </div>
      </aside>

      {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="关闭目录" />}

      <article className="content" id="chapter-top">
        <div className="topline">
          <span>BACKEND FOUNDATIONS</span>
          <div className="global-language">
            <span>示例语言</span>
            {languages.map((item) => (
              <button key={item.id} className={language === item.id ? "active" : ""} onClick={() => setLanguage(item.id)}>{item.label}</button>
            ))}
          </div>
        </div>

        <section className="chapter-hero">
          <div className="hero-number">{String(active.number).padStart(2, "0")}</div>
          <div className="hero-copy">
            <div className="eyebrow"><span>第 {active.number} 章</span><i /> <span>{active.hours}</span></div>
            <h1>{active.title}</h1>
            <p>{active.subtitle}</p>
          </div>
        </section>

        <section className="outcome-panel">
          <div className="outcome-main"><span>学完你将能够</span><p>{active.outcome}</p></div>
          <div className="goal-grid">
            {active.goals.map((goal, index) => <div key={goal}><b>0{index + 1}</b><span>{goal}</span></div>)}
          </div>
        </section>

        <section className="language-track">
          <div>
            <span>当前实践语言</span>
            <b>{languages.find((item) => item.id === language)?.label}</b>
            <small>{languages.find((item) => item.id === language)?.ecosystem}</small>
          </div>
          <p>{languageGuidance[active.number][language]}</p>
          <span className="track-hint">切换页顶语言以查看本章对应的学习重点</span>
        </section>

        <section className="chapter-opening">
          <span className="section-kicker">CHAPTER QUESTION</span>
          <h2>{expansion.opening.question}</h2>
          <div className="opening-copy">
            {expansion.opening.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className="mental-model">
          <div className="model-intro">
            <span className="section-kicker">KEY IDEA</span>
            <h2>{expansion.mentalModel.title}</h2>
            <p>先抓住这一章最重要的理解线索，再进入具体概念。遇到新框架或新语言时，也可以用这组问题读代码。</p>
          </div>
          <ol className="model-steps">
            {expansion.mentalModel.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{step.title}</b><p>{step.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="comparison-section">
          <span className="section-kicker">HOW TO CHOOSE</span>
          <h2>{expansion.comparison.title}</h2>
          <div className="table-scroll">
            <table>
              <thead><tr>{expansion.comparison.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>
                {expansion.comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="volume-note">
          <div>
            <span className="section-kicker">TEXTBOOK EDITION</span>
            <h2>本章教材正文</h2>
            <p>下面以连续讲解为主，例子只用于说明知识点。每节都刻意避免平行模板，重点内容会用粗体标出，章末再集中放练习和速查。</p>
          </div>
          <div className="volume-stats">
            <b>{deepChapter.units.length}</b><span>个教学小节</span>
            <b>{Math.round(deepVolumeCjkCharacters / 10000)} 万</b><span>全书可读正文约数</span>
          </div>
        </section>

        <nav className="deep-toc" aria-label="本章完整教学目录">
          {deepChapter.units.map((unit) => <a key={unit.id} href={`#${unit.id}`}>{unit.title}</a>)}
        </nav>

        <section className="chapter-preface">
          {deepChapter.preface.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <div className="deep-volume">
          {deepChapter.units.map((unit) => <DeepUnitView key={unit.id} unit={unit} language={language} />)}
        </div>

        <section className="quick-reference-heading">
          <span className="section-kicker">QUICK REFERENCE</span>
          <h2>本章概念速查</h2>
          <p>完成上面的详细学习后，用这一部分复习关键概念与代码示例。它不能代替正文。</p>
        </section>

        <div className="reading-layout">
          <div className="lesson-list">
            {active.lessons.map((lesson) => (
              <section className="lesson" id={lesson.id} key={lesson.id}>
                <div className="lesson-heading">
                  <span className={`level ${lesson.level.toLowerCase()}`}>{lesson.level}</span>
                  <h2>{lesson.title}</h2>
                </div>
                <p className="lesson-lead">{lesson.lead}</p>
                {lesson.paragraphs?.map((paragraph) => <p className="body-copy" key={paragraph}>{paragraph}</p>)}
                {lesson.points && (
                  <ul className="knowledge-list">
                    {lesson.points.map((point) => <li key={point}><span>✓</span>{point}</li>)}
                  </ul>
                )}
                {lesson.code && <CodeExample code={lesson.code} language={language} setLanguage={setLanguage} />}
                {lesson.takeaway && <div className="takeaway"><b>审查要点</b><p>{lesson.takeaway}</p></div>}
              </section>
            ))}
          </div>

          <aside className="chapter-toc">
            <span>本章目录</span>
            {active.lessons.map((lesson) => <a key={lesson.id} href={`#${lesson.id}`}><i className={lesson.level.toLowerCase()} />{lesson.title.replace(/^\d+\.\d+\s*/, "")}</a>)}
          </aside>
        </div>

        <section className="case-study-section">
          <div className="case-heading">
            <span className="case-number">CASE {String(active.number).padStart(2, "0")}</span>
            <div><span className="section-kicker">EXAMPLE</span><h2>{expansion.caseStudy.title}</h2></div>
          </div>
          <p className="case-situation">{expansion.caseStudy.situation}</p>
          <div className="case-grid">
            <article><h3>看到什么</h3><ul>{expansion.caseStudy.evidence.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><h3>为什么会这样</h3><ol>{expansion.caseStudy.reasoning.map((item) => <li key={item}>{item}</li>)}</ol></article>
            <article><h3>应该怎么改</h3><ul>{expansion.caseStudy.solution.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
          <blockquote><b>案例结论</b><p>{expansion.caseStudy.conclusion}</p></blockquote>
        </section>

        <section className="guided-lab-section">
          <div className="lab-copy">
            <span className="section-kicker">PRACTICE</span>
            <h2>{expansion.lab.title}</h2>
            <p>{expansion.lab.brief}</p>
            <div className="deliverable"><b>最终交付物</b><span>{expansion.lab.deliverable}</span></div>
          </div>
          <div className="lab-work">
            <h3>操作步骤</h3>
            <ol>{expansion.lab.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <h3>验收检查</h3>
            <ul className="lab-checks">{expansion.lab.checks.map((check) => <li key={check}>✓ {check}</li>)}</ul>
          </div>
        </section>

        <section className="review-section">
          <div className="section-label">REVIEW & ANSWERS</div>
          <h2>理解检查与参考答案</h2>
          <p>先尝试自己回答，再展开答案。能够用自己的话说明因果关系，才算真正掌握。</p>
          <div className="review-list">
            {expansion.review.map((item, index) => (
              <details key={item.question}>
                <summary><span>Q{index + 1}</span>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="practice-section">
          <div className="section-label">PRACTICE</div>
          <h2>本章实践任务</h2>
          <p>不要只阅读。选用当前主力语言完成任务，再用另一种语言复现其中一个核心边界。</p>
          <div className="practice-grid">
            {active.practice.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}
          </div>
        </section>

        <section className="completion-section">
          <div>
            <span className="section-label">CHAPTER CHECK</span>
            <h2>完成标准</h2>
            <p>能够独立解释和实践后再勾选。进度只保存在你的当前浏览器。</p>
          </div>
          <div className="check-list">
            {active.done.map((item, index) => {
              const key = `${active.number}-${index}`;
              return (
                <label key={item} className={completed[key] ? "checked" : ""}>
                  <input type="checkbox" checked={Boolean(completed[key])} onChange={() => toggleCheck(key)} />
                  <span className="fake-check">✓</span><p>{item}</p>
                </label>
              );
            })}
          </div>
        </section>

        <nav className="pager" aria-label="章节翻页">
          {active.number > 1 ? <button onClick={() => selectChapter(active.number - 1)}><span>← 上一章</span><b>{chapters[active.number - 2].title}</b></button> : <div />}
          {active.number < chapters.length ? <button className="next" onClick={() => selectChapter(active.number + 1)}><span>下一章 →</span><b>{chapters[active.number].title}</b></button> : <div className="finish-mark"><span>路线终点</span><b>开始构建你的 Agent Runtime</b></div>}
        </nav>

        <footer><span>Agent Backend Textbook</span><p>从能生成代码，到能掌控系统。</p></footer>
      </article>
    </main>
  );
}
