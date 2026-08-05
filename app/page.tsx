"use client";

import { useEffect, useMemo, useState } from "react";
import { chapters } from "./book";
import type { Chapter } from "./book/types";

function InlineText({ text }: { text: string }) {
  const pieces = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|https?:\/\/[^\s<>"]+)/g);
  return <>{pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith("`") && piece.endsWith("`")) return <code key={index}>{piece.slice(1, -1)}</code>;
    const markdownLink = piece.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (markdownLink) return <a key={index} href={markdownLink[2]} target="_blank" rel="noreferrer">{markdownLink[1]}</a>;
    if (piece.startsWith("http://") || piece.startsWith("https://")) {
      const [, href, trailing = ""] = piece.match(/^(.*?)([。，、；：！？,.!?:;）]*)$/) ?? [, piece, ""];
      return <span key={index}><a href={href} target="_blank" rel="noreferrer">{href}</a>{trailing}</span>;
    }
    return <span key={index}>{piece}</span>;
  })}</>;
}

const slug = (value: string) => value.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
const visualTables: Record<number, { title: string; columns: string[]; rows: string[][] }> = {
  2: { title: "并发单元的边界", columns: ["概念", "共享什么", "适合什么"], rows: [["进程", "默认不共享地址空间", "故障隔离、独立服务"], ["线程", "进程内内存与文件描述符", "并行 CPU 工作或阻塞 API"], ["协程", "由运行时协作调度", "大量 I/O 等待"]] },
  3: { title: "网络栈中各层的职责", columns: ["层", "提供的能力", "不能保证什么"], rows: [["IP", "按路由表把数据报送往下一跳", "必达、顺序与只送一次"], ["TCP", "有序、可靠的字节流", "应用消息边界"], ["TLS", "保密、完整性、对端认证", "业务身份与授权"], ["HTTP", "请求—响应语义", "请求一定只执行一次"]] },
  4: { title: "一次 API 输入的三种表示", columns: ["表示", "边界", "主要职责"], rows: [["DTO", "HTTP 入口/出口", "解析和校验外部数据"], ["领域模型", "业务规则内部", "表达业务状态和约束"], ["ORM 实体", "持久化层", "映射数据库记录"]] },
  5: { title: "数据库机制各自解决的问题", columns: ["机制", "主要收益", "代价或边界"], rows: [["索引", "减少定位和排序成本", "占空间，拖慢写入"], ["事务", "一组变化的原子提交", "不自动协调外部系统"], ["连接池", "复用连接并限制并发", "池过大也会压垮数据库"]] },
  6: { title: "缓存问题与对应策略", columns: ["现象", "直接原因", "优先处理"], rows: [["穿透", "反复查询不存在的数据", "缓存空值或过滤非法键"], ["击穿", "热点键同刻失效", "预热、互斥或逻辑过期"], ["雪崩", "大量键同时失效", "错开 TTL、限流和降级"]] },
  7: { title: "消息处理的状态变化", columns: ["动作", "意味着什么", "必须补的保护"], rows: [["投递", "消费者可能收到消息", "接受重复和乱序可能"], ["确认", "Broker 可删除这份消息", "确认应晚于持久副作用"], ["重试", "同一意图再次执行", "业务幂等键与死信路径"]] },
  8: { title: "安全概念不要混用", columns: ["概念", "回答的问题", "典型手段"], rows: [["认证", "你是谁", "密码、OIDC、会话"], ["授权", "你能做什么", "角色、权限、策略"], ["加密", "旁观者能否读到数据", "TLS、信封加密"]] },
  9: { title: "测试层级与反馈", columns: ["层级", "主要验证", "典型取舍"], rows: [["单元测试", "小范围逻辑", "快，但难发现集成错误"], ["集成测试", "组件边界与真实依赖", "更慢，需要管理数据"], ["端到端测试", "关键用户路径", "覆盖真实，定位成本高"]] },
  10: { title: "三类遥测数据", columns: ["数据", "最擅长回答", "常见字段"], rows: [["日志", "发生了什么细节", "时间、级别、request_id"], ["指标", "趋势是否异常", "计数、分位数、标签"], ["Trace", "一次请求在哪里变慢", "span、父子关系、耗时"]] },
  11: { title: "上线信号的用途", columns: ["信号", "检查什么", "不代表什么"], rows: [["存活检查", "进程是否还活着", "已能接收流量"], ["就绪检查", "当前能否处理请求", "业务结果一定正确"], ["迁移完成", "模式变更已执行", "旧程序一定兼容"]] },
  12: { title: "分布式一致性术语", columns: ["术语", "承诺", "不承诺"], rows: [["线性一致性", "读到最近完成的写", "低延迟或永不故障"], ["可串行化", "事务效果像某种串行顺序", "一定是实时顺序"], ["最终一致性", "副本会在无新写入后收敛", "任意时刻读到最新值"]] },
  13: { title: "Agent Runtime 的职责分界", columns: ["部分", "可以做什么", "不能替代什么"], rows: [["LLM", "提出计划和工具参数", "权限判断与副作用控制"], ["Runtime", "验证、编排、取消与记账", "凭空判断业务事实"], ["工具服务", "执行被授权的动作", "信任模型输出"]] },
};

const isTableDivider = (line: string) => /^\|?\s*:?-{3,}/.test(line);
const isBlockStart = (line: string) => /^```|^ {4}|^## |^### |^> |^- |^\d+\. |^\|/.test(line);
const hasLink = (text: string) => /\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|https?:\/\//.test(text);

function CodeBlock({ code, language, index }: { code: string; language?: string; index: number }) {
  const label = language && language !== "text" ? language : "代码";
  return <div className="code-block" key={index}>
    <div className="code-block-header"><span>{label}</span></div>
    <pre><code>{code}</code></pre>
  </div>;
}

function MarkdownBody({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").trim().split("\n");
  const nodes = [];
  let index = 0;
  let key = 0;

  const nextKey = () => key++;
  const skipBlankLines = () => { while (index < lines.length && !lines[index].trim()) index += 1; };
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());

  while (index < lines.length) {
    skipBlankLines();
    if (index >= lines.length) break;
    const line = lines[index];

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      nodes.push(<CodeBlock key={nextKey()} index={key} code={code.join("\n")} language={language} />);
      continue;
    }

    if (line.startsWith("    ")) {
      const code: string[] = [];
      while (index < lines.length && (lines[index].startsWith("    ") || !lines[index].trim())) {
        code.push(lines[index].startsWith("    ") ? lines[index].slice(4) : "");
        index += 1;
      }
      while (code.length && !code.at(-1)) code.pop();
      nodes.push(<CodeBlock key={nextKey()} index={key} code={code.join("\n")} language="text" />);
      continue;
    }

    if (line.startsWith("## ")) {
      const heading = line.slice(3);
      nodes.push(<h2 id={slug(heading)} key={nextKey()}>{heading}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={nextKey()}>{line.slice(4)}</h3>);
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) quote.push(lines[index++].slice(2));
      nodes.push(<aside className="callout" key={nextKey()}><p><InlineText text={quote.join(" ")} /></p></aside>);
      continue;
    }
    if (line.startsWith("|") && isTableDivider(lines[index + 1] ?? "")) {
      const head = cells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].startsWith("|")) rows.push(cells(lines[index++]));
      nodes.push(<div className="table-wrap" key={nextKey()}><table><thead><tr>{head.map((cell, cellIndex) => <th key={cellIndex}><InlineText text={cell} /></th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><InlineText text={cell} /></td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) items.push(lines[index++].slice(2));
      nodes.push(<ul key={nextKey()}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineText text={item} /></li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) items.push(lines[index++].replace(/^\d+\. /, ""));
      nodes.push(<ol key={nextKey()}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineText text={item} /></li>)}</ol>);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) paragraph.push(lines[index++]);
    const text = paragraph.join(" ");
    nodes.push(<p className={hasLink(text) ? "has-link" : undefined} key={nextKey()}><InlineText text={text} /></p>);
  }
  return <div className="book-prose">{nodes}</div>;
}

function ReadingProgress({ chapter }: { chapter: Chapter }) {
  const key = `backend-textbook-read-${chapter.number}`;
  const [done, setDone] = useState(false);
  useEffect(() => setDone(localStorage.getItem(key) === "true"), [key]);
  return <label className="reading-progress"><input type="checkbox" checked={done} onChange={(event) => { const next = event.target.checked; setDone(next); localStorage.setItem(key, String(next)); }} /><span aria-hidden="true">{done ? "✓" : ""}</span><b>我已完成本章阅读</b></label>;
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  const toc = [...chapter.markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  return <article className="chapter" aria-labelledby="chapter-title">
    <header className="chapter-hero"><div className="chapter-number" aria-hidden="true">{String(chapter.number).padStart(2, "0")}</div><div><p className="eyebrow">后端开发基础与实践 · 第 {chapter.number} 章</p><h1 id="chapter-title">{chapter.title}</h1><p className="chapter-subtitle">{chapter.subtitle}</p></div></header>
    <section className="opening" aria-label="本章导读">{chapter.opening.map((paragraph) => <p key={paragraph}><InlineText text={paragraph} /></p>)}</section>
    <section className="goals" aria-label="本章目标"><p className="section-kicker">读完这一章，你应当能够</p><ul>{chapter.goals.map((goal) => <li key={goal}><InlineText text={goal} /></li>)}</ul></section>
    <div className="chapter-layout"><nav className="chapter-toc" aria-label="本章目录"><span>本章目录</span>{toc.map((heading) => <a key={heading} href={`#${slug(heading)}`}>{heading}</a>)}</nav><div className="chapter-body"><MarkdownBody markdown={chapter.markdown} />{visualTables[chapter.number] && <section className="concept-table"><p className="section-kicker">一表辨析</p><h2>{visualTables[chapter.number].title}</h2><div className="table-wrap"><table><thead><tr>{visualTables[chapter.number].columns.map((cell) => <th key={cell}>{cell}</th>)}</tr></thead><tbody>{visualTables[chapter.number].rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>}<section className="chapter-summary"><p className="section-kicker">阅读完成</p><p>如果你能不用术语堆砌地解释本章的关键差别，并能用一个反例说明边界，就可以进入下一章。</p><ReadingProgress chapter={chapter} /></section><section className="further-reading"><p className="section-kicker">延伸阅读与事实依据</p><ul>{chapter.furtherReading.map((item) => <li key={item.href}><a href={item.href} target="_blank" rel="noreferrer">{item.title}</a></li>)}</ul></section></div></div>
  </article>;
}

export default function Home() {
  const [activeNumber, setActiveNumber] = useState(1);
  const [search, setSearch] = useState("");
  const active = chapters.find((chapter) => chapter.number === activeNumber) ?? chapters[0];
  useEffect(() => { const value = Number(window.location.hash.slice(1)); if (chapters.some((chapter) => chapter.number === value)) setActiveNumber(value); }, []);
  const available = useMemo(() => { const term = search.trim().toLowerCase(); return term ? chapters.filter((chapter) => `${chapter.title} ${chapter.shortTitle} ${chapter.subtitle} ${chapter.markdown}`.toLowerCase().includes(term)) : chapters; }, [search]);
  const chooseChapter = (number: number) => { setActiveNumber(number); window.location.hash = String(number); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <main className="app-shell"><aside className="sidebar"><a className="brand" href="#1" onClick={() => chooseChapter(1)}><span className="brand-mark">B<span>.</span></span><span><b>BACKEND TEXTBOOK</b><small>从基础原理到工程实践</small></span></a><p className="sidebar-intro">一本面向初学后端开发者的中文教材。先理解计算机系统，再写可维护的服务。</p><label className="search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索全书" aria-label="搜索全书" /></label><nav className="chapter-nav" aria-label="全书目录">{available.map((chapter) => <button className={chapter.number === active.number ? "active" : ""} key={chapter.number} onClick={() => chooseChapter(chapter.number)}><span>{String(chapter.number).padStart(2, "0")}</span><b>{chapter.shortTitle}</b></button>)}{!available.length && <p>没有找到相关章节。</p>}</nav><div className="sidebar-foot">13 章 · 基础、实践与面试辨析</div></aside><div className="content"><div className="topbar"><span>阅读不是背清单：每个概念都要能解释它为什么存在。</span></div><ChapterView chapter={active} /><nav className="pager" aria-label="章节翻页">{active.number > 1 ? <button onClick={() => chooseChapter(active.number - 1)}>← <span>上一章</span>{chapters[active.number - 2].title}</button> : <span />}{active.number < chapters.length ? <button onClick={() => chooseChapter(active.number + 1)}><span>下一章</span>{chapters[active.number].title} →</button> : <span />}</nav><footer>后端开发基础与实践 · 从概念、原理到可验证的工程判断</footer></div></main>;
}
