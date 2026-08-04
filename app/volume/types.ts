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
    `用 ${languageLabels[language]} 练习这一节时，不要只看语法写法。先把边界写清楚：${chapter.languageNotes[language]}。随后检查一件事：代码是否真的维护了“${chapter.invariant}”。`,
  ];
  const openings = [
    `先把 **${topic.title}** 当成一个会影响程序正确性的基础概念，而不是面试题里的名词。${topic.definition}。这句话看起来朴素，但它决定了代码里什么可以被相信、什么必须先校验、什么变化需要留下记录。`,
    `学习 **${topic.title}** 时，最容易犯的错是急着找框架 API。其实你要先明白：${topic.definition}。API 只是表达方式，真正要掌握的是这个概念如何影响数据、状态和错误。`,
    `这一节讲 **${topic.title}**。它的基本意思是：${topic.definition}。如果只背定义，你会觉得它很抽象；把它放进一次后端请求里，它就会变成很具体的问题。`,
    `很多后端 Bug 并不是复杂算法写错，而是基础概念没有落实。比如 **${topic.title}**：${topic.definition}。只要这里想错，后面的框架、数据库和 Agent 逻辑都会跟着偏。`,
  ];
  const bridges = [
    `可以用一个简单判断来读代码：${topic.mechanism}。也就是说，先看值从哪里来，再看它经过哪些转换，最后看它有没有改变数据库、文件、网络或任务状态。`,
    `读这一类代码时，不需要一上来画复杂图。抓住一条线就够了：${topic.mechanism}。如果这条线说不清，说明代码的责任边界还没有被你真正看懂。`,
    `把它放到程序运行中看，会更清楚：${topic.mechanism}。这一步不是为了制造复杂感，而是为了避免只理解成功路径。`,
    `实际开发时，我建议你反复问一个很普通的问题：${topic.mechanism}。这个问题能帮你发现那些藏在“应该没事吧”里的风险。`,
  ];
  const examples = [
    `举个例子，${topic.agentExample}。这个例子不是为了推导一套宏大流程，而是说明一个很小的事实：**例子里的失败通常不是突然发生的，它往往来自前面某个边界没有说清楚**。`,
    `在贯穿项目“${chapter.project}”里，可以看到这样的场景：${topic.agentExample}。你不用立刻写代码，先判断谁拥有状态、谁能修改状态、修改失败后还能不能解释清楚。`,
    `换成 Agent Runtime 的语境，问题会变得更明显：${topic.agentExample}。模型输出可以是不确定的，但后端保存状态、校验权限和记录结果必须是确定的。`,
    `一个贴近实践的例子是：${topic.agentExample}。这种例子看起来像某个模块的小问题，实际常常会牵动错误处理、日志、权限和数据一致性。`,
  ];
  const misconceptions = [
    `这里有一个常见误解：${topic.misconception}。它危险的地方在于，单次请求、开发环境和理想输入下确实可能看不出问题；一旦出现并发、取消、重试或重启，隐含假设就会暴露。`,
    `不要落入这个误区：${topic.misconception}。基础教材里反复强调边界，不是为了“工程八股”，而是因为边界一旦模糊，错误就会在系统里漂移。`,
    `初学时很容易以为：${topic.misconception}。如果你发现自己准备这样解释代码，最好停一下，找一个反例验证它。`,
    `最该警惕的是：${topic.misconception}。这类想法通常能让代码更快写出来，却会让调试成本在后面集中爆发。`,
  ];
  const decisions = [
    `所以本节的学习重点是：**${topic.decision}**。你不需要记住唯一答案，只需要能说明为什么这样做更安全，失败时留下什么证据，以及换语言后哪些契约仍然不变。`,
    `更实用的判断方式是：**${topic.decision}**。当 AI 生成代码时，你就用这句话检查它有没有把关键责任交给确定性的程序，而不是交给提示词或注释。`,
    `落到代码审查上，重点可以压缩成一句话：**${topic.decision}**。只要这句话没有被落实，代码看起来再整洁也还不可靠。`,
    `学完这一节，你至少要能回答：**${topic.decision}**。能回答它，就说明你不是在背术语，而是在理解如何写出可维护的后端代码。`,
  ];
  const studyNotes = [
    [
      `作为基础知识，它的学习顺序应该很朴素：先看最小例子，再看真实系统里的变形，最后再回到八股概念。比如你可以先写一个只有十几行的小程序，让“${topic.title}”的正常情况和异常情况都发生一次。这样再读框架文档时，文档里的名词就不会悬在空中。`,
      `写代码时，要把“能跑”拆成几件更小的事：输入是否合法，状态是否明确，错误是否能被调用者理解，资源是否能释放。很多 AI 生成代码的问题，不是语法错，而是只覆盖了最顺的一条路径。你审查时先抓这几件事，比一上来纠结风格更有用。`,
      `如果你同时学 Python、C++、Rust，不要把压力放在“同一知识点要背三套写法”上。更好的办法是：先用主力语言写通，再问另一种语言为什么会用不同方式表达同一件事。Python 常把问题留到运行期，C++ 要你管理对象和资源，Rust 则尽量在编译期逼你说明所有权。`,
      `最后，把这一节和本章边界连起来看：${chapter.boundary}。这句话可能不像代码片段那样刺激，但它是你以后读大型项目时的定位工具。只要知道边界在哪里，你就能判断一个改动应该落在哪个模块，而不是到处加补丁。`,
    ],
    [
      `初学者容易把概念学成“定义 + 术语解释”，读完还是不会用。你可以换一种学法：每读完一段，就问自己它能阻止哪一种错误。如果一个知识点不能帮你发现错误、设计边界或写测试，那说明你还没有把它转成自己的工程直觉。`,
      `本节的例子只负责说明知识点，不需要被当成完整系统设计。看到“${topic.agentExample}”时，你只要抓住其中最关键的一点：哪一步开始改变了外部世界。只要涉及写数据库、发请求、执行工具或启动后台任务，就不能再只按普通函数调用来理解。`,
      `在练习里，建议你故意制造一个反例。比如让输入为空、让依赖超时、让任务被取消、让同一个请求执行两次。反例会让抽象概念变得非常具体，也会让你意识到很多“八股问题”其实来自真实事故，而不是凭空编出来的考试题。`,
      `对 AI 生成代码也要这样看。不要问“它有没有写完功能”，先问它有没有把“${topic.decision}”落实成代码。如果答案是否定的，你可以让 AI 继续改，但修改目标要具体：补校验、补状态、补错误分类、补测试，而不是笼统地说“写得更健壮”。`,
    ],
    [
      `这一节还有一个重要习惯：把概念和时间顺序放在一起看。后端程序不是静态文本，它会经历启动、接收请求、调用依赖、提交结果、退出和恢复。很多基础知识只有放进这个时间顺序里才有意义，否则它们就会变成孤立定义。`,
      `例如，在成功路径上你可能觉得“${topic.title}”很简单；但一旦加上超时、取消、重试、并发和进程重启，它就会露出真正的边界。基础教材要讲这些情况，不是为了显得高级，而是为了让你从一开始就知道真实系统不会只走成功路径。`,
      `你可以把本节当成一张检查表，但不要把它读成清单。清单告诉你有哪些词，教材要帮你明白这些词之间的关系。比如本章不变量是“${chapter.invariant}”，它会反复出现在错误处理、测试、部署和 Agent 后端章节中。`,
      `学到这里，如果你只能复述定义，还不够；如果你能解释一个小 Bug 为什么违反这个概念，就已经开始掌握了；如果你能写一个测试防止它再次发生，这个知识点才算真正进入你的工具箱。`,
    ],
    [
      `不要把这一节理解成“工程复杂化”。恰恰相反，基础知识的作用是让复杂问题变简单：先把不可信输入挡在边界外，把状态变化放到明确位置，把错误交给能处理它的人。做好这些，后面的框架和架构选择会轻松很多。`,
      `一个好例子应该只照亮一个概念，而不是把所有系统设计问题塞进去。因此这里的例子会尽量小：它只帮助你理解“${topic.title}”为什么重要。真正的大项目会在后续章节逐步拼起来，而不是在每一节都重新做一遍完整事故复盘。`,
      `实际学习时，建议你准备一个固定的小仓库。每章遇到新概念，就在同一个小项目里加一两个最小实现。这样你会看到知识之间的连接：类型会影响 API，API 会影响测试，测试会影响部署，部署又会倒逼你处理配置、日志和退出。`,
      `如果你以后用 AI 辅助写代码，这种学习方式尤其重要。AI 能很快给出“像样”的实现，但你需要用本节的知识判断它有没有遗漏基础边界。你不必比 AI 更快写代码，但要能比 AI 更清楚地判断代码是否可信。`,
    ],
  ];
  const reinforcementNotes = [
    [
      `从八股文角度看，你可以把它记成一个问题：这里到底在保护什么？保护的是类型安全、资源释放、协议语义、数据一致性，还是用户权限。只要能说出保护对象，就不会只停留在背概念。`,
      `从项目角度看，你可以把它落实成一个很小的动作：给关键函数补一个更窄的类型、给外部调用补一个超时、给状态变化补一条测试，或者给日志补一个能串起请求的 ID。基础能力就是这样一点点沉到代码里的。`,
    ],
    [
      `如果你觉得这一节太基础，反而要警惕。很多线上事故最后复盘时，根因都不是没人懂高级架构，而是某个基础前提没有被写进代码。比如默认输入可信、默认任务会结束、默认重试不会重复写入，这些都是很便宜但很危险的假设。`,
      `因此学习时不必追求一次读完所有语言生态。主线语言负责动手，另外两种语言负责打开视角。你会发现同一个问题在不同语言里有不同摩擦点，而这些摩擦点恰好提醒你：程序正确性不是框架自动赠送的。`,
    ],
    [
      `读别人的代码时，也可以用这一节做导航。先找入口，再找状态，再找副作用，最后找失败路径。即使项目很大，这个顺序也能帮你把陌生代码切成可以理解的小块，而不是被文件数量吓住。`,
      `写自己的代码时，尽量把关键规则放在离状态最近的地方。能用数据库约束保证的，不要只靠注释；能用类型表达的，不要只靠字符串约定；能用测试复现的，不要只靠“我手动试过”。`,
    ],
    [
      `对于 Agent 后端，这一点更明显。模型会生成意图，工具会产生副作用，用户又可能中途取消。后端不能假设所有参与者都按理想方式运行，而要把边界、预算、权限和状态写成普通程序能检查的东西。`,
      `这一节学完后，你可以把它转成一句自己的话，并在代码里找一个对应例子。教材的目标不是让你记住每个句子，而是让你以后看到类似代码时，脑子里自然冒出该问的问题。`,
    ],
  ];

  return {
    id: `deep-${chapterNo}-${unitNo}`,
    title: `${chapter.number}.${index + 1} ${topic.title}`,
    readingTime: "约 12–18 分钟",
    question: `这一节只解决一个基础问题：${topic.title} 到底怎样影响后端代码的正确性？`,
    paragraphs: [
      openings[index % openings.length],
      bridges[index % bridges.length],
      examples[index % examples.length],
      misconceptions[index % misconceptions.length],
      ...studyNotes[index % studyNotes.length],
      ...reinforcementNotes[index % reinforcementNotes.length],
      decisions[index % decisions.length],
      `最后用证据收束学习。和本节相关的证据通常包括：${chapter.evidence}。不要只说“代码应该没问题”，而要能指出哪条日志、哪条测试、哪个状态字段证明它确实满足本章不变量：${chapter.invariant}。`,
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
      symptom: `举个例子：${topic.agentExample}。如果只看表面，很容易把它归因于某个库不稳定；但在基础教材里，我们更关心它暴露了哪个概念没有学扎实。`,
      evidence: [
        `先看 ${chapter.evidence}，确认问题发生在哪个边界。`,
        `再检查状态是否仍满足“${chapter.invariant}”。`,
      ],
      analysis: [
        `先排除“${topic.misconception}”这个误解。`,
        `再沿着“${topic.mechanism}”检查实际代码有没有漏掉退出路径。`,
      ],
      correction: [
        `按“${topic.decision}”修改边界，而不是只在出错位置加一层补丁。`,
        `补一条能复现这个例子的测试，让以后 AI 生成代码时也过不了错误实现。`,
      ],
    },
    languageComparison: {
      python: commonLanguage("python"),
      cpp: commonLanguage("cpp"),
      rust: commonLanguage("rust"),
    },
    lab: {
      goal: `${topic.experiment}。这个练习只要求做一个最小反例，目的是把概念变成亲眼可见的现象。`,
      steps: [
        `先写下你对正常路径和失败路径的预测。`,
        `用最小程序复现，不要一开始接真实数据库或真实模型。`,
        `记录 ${chapter.evidence}，比较实际结果和预测是否一致。`,
      ],
      checks: [
        "能用自己的话解释现象",
        "有一条失败路径测试",
        "例子足够小，可以反复运行",
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
      `这一章要解决的问题是：${profile.why}。我们会持续使用“${profile.project}”作为例子，但例子只服务于理解，不会把每个知识点都写成同一种案例分析。`,
      `全章的责任边界是“${profile.boundary}”，必须维护的不变量是“${profile.invariant}”。阅读时请优先抓住这些粗体重点和正文解释，表格、练习和例子只是辅助。`,
      `学完正文后，再进入本章的面试强化区，把基础概念转换成高频问答、手写题和系统设计取舍。这样学习顺序会更自然：先懂，再练，再接受追问。`,
      `建议每次学习两到三个小节：先通读正文，再挑一个练习亲手验证。Python、C++、Rust 可以任选其一作为主线，另一种语言用来对照理解资源、错误和并发的差异。`,
    ],
    units: profile.topics.map((topic, index) => makeUnit(profile, topic, index)),
  };
}

export function countDeepChapterCharacters(chapter: DeepChapter): number {
  const text = [
    ...chapter.preface,
    ...chapter.units.flatMap((unit) => [
      unit.question,
      ...unit.paragraphs,
      unit.caseStudy.symptom,
      unit.caseStudy.analysis[0] ?? "",
      unit.caseStudy.correction[0] ?? "",
      ...unit.languageComparison.python,
      unit.lab.goal,
      ...unit.lab.steps,
    ]),
  ].join("");
  return (text.match(/[\u3400-\u9fff]/g) || []).length;
}
