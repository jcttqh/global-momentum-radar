import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the five public reading views", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  for (const label of ["策略总览", "每日新闻", "候选池", "研报中心", "指标公式"]) {
    assert.match(page, new RegExp(label));
  }
  assert.match(page, /公开只读版/);
});

test("publishes every fund and stock report", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  for (const symbol of ["001475", "011609", "003096", "161032", "002008", "300502", "300750", "601985", "601088"]) {
    assert.match(page, new RegExp(symbol));
  }
});

test("keeps iFind credentials on the server", async () => {
  const [page, route] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/api/news/route.ts", root), "utf8"),
  ]);
  assert.doesNotMatch(page, /IFIND_AUTHORIZATION|IFIND_NEWS_URL/);
  assert.match(route, /IFIND_AUTHORIZATION/);
  assert.match(route, /news_cache/);
});
