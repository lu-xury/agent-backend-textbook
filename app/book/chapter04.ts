import markdown from "./chapter04.md?raw";
import type { Chapter } from "./types";

export const chapter04: Chapter = {
  number: 4,
  shortTitle: "Web API 设计",
  title: "Web API、框架与服务边界",
  subtitle: "框架负责协议翻译；业务规则、数据访问和外部适配不该挤在同一个 handler 中。",
  opening: [
    "一个能返回 JSON 的路由并不等于一个设计完成的 Web API。真正的接口还要说明数据从哪里进入、谁有权操作资源、失败时客户端怎样判断、状态怎样保存，以及版本改变时旧客户端怎么办。",
    "本章用 API 的一次请求生命周期组织概念：入口的验证与身份、业务层的规则、存储与事务、外部回调和输出契约各自承担不同责任。",
  ],
  goals: [
    "区分 HTTP 入口、DTO、领域模型、Repository 和外部 Adapter 的职责。",
    "在认证之后做资源级授权，并给客户端稳定而安全的错误反馈。",
    "说明事务、连接、幂等键、Outbox 与 Webhook 去重各自解决的问题。",
    "设计可演进的分页、筛选、上传与 API 兼容策略。",
  ],
  markdown,
  furtherReading: [
    { title: "IETF RFC 9110：HTTP Semantics", href: "https://www.rfc-editor.org/rfc/rfc9110" },
    { title: "IETF RFC 9457：Problem Details for HTTP APIs", href: "https://www.rfc-editor.org/rfc/rfc9457" },
    { title: "OWASP API Security Top 10", href: "https://owasp.org/www-project-api-security/" },
    { title: "OWASP REST Security Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html" },
  ],
};
