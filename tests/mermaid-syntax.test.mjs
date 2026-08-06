import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const bookRoot = new URL("../app/book/", import.meta.url);

test("parses every textbook diagram with Mermaid strict mode", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;

  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

  const files = (await readdir(bookRoot)).filter((file) => /^chapter\d\d\.md$/.test(file)).sort();
  let count = 0;
  for (const file of files) {
    const manuscript = await readFile(new URL(file, bookRoot), "utf8");
    const diagrams = manuscript.matchAll(/^```mermaid\n([\s\S]*?)^```$/gm);
    for (const [index, match] of Array.from(diagrams).entries()) {
      try {
        await mermaid.parse(match[1]);
      } catch (error) {
        assert.fail(`${file} diagram ${index + 1} is invalid: ${error}`);
      }
      count += 1;
    }
  }

  assert.equal(count, 11, "the reviewed textbook should contain exactly eleven consequential diagrams");
  dom.window.close();
});
