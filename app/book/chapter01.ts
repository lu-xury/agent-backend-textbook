import markdown from "./chapter01.md?raw";
import type { Chapter } from "./types";

export const chapter01: Chapter = {
  number: 1,
  shortTitle: "程序与复杂度",
  title: "后端程序、数据、接口与复杂度",
  subtitle: "先建立一套准确的程序语言，再学习网络、数据库和服务架构。",
  opening: [
    "后端程序把外部输入解释成受约束的数据，读取或改变状态，再返回输出并产生可追踪的副作用。登录、下单、查询余额和发送验证码都可以沿这条主线分析。",
    "本章建立阅读后端代码所需的基础语言：变量和对象的关系、类型检查的作用、函数契约、错误表达、资源生命周期，以及复杂度对应的规模风险。",
  ],
  goals: [
    "从一次请求中识别输入、状态、副作用和系统边界。",
    "解释值、变量、对象、类型、校验和函数契约各自解决的问题。",
    "区分可预期业务失败、基础设施失败和程序缺陷，并正确管理资源。",
    "用复杂度判断规模风险，避免把设计模式和接口当作形式。",
  ],
  markdown,
  furtherReading: [
    { title: "Python 文档：数据模型", href: "https://docs.python.org/3/reference/datamodel.html" },
    { title: "Rust：所有权与移动", href: "https://doc.rust-lang.org/rust-by-example/scope/move.html" },
    { title: "Java 语言规范：异常", href: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html" },
    { title: "MIT 6.006：渐近复杂度讲义", href: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/ce8348ec64dce3841ced6a9d0c9e48f2_MIT6_006F11_rec01.pdf" },
  ],
};
