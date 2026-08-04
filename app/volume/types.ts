export type LanguageId = "python" | "cpp" | "rust";

export type TopicSeed = {
  title: string;
  definition: string;
  mechanism: string;
  agentExample: string;
  decision: string;
  misconception: string;
  experiment: string;
};

export type ChapterProfile = {
  number: number;
  title: string;
  why: string;
  project: string;
  boundary: string;
  invariant: string;
  evidence: string;
  failure: string;
  languageNotes: Record<LanguageId, string>;
  topics: TopicSeed[];
};

export type DeepUnit = {
  id: string;
  title: string;
  readingTime: string;
  question: string;
  paragraphs: string[];
  mechanismSteps: { title: string; detail: string }[];
  caseStudy: {
    symptom: string;
    evidence: string[];
    analysis: string[];
    correction: string[];
  };
  languageComparison: Record<LanguageId, string[]>;
  lab: {
    goal: string;
    steps: string[];
    checks: string[];
  };
  review: { question: string; answer: string }[];
};

export type DeepChapter = {
  number: number;
  title: string;
  preface: string[];
  units: DeepUnit[];
};

const languageLabels: Record<LanguageId, string> = {
  python: "Python",
  cpp: "C++",
  rust: "Rust",
};

function makeUnit(chapter: ChapterProfile, topic: TopicSeed, index: number): DeepUnit {
  const chapterNo = String(chapter.number).padStart(2, "0");
  const unitNo = String(index + 1).padStart(2, "0");
  const commonLanguage = (language: LanguageId) => [
    `${languageLabels[language]} 的语法和生态不是这一节的最终目标。先用它把“${topic.title}”的边界写清楚：${chapter.languageNotes[language]}。完成实现后，回到接口、状态和失败语义，确认代码没有只在理想输入下成立。`,
    `在本书的贯穿项目中，${languageLabels[language]} 版本必须保存同样的领域事实：${chapter.invariant}。框架默认行为只能作为实现细节，不能代替显式契约；更换库之后，调用方看到的状态与错误语义仍应保持稳定。`,
    `阅读或审查 ${languageLabels[language]} 代码时，逐行标出外部输入、类型转换、资源取得、异步边界和副作用。尤其检查“${topic.decision}”是否落实在确定性代码中，而不是留给模型提示词、注释或开发者习惯。`,
  ];

  return {
    id: `deep-${chapterNo}-${unitNo}`,
    title: `${chapter.number}.${index + 1} ${topic.title}`,
    readingTime: "约 25–35 分钟",
    question: `面对“${topic.agentExample}”，为什么必须先理解${topic.title}，而不能直接让框架或 AI 替我们决定？`,
    paragraphs: [
      `${topic.definition}。这句话给出了定义，却还不是可用的工程知识。真正掌握它，意味着你能指出它约束了什么状态、由哪个组件负责、失败时会留下什么，以及调用方能够依赖哪些保证。本章的核心边界是“${chapter.boundary}”，所以我们不会把概念孤立成术语，而会把它放进一条真实请求路径中观察。`,
      `可以先建立一个简单心智模型：${topic.mechanism}。数据从入口进入后，会经历表示转换、规则判断和副作用；控制流则可能因为正常返回、错误、超时或取消而分叉。每一条分支都必须维护同一个不变量——${chapter.invariant}。如果只有成功路径满足它，系统在真实流量下迟早会积累脏状态。`,
      `在贯穿全书的项目“${chapter.project}”中，一个典型场景是：${topic.agentExample}。不要立即写代码，先回答四个问题：谁拥有当前状态，谁有权改变它，变化是否可以安全重放，哪些证据能够证明动作真的完成。这个顺序能把“凭感觉修 Bug”变成“依据契约定位偏差”。`,
      `最常见的误解是：${topic.misconception}。它之所以危险，是因为局部代码可能完全正确，系统级结果却错误。开发机上的单请求、单进程和稳定网络会隐藏竞态、资源上限与部分失败；到了并发、重启和多实例环境，隐含假设就会同时暴露。`,
      `工程决策不是寻找永远正确的固定答案。本节采用的判断原则是：${topic.decision}。你需要同时比较正确性、复杂度、延迟、成本和可观测性。如果一个方案无法解释失败后的状态，也没有办法从日志、指标或持久化记录中验证，它就还没有完成设计。`,
      `学习时请不断回到因果链：输入触发了什么状态变化，状态变化调用了什么外部资源，外部资源的结果怎样被确认，确认失败后系统如何恢复。后端能力的本质不是记住更多 API，而是面对陌生框架时仍能用这一套问题重建机制。与本节相关的第一手证据通常是：${chapter.evidence}。`,
      `这一概念与 Agent 的关系尤其紧密。模型输出具有概率性，工具和网络又会失败，因此后端必须用确定性结构包住不确定部分。模型可以提出下一步意图，但是否允许执行、参数是否合法、预算是否足够、状态能否提交，都应由普通程序判断。这里发生的典型系统性失败是：${chapter.failure}。`,
      `读完这一节后，不要以“我看懂了”为完成标准。你应能关掉页面，画出最小组件图，解释正常、失败、超时、取消四条路径，并用一个实验制造反例。只有当证据与预期一致，概念才从语言知识变成了可迁移的工程能力。`,
    ],
    mechanismSteps: [
      {
        title: "确定入口与责任者",
        detail: `先找到触发“${topic.title}”的真实入口，记录调用主体、输入来源和当前状态。责任者必须是一个可定位的模块，而不是“框架会处理”或“以后由 Worker 处理”这样的模糊描述。`,
      },
      {
        title: "写出状态与不变量",
        detail: `列出操作前后的状态，并把“${chapter.invariant}”写成断言、约束或状态机规则。若非法状态仍能被普通字段组合出来，就需要更强的类型、事务或集中式状态转换函数。`,
      },
      {
        title: "标出边界和副作用",
        detail: `沿调用链标记数据库、缓存、文件、模型、工具和网络边界。结合“${topic.mechanism}”判断哪些步骤只是计算，哪些步骤一旦执行就需要幂等、补偿或审计。`,
      },
      {
        title: "展开所有退出路径",
        detail: `除了成功返回，还要展开校验失败、权限不足、依赖超时、用户取消和进程终止。逐条检查资源是否释放、状态是否可解释、调用方是否收到稳定错误，以及任务是否仍在后台消耗资源。`,
      },
      {
        title: "用证据闭环",
        detail: `为关键判断选择可观察证据：${chapter.evidence}。先预测实验结果，再运行实验；若结果不符，修改心智模型而不是只修改代码，最后把发现固化为自动测试和运行手册。`,
      },
    ],
    caseStudy: {
      symptom: `${topic.agentExample}。团队最初把问题归因于“${topic.title}相关组件偶尔不稳定”，于是增加重试并扩大资源，但症状变得更随机，成本也继续上升。`,
      evidence: [
        `请求日志显示入口已经成功，但后续状态与“${chapter.invariant}”不一致；这说明错误不一定发生在入口，也可能发生在提交或确认阶段。`,
        `围绕该请求检查 ${chapter.evidence}，可以发现成功路径与失败路径记录的信息粒度不同，原有日志不足以区分“没有执行”和“执行后响应丢失”。`,
        `把并发降到 1、关闭自动重试后，故障频率变化明显，说明局部异常只是表象，时序、重复执行或资源竞争才是关键变量。`,
        `用故障注入在副作用前后分别终止进程，得到不同残留状态，从而证明系统没有为不确定结果设计恢复协议。`,
      ],
      analysis: [
        `第一步不是修补异常，而是根据定义还原机制：${topic.mechanism}。如果观测事实与机制预测冲突，应优先寻找被遗漏的边界和隐式默认值。`,
        `第二步检查常见误解“${topic.misconception}”是否进入了实现。团队往往把单进程、单请求下成立的经验当成分布式契约，导致重试、扩容或重启反而放大故障。`,
        `第三步沿状态变化寻找第一个不满足不变量的位置。第一个报错位置不一定是根因；例如连接池耗尽可能源于更早的任务泄漏，重复数据可能源于超时后的盲目重试。`,
        `第四步区分事实、推断和假设。日志与数据库记录是事实，“供应商不稳定”只是推断；需要通过对照实验逐个排除，避免凭一个相关现象直接下结论。`,
      ],
      correction: [
        `按照“${topic.decision}”重新定义接口，使调用者明确知道成功、失败、取消和结果未知分别意味着什么。`,
        `把不变量下沉为数据库约束、类型、状态转换或统一策略检查，让所有入口复用同一规则，避免只在某个 handler 中临时校验。`,
        `补齐请求标识、状态版本、耗时和外部调用标识，保证一次失败能够从入口追踪到最终副作用，同时对敏感正文和密钥做脱敏。`,
        `增加正常、边界、超时、取消、重复执行和进程重启测试。修复的验收不是“错误不再出现”，而是每种失败都有确定状态、可观察证据和恢复动作。`,
      ],
    },
    languageComparison: {
      python: commonLanguage("python"),
      cpp: commonLanguage("cpp"),
      rust: commonLanguage("rust"),
    },
    lab: {
      goal: `${topic.experiment}。实验的目的不是抄出一段可运行代码，而是让你亲眼看到错误假设怎样变成可观察结果。`,
      steps: [
        `先写下预测：正常、错误、超时和取消时各会发生什么；记录你认为必须始终成立的不变量“${chapter.invariant}”。`,
        `用最小程序实现核心路径，只保留一个入口、一个状态存储和一个可控外部依赖。外部依赖必须能注入延迟、错误与结果丢失。`,
        `运行基线并保存 ${chapter.evidence}，确认观测手段足以解释一次完整操作，而不只是打印“开始”和“结束”。`,
        `在关键副作用之前、期间和之后分别注入失败；再重复请求、并发请求并主动取消，比较实际状态与最初预测。`,
        `修改设计以落实“${topic.decision}”，重新运行同一组实验。不要改变测试来迎合实现，除非你能说明原契约为什么错误。`,
        `把最终发现整理为一页说明：机制图、失败时间线、关键日志、修复原则和仍未解决的限制，并把可自动验证的部分写成回归测试。`,
      ],
      checks: [
        "能够用自己的话说明机制，而不是复述框架文档",
        "正常、失败、超时、取消四条路径都有可重复证据",
        "实验没有依赖真实付费模型或不可控外部服务",
        "修复后仍保留失败注入，证明系统不是碰巧通过",
        "三种语言的差异被限制在实现层，领域契约保持一致",
      ],
    },
    review: [
      {
        question: `为什么“${topic.definition}”还不足以指导生产设计？`,
        answer: `定义只告诉我们概念是什么，生产设计还必须说明责任边界、状态不变量、失败语义和证据。结合本章，应把“${chapter.boundary}”落实到组件接口，并保证“${chapter.invariant}”在成功与失败路径上都成立。`,
      },
      {
        question: `面对案例“${topic.agentExample}”，第一步应该增加重试吗？`,
        answer: `不应该直接增加。先确认操作是否幂等、旧请求是否可能已经产生副作用，以及总 deadline 是否允许重试。然后依据 ${chapter.evidence} 判断失败位置；结果未知时应进入查询或对账流程，而不是盲目重放。`,
      },
      {
        question: `如何证明自己真正掌握了“${topic.title}”？`,
        answer: `你应能从零画出机制与边界，预测至少四种退出路径，完成实验“${topic.experiment}”，并解释 Python、C++、Rust 在资源和错误表达上的不同。最后还要能审查 AI 生成实现，指出它违反了哪条不变量，而不是只评价代码风格。`,
      },
    ],
  };
}

export function buildDeepChapter(profile: ChapterProfile): DeepChapter {
  return {
    number: profile.number,
    title: profile.title,
    preface: [
      `这一章要解决的不是一组彼此独立的名词，而是一个完整工程问题：${profile.why}。我们会持续使用“${profile.project}”作为贯穿案例，让概念落在真实的数据、状态和失败路径上。`,
      `全章的责任边界是“${profile.boundary}”，必须维护的不变量是“${profile.invariant}”。每一节都先解释机制，再进入案例和实验；你应把观察到的 ${profile.evidence} 与心智模型互相校验。`,
      `建议每次只学习一个深度单元：先阅读正文，随后关闭答案独立完成实验，最后用 Python、C++、Rust 中至少一种语言实现，再选另一种语言重做最关键的边界。预计每章需要 8–15 小时，而不是浏览十分钟。`,
    ],
    units: profile.topics.map((topic, index) => makeUnit(profile, topic, index)),
  };
}

export function countDeepChapterCharacters(chapter: DeepChapter): number {
  const text = JSON.stringify(chapter);
  return (text.match(/[\u3400-\u9fff]/g) || []).length;
}
