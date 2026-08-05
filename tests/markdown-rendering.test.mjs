import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("preserves fenced code and renders links without putting URL text in justified prose", async () => {
  const server = await createServer({
    configFile: "./vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
  });

  try {
    const { chapters } = await server.ssrLoadModule("/../app/book/index.ts");
    const { default: Home } = await server.ssrLoadModule("/../app/page.tsx");
    const original = chapters[0].markdown;
    chapters[0].markdown = [
      "## 回归检查",
      "",
      "说明文字：[官方探针指南](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) 与 https://example.com/a/very/long/path。",
      "",
      "```python",
      "async def fetch():",
      "    first = await load_first()",
      "",
      "    return await load_second(first)",
      "```",
    ].join("\n");

    const html = renderToStaticMarkup(createElement(Home));
    chapters[0].markdown = original;

    assert.match(html, /class="code-block"/);
    assert.match(html, /first = await load_first\(\)\n\n    return await load_second\(first\)/);
    assert.match(html, /<p class="has-link">/);
    assert.match(html, />官方探针指南<\/a>/);
    assert.match(html, /href="https:\/\/kubernetes\.io\/docs\/tasks\/configure-pod-container\/configure-liveness-readiness-startup-probes\/"/);
    assert.doesNotMatch(html, /\[官方探针指南\]\(https?:\/\//);
  } finally {
    await server.close();
  }
});
