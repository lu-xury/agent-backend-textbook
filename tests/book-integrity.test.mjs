import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const bookRoot = new URL("../app/book/", import.meta.url);

const requiredConcepts = {
  "chapter01.md": ["不变量", "动态规划", "BFS"],
  "chapter02.md": ["用户态", "系统调用", "happens-before", "死锁"],
  "chapter03.md": ["最长前缀匹配", "ARP", "PMTUD", "拥塞控制", "HTTP 缓存"],
  "chapter04.md": ["RPC", "GraphQL", "任务资源", "幂等键"],
  "chapter05.md": ["LEFT JOIN", "执行计划", "WAL", "PITR"],
  "chapter06.md": ["maxmemory", "淘汰策略", "异步", "哈希槽"],
  "chapter07.md": ["追加事件流", "生产者确认", "分区", "幂等键"],
  "chapter08.md": ["XSS", "CSRF", "SSRF", "参数化"],
  "chapter09.md": ["性质测试", "变异测试", "并发", "集成测试"],
  "chapter10.md": ["标签基数", "上下文传播", "采样", "错误预算"],
  "chapter11.md": ["Deployment", "Service", "NetworkPolicy", "ServiceAccount"],
  "chapter12.md": ["法定人数", "fencing token", "CRDT", "心跳"],
  "chapter13.md": ["评测集", "降级路径", "Run", "错误预算"],
};

test("ships thirteen independently readable, non-template chapters", async () => {
  const files = (await readdir(bookRoot)).filter((file) => /^chapter\d\d\.md$/.test(file)).sort();
  assert.equal(files.length, 13, "the textbook must contain exactly thirteen chapter manuscripts");

  let totalCjk = 0;
  for (const file of files) {
    const manuscript = await readFile(join(bookRoot.pathname, file), "utf8");
    const cjk = (manuscript.match(/[\u3400-\u9fff]/g) ?? []).length;
    totalCjk += cjk;
    assert.ok(cjk >= 6_000, `${file} is too short to be a complete chapter: ${cjk}`);
    assert.ok((manuscript.match(/^## /gm) ?? []).length >= 6, `${file} needs a substantive section structure`);
    assert.equal((manuscript.match(/^```/gm) ?? []).length % 2, 0, `${file} has an unclosed fenced code block`);
    assert.match(manuscript, /练习/, `${file} needs an opportunity to check understanding`);
    assert.doesNotMatch(manuscript, /机制推演|逐步推理|固定学习环节/, `${file} contains retired template wording`);
    for (const concept of requiredConcepts[file]) {
      assert.ok(manuscript.includes(concept), `${file} must explain ${concept} as a core concept`);
    }
  }
  assert.ok(totalCjk >= 105_000, `expected a complete condensed textbook, got ${totalCjk} CJK characters`);
});
