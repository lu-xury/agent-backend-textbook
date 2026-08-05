import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

test("builds the GitHub Pages textbook bundle", async () => {
  const distRoot = new URL("../dist/", import.meta.url);
  const indexHtml = await readFile(new URL("index.html", distRoot), "utf8");

  assert.match(indexHtml, /<div id="root"><\/div>/);
  assert.match(indexHtml, /\/agent-backend-textbook\/assets\/index-[^"]+\.js/);
  assert.match(indexHtml, /\/agent-backend-textbook\/assets\/index-[^"]+\.css/);

  const scriptPath = indexHtml.match(/src="\/agent-backend-textbook\/([^"]+\.js)"/)?.[1];
  const stylePath = indexHtml.match(/href="\/agent-backend-textbook\/([^"]+\.css)"/)?.[1];
  assert.ok(scriptPath, "expected built script asset");
  assert.ok(stylePath, "expected built stylesheet asset");

  const bundle = await readFile(join(distRoot.pathname, scriptPath), "utf8");
  const styles = await readFile(join(distRoot.pathname, stylePath), "utf8");

  assert.match(bundle, /后端程序、数据、接口与复杂度/);
  assert.match(bundle, /操作系统、进程、线程、协程与 Linux 资源/);
  assert.match(bundle, /网络、TCP、TLS 与 HTTP/);
  assert.match(bundle, /关系数据库、SQL、索引、事务与并发控制/);
  assert.match(bundle, /分布式系统与架构设计/);
  assert.match(bundle, /Agent 后端：把不确定性关在边界内/);
  assert.match(bundle, /认证与授权/);
  assert.match(bundle, /原子性与幂等性/);
  assert.match(bundle, /日志、指标和 Trace/);
  assert.match(bundle, /Tool schema 是契约，不是授权书/);
  assert.match(styles, /\.book-prose/);
  assert.match(styles, /\.chapter-toc/);
  assert.match(styles, /font-size:17px/);
  assert.doesNotMatch(bundle, /机制推演/);
  assert.doesNotMatch(bundle, /逐步推理/);

  const cjkCharacters = bundle.match(/[\u3400-\u9fff]/g) ?? [];
  assert.ok(
    cjkCharacters.length >= 100_000,
    `bundle should contain textbook prose and chapter distinctions; got ${cjkCharacters.length} CJK characters`,
  );
  assert.ok(
    cjkCharacters.length <= 130_000,
    `bundle should stay shorter than the previous template-heavy edition; got ${cjkCharacters.length} CJK characters`,
  );
});
