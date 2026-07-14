import { writeFile } from "node:fs/promises";

const output = new URL("../public-github/data/news.json", import.meta.url);
const url = process.env.IFIND_NEWS_URL;
const authorization = process.env.IFIND_AUTHORIZATION;
if (!url || !authorization) throw new Error("Missing iFind news secrets");

const dateParts = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
const part = type => dateParts.find(item => item.type === type)?.value;
const today = `${part("year")}-${part("month")}-${part("day")}`;
const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: authorization, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: "search_news", arguments: { query: "A股 ETF 沪深300 创业板 科创50", time_start: today, time_end: today, size: 10 } } }),
});
if (!response.ok) throw new Error(`iFind returned ${response.status}`);

const raw = await response.text();
const payloads = raw.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trim());
const outer = JSON.parse(payloads.at(-1) || raw);
const toolText = outer?.result?.content?.find(item => item.type === "text")?.text || "{}";
const decoded = JSON.parse(toolText);
const rowsValue = decoded?.data?.data ?? decoded?.data ?? [];
const rows = typeof rowsValue === "string" ? JSON.parse(rowsValue) : rowsValue;
const scoreSentiment = text => {
  const positive = ["上涨","流入","增持","利好","走强"].filter(word => text.includes(word)).length;
  const negative = ["下跌","流出","减持","风险","调整"].filter(word => text.includes(word)).length;
  return positive > negative ? "偏多" : negative > positive ? "偏空" : "中性";
};
const items = rows.filter(row => row["资讯标题"]).slice(0, 8).map(row => ({
  title: row["资讯标题"],
  summary: row["资讯内容"] || "暂无摘要",
  source: row["来源"] || "同花顺 iFind",
  time: row["发布时间"] || row["日期"] || today,
  url: row.URL || row.url || "",
  sentiment: scoreSentiment(`${row["资讯标题"]} ${row["资讯内容"] || ""}`),
}));
if (!items.length) {
  console.log("No same-day news; keeping the last valid snapshot.");
  process.exit(0);
}
await writeFile(output, `${JSON.stringify({ updatedAt: new Date().toISOString(), status: "今日定时更新", items }, null, 2)}\n`);
console.log(`Saved ${items.length} news items for ${today}.`);
