import markdown from "./chapter08.md?raw";
import type { Chapter } from "./types";

export const chapter08: Chapter = {
  number: 8,
  shortTitle: "安全与权限",
  title: "应用安全、身份、权限与数据保护",
  subtitle: "安全要求在每条数据和每次副作用前验证信任边界。",
  opening: [
    "安全开发先建立威胁模型：谁能控制输入，谁能读取或改变哪些资源，秘密泄露会造成什么后果。威胁模型为认证、授权、加密和审计确定具体边界。",
    "本章从身份确认、资源授权和数据保护三条线讲起，再把输入、网络、日志、依赖和事故响应放回同一套最小权限原则中。",
  ],
  goals: [
    "区分认证、授权、审计，以及 Cookie、Session、Token 的职责。",
    "正确解释密码哈希、加密、编码、签名、JWT 和 TLS 的用途与边界。",
    "在对象级授权、输入校验、SSRF、CSRF 和 CORS 上避免常见漏洞。",
    "用 Secret 管理、审计、依赖治理与最小权限形成可执行的安全防线。",
  ],
  markdown,
  furtherReading: [
    { title: "OWASP API Security Top 10", href: "https://owasp.org/www-project-api-security/" },
    { title: "OWASP Cheat Sheet Series", href: "https://cheatsheetseries.owasp.org/" },
    { title: "IETF RFC 7519：JSON Web Token", href: "https://www.rfc-editor.org/rfc/rfc7519" },
    { title: "NIST Digital Identity Guidelines", href: "https://pages.nist.gov/800-63-3/" },
  ],
};
