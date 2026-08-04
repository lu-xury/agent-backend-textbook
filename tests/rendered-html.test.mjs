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

  assert.match(bundle, /把一段代码看成五层契约/);
  assert.match(bundle, /一段“看起来没问题”的模型调用为什么拖垮服务/);
  assert.match(bundle, /本章教材正文/);
  assert.match(bundle, /值、引用与所有权/);
  assert.match(bundle, /举个例子/);
  assert.match(bundle, /小练习/);
  assert.match(styles, /\.unit-example/);
  assert.match(styles, /font-size:18px/);
  assert.doesNotMatch(bundle, /机制推演/);
  assert.doesNotMatch(bundle, /逐步推理/);

  const cjkCharacters = bundle.match(/[\u3400-\u9fff]/g) ?? [];
  assert.ok(
    cjkCharacters.length >= 45_000,
    `bundle should still contain textbook seeds and prose templates; got ${cjkCharacters.length} CJK characters`,
  );
  assert.ok(
    cjkCharacters.length <= 80_000,
    `bundle should be shorter than the previous template-heavy edition; got ${cjkCharacters.length} CJK characters`,
  );
});
