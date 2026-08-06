import markdown from "./chapter09.md?raw";
import type { Chapter } from "./types";

export const chapter09: Chapter = {
  number: 9,
  shortTitle: "测试与调试",
  title: "测试、调试与代码质量",
  subtitle: "测试把关键规则和失败边界变成可重复验证的证据。",
  opening: [
    "测试把程序行为写成可重复证据：输入是什么、预期发生什么、哪条规则被保护、失败时怎样定位。稳定的证据既保护重构，也暴露系统设计中的假设。",
    "本章会区分测试层级和测试替身，说明怎样构造可复现的失败，并把静态检查、代码审查和生产证据放到同一条质量链上。",
  ],
  goals: [
    "选择单元、集成、端到端、契约、属性与模糊测试的合适边界。",
    "准确区分 Dummy、Stub、Fake、Spy、Mock，并避免测试实现细节。",
    "用最小复现、栈追踪、确定性时间和隔离依赖定位问题。",
    "正确理解覆盖率、静态检查、格式化、评审与回归测试的互补关系。",
  ],
  markdown,
  furtherReading: [
    { title: "pytest 文档", href: "https://docs.pytest.org/" },
    { title: "JUnit 5 User Guide", href: "https://junit.org/junit5/docs/current/user-guide/" },
    { title: "GoogleTest Primer", href: "https://google.github.io/googletest/primer.html" },
    { title: "Rust：cargo test 与 fuzzing", href: "https://rust-fuzz.github.io/book/cargo-fuzz.html" },
  ],
};
