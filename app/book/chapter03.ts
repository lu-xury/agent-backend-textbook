import markdown from "./chapter03.md?raw";
import type { Chapter } from "./types";

export const chapter03: Chapter = {
  number: 3,
  shortTitle: "网络与 HTTP",
  title: "网络、TCP、TLS 与 HTTP",
  subtitle: "把一次请求拆回 DNS、连接、加密、协议语义、超时和断连，才能真正定位网络问题。",
  opening: [
    "浏览器里一次“加载失败”并不是一个单一事件。域名解析、路由、TCP 建连、TLS 验证、HTTP 语义、代理行为和客户端自身的取消都可能是原因。网络排障的第一原则是按层取证，而不是把一切叫作“超时”。",
    "本章从一次请求的路径解释常用网络概念，并把 HTTP 的语义和可靠后端的重试、幂等、流式传输联系起来。",
  ],
  goals: [
    "按 DNS、IP 路由、TCP、TLS、HTTP 的层次解释一条请求的去向与失败点。",
    "理解 TCP 提供可靠字节流，而非业务成功或消息边界。",
    "依据 HTTP 方法、幂等性和结果是否未知设计重试与写操作。",
    "区分 Cookie、Session、Token、SSE、WebSocket、代理与 CORS 的职责。",
  ],
  markdown,
  furtherReading: [
    { title: "IETF RFC 791：Internet Protocol", href: "https://www.rfc-editor.org/rfc/rfc791" },
    { title: "IETF RFC 8200：IPv6 Specification", href: "https://www.rfc-editor.org/rfc/rfc8200" },
    { title: "IETF RFC 9293：Transmission Control Protocol", href: "https://www.rfc-editor.org/rfc/rfc9293" },
    { title: "IETF RFC 9110：HTTP Semantics", href: "https://www.rfc-editor.org/rfc/rfc9110" },
    { title: "MDN：HTTP 概览与状态码", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
    { title: "MDN：CORS", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" },
  ],
};
