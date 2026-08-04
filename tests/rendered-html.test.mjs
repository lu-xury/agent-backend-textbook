import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /把一段代码看成五层契约/);
  assert.match(html, /一段“看起来没问题”的模型调用为什么拖垮服务/);
  assert.match(html, /理解检查与参考答案/);
  assert.match(html, /本章完整教学正文/);
  assert.match(html, /值、引用与所有权/);
  assert.match(html, /从入口到证据：机制推演/);
  assert.match(html, /引导实验/);

  const cjkCharacters = html.match(/[\u3400-\u9fff]/g) ?? [];
  assert.ok(
    cjkCharacters.length >= 35_000,
    `chapter 1 should render as full textbook prose; got ${cjkCharacters.length} CJK characters`,
  );
});
