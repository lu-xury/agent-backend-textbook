import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const bookRoot = new URL("../app/book/", import.meta.url);

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
  }
  assert.ok(totalCjk >= 95_000, `expected a textbook-scale manuscript, got ${totalCjk} CJK characters`);
});
