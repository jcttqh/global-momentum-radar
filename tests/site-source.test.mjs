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

test("loads the GitHub Pages ranking from the local exported snapshot", async () => {
  const [app, market] = await Promise.all([
    readFile(new URL("public-github/app.js", root), "utf8"),
    readFile(new URL("public-github/data/market.json", root), "utf8"),
  ]);
  const payload = JSON.parse(market);
  assert.match(app, /data\/market\.json/);
  assert.equal(payload.market, "cn");
  assert.equal(payload.preset, "balanced");
  assert.equal(payload.items.length, 11);
  assert.equal(payload.schemaVersion, 2);
  assert.ok(payload.snapshots["cn:balanced"]);
  assert.ok(payload.snapshots["hk:balanced"]);
  assert.ok(payload.snapshots["us:balanced"]);
  assert.match(app, /data-snapshot-market/);
  assert.ok(payload.items.every((item) => "finalScore" in item && "v5FinalScore" in item));
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
