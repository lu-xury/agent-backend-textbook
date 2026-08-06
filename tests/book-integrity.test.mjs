import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const bookRoot = new URL("../app/book/", import.meta.url);

const requiredConcepts = {
  "chapter01.md": ["不变量", "动态规划", "BFS", "LruCache"],
  "chapter02.md": ["用户态", "系统调用", "happens-before", "死锁", "僵尸进程", "epoll", "页缓存", "sendfile", "伙伴系统", "VFS", "inode"],
  "chapter03.md": ["最长前缀匹配", "ARP", "PMTUD", "拥塞控制", "HTTP 缓存", "四元组", "五元组", "Content-Length", "request smuggling"],
  "chapter04.md": ["RPC", "GraphQL", "任务资源", "幂等键"],
  "chapter05.md": ["LEFT JOIN", "执行计划", "WAL", "REDO", "PITR", "RANK()", "DENSE_RANK", "聚簇索引", "缓冲池", "LSM tree"],
  "chapter06.md": ["maxmemory", "淘汰策略", "异步", "16,384", "hash tag", "热 key", "多级缓存"],
  "chapter07.md": ["追加事件流", "生产者确认", "分区", "幂等键", "rebalance", "lag", "ISR", "min.insync.replicas"],
  "chapter08.md": ["XSS", "CSRF", "SSRF", "参数化"],
  "chapter09.md": ["性质测试", "变异测试", "并发", "集成测试", "等价类", "边界值", "决策表", "状态迁移"],
  "chapter10.md": ["标签基数", "上下文传播", "采样", "错误预算"],
  "chapter11.md": ["Deployment", "Service", "NetworkPolicy", "ServiceAccount", "veth", "DNAT", "CNI", "Pod `phase`"],
  "chapter12.md": ["法定人数", "fencing token", "CRDT", "心跳", "一致性哈希", "最少连接", "全局 ID", "在线重分片", "TCC"],
  "chapter13.md": ["评测集", "降级路径", "Run", "ManualReview", "additionalProperties", "错误预算", "Recall@k", "版本化索引"],
};

const diagramEvidence = {
  "chapter02.md": ["Task sleeps", "I/O event makes task runnable"],
  "chapter03.md": ["SYN-SENT", "ESTABLISHED after ACK arrives"],
  "chapter04.md": ["413 or timeout", "Authenticate, then authorize resource"],
  "chapter05.md": ["Flush commit WAL", "Crash recovery redoes from checkpoint"],
  "chapter06.md": ["SET stale value v1", "Cache is stale until invalidation or expiry"],
  "chapter07.md": ["ACK lost or consumer crashes after commit", "ACK duplicate safely"],
  "chapter08.md": ["Document service: object AuthZ", "issue scoped, expiring URL"],
  "chapter10.md": ["User SLI recovered?", "Apply the safest reversible mitigation"],
  "chapter11.md": ["startup failure threshold reached", "readiness failed"],
  "chapter12.md": ["quorum (2 of 3)", "Mark entry committed"],
  "chapter13.md": ["external effect is unknown", "ManualReview"],
};

test("ships thirteen independently readable, non-template chapters", async () => {
  const files = (await readdir(bookRoot)).filter((file) => /^chapter\d\d\.md$/.test(file)).sort();
  assert.equal(files.length, 13, "the textbook must contain exactly thirteen chapter manuscripts");

  let totalCjk = 0;
  let totalDiagrams = 0;
  for (const file of files) {
    const manuscript = await readFile(join(bookRoot.pathname, file), "utf8");
    const prose = manuscript.replace(/```[\s\S]*?```/g, "");
    const cjk = (manuscript.match(/[\u3400-\u9fff]/g) ?? []).length;
    const diagrams = (manuscript.match(/^```mermaid$/gm) ?? []).length;
    totalCjk += cjk;
    totalDiagrams += diagrams;
    assert.ok(cjk >= 6_000, `${file} is too short to be a complete chapter: ${cjk}`);
    assert.ok((manuscript.match(/^## /gm) ?? []).length >= 6, `${file} needs a substantive section structure`);
    assert.equal((manuscript.match(/^```/gm) ?? []).length % 2, 0, `${file} has an unclosed fenced code block`);
    assert.match(manuscript, /练习/, `${file} needs an opportunity to check understanding`);
    assert.doesNotMatch(manuscript, /机制推演|逐步推理|固定学习环节/, `${file} contains retired template wording`);
    assert.doesNotMatch(
      prose,
      /这就?意味着|这是关键|这是核心|值得注意|需要强调|必须指出|重要的是|显而易见|毋庸置疑|本质上|究其根本|原因很简单|取舍是明确的|关键的不变量是|环环相扣|极其|如下所示|请看下表/,
      `${file} contains avoidable meta-commentary or inflated wording`,
    );
    assert.doesNotMatch(prose, /^\*\*(?:练习|答案|问：)/m, `${file} bolds an instructional label instead of a technical term`);
    for (const concept of requiredConcepts[file]) {
      assert.ok(manuscript.includes(concept), `${file} must explain ${concept} as a core concept`);
    }
    for (const evidence of diagramEvidence[file] ?? []) {
      assert.ok(manuscript.includes(evidence), `${file} diagram must preserve the consequential branch: ${evidence}`);
    }
    assert.doesNotMatch(
      manuscript,
      /Domain\s*-->\s*Store|Input\s*-->\s*Parse|Failure\s*-->\s*Reproduce|SET if version current/,
      `${file} reintroduces a generic or unexplained diagram edge`,
    );
  }
  assert.ok(totalCjk >= 105_000, `expected a complete condensed textbook, got ${totalCjk} CJK characters`);
  assert.ok(totalDiagrams >= 10, `expected diagrams for the book's major processes and state transitions, got ${totalDiagrams}`);
});
