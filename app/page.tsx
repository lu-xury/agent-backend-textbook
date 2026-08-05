"use client";

import { useEffect, useMemo, useState } from "react";
import { chapters } from "./book";
import type { Chapter } from "./book/types";

function InlineText({ text }: { text: string }) {
  const pieces = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return <>{pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith("`") && piece.endsWith("`")) return <code key={index}>{piece.slice(1, -1)}</code>;
    return <span key={index}>{piece}</span>;
  })}</>;
}

const slug = (value: string) => value.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");

function MarkdownBody({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n\s*\n/);
  return <div className="book-prose">{blocks.map((block, index) => {
    const text = block.trim();
    const fencedCode = text.match(/^```[^\n]*\n([\s\S]*?)\n```$/);
    if (fencedCode) return <pre key={index}><code>{fencedCode[1]}</code></pre>;
    if (text.startsWith("## ")) { const heading = text.slice(3); return <h2 id={slug(heading)} key={index}>{heading}</h2>; }
    if (text.startsWith("### ")) { const heading = text.slice(4); return <h3 key={index}>{heading}</h3>; }
    if (text.startsWith("> ")) return <aside className="callout" key={index}><p><InlineText text={text.slice(2)} /></p></aside>;
    if (text.startsWith("    ")) return <pre key={index}><code>{text.replace(/^    /gm, "")}</code></pre>;
    const lines = text.split("\n");
    if (lines.every((line) => line.startsWith("- "))) return <ul key={index}>{lines.map((line) => <li key={line}><InlineText text={line.slice(2)} /></li>)}</ul>;
    if (lines.every((line) => /^\d+\. /.test(line))) return <ol key={index}>{lines.map((line) => <li key={line}><InlineText text={line.replace(/^\d+\. /, "")} /></li>)}</ol>;
    return <p key={index}><InlineText text={text.replace(/\n/g, " ")} /></p>;
  })}</div>;
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
    <div className="chapter-layout"><nav className="chapter-toc" aria-label="本章目录"><span>本章目录</span>{toc.map((heading) => <a key={heading} href={`#${slug(heading)}`}>{heading}</a>)}</nav><div className="chapter-body"><MarkdownBody markdown={chapter.markdown} /><section className="chapter-summary"><p className="section-kicker">阅读完成</p><p>如果你能不用术语堆砌地解释本章的关键差别，并能用一个反例说明边界，就可以进入下一章。</p><ReadingProgress chapter={chapter} /></section><section className="further-reading"><p className="section-kicker">延伸阅读与事实依据</p><ul>{chapter.furtherReading.map((item) => <li key={item.href}><a href={item.href} target="_blank" rel="noreferrer">{item.title}</a></li>)}</ul></section></div></div>
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
