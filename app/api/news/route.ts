import { env } from "cloudflare:workers";

type NewsItem = {title:string;summary:string;source:string;time:string;url:string;sentiment:string};
type RuntimeEnv = {DB:D1Database;IFIND_NEWS_URL?:string;IFIND_AUTHORIZATION?:string};
const runtime = env as unknown as RuntimeEnv;

async function ensureTable() {
  await runtime.DB.prepare("CREATE TABLE IF NOT EXISTS news_cache (market TEXT PRIMARY KEY, updated_at TEXT NOT NULL, payload TEXT NOT NULL)").run();
}

function sentiment(text:string) { const good=["上涨","流入","增持","利好","走强"].filter(x=>text.includes(x)).length; const bad=["下跌","流出","减持","风险","调整"].filter(x=>text.includes(x)).length; return good>bad?"偏多":bad>good?"偏空":"中性"; }
function parseMcpText(text:string) {
  const jsonText = text.split("\n").find(line=>line.startsWith("data:"))?.slice(5).trim() || text;
  const outer = JSON.parse(jsonText);
  const toolText = outer?.result?.content?.[0]?.text || "{}";
  const decoded = JSON.parse(toolText);
  const rows = JSON.parse(decoded?.data?.data || "[]");
  return rows.filter((x:Record<string,string>)=>x["资讯标题"]).slice(0,5).map((x:Record<string,string>):NewsItem=>({title:x["资讯标题"],summary:x["资讯内容"]||"暂无摘要",source:x["来源"]||"同花顺 iFind",time:x["日期"]||x["发布时间"]||"未提供",url:x.URL||x.url||"",sentiment:sentiment(`${x["资讯标题"]} ${x["资讯内容"]}`)}));
}

export async function GET(request:Request) {
  const market = new URL(request.url).searchParams.get("market") || "cn";
  await ensureTable();
  const cached = await runtime.DB.prepare("SELECT updated_at, payload FROM news_cache WHERE market = ?").bind(market).first<{updated_at:string;payload:string}>();
  if (cached && Date.now()-Date.parse(cached.updated_at)<3600000) return Response.json({items:JSON.parse(cached.payload),updatedAt:cached.updated_at,fromCache:true});
  if (!runtime.IFIND_NEWS_URL || !runtime.IFIND_AUTHORIZATION) return Response.json({items:cached?JSON.parse(cached.payload):[],updatedAt:cached?.updated_at,fromCache:true});
  try {
    const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date());
    const query = market==="us"?"美股 Apple Microsoft NVIDIA Nasdaq":market==="hk"?"港股 恒生科技 腾讯 阿里巴巴 美团":"A股 ETF 沪深300 创业板 科创50";
    const response = await fetch(runtime.IFIND_NEWS_URL,{method:"POST",headers:{Authorization:runtime.IFIND_AUTHORIZATION,"Content-Type":"application/json",Accept:"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"search_news",arguments:{query,time_start:today,time_end:today,size:8}}})});
    const items = parseMcpText(await response.text());
    if (!items.length) throw new Error("No current news");
    const updatedAt = new Date().toISOString();
    await runtime.DB.prepare("INSERT INTO news_cache (market, updated_at, payload) VALUES (?, ?, ?) ON CONFLICT(market) DO UPDATE SET updated_at=excluded.updated_at,payload=excluded.payload").bind(market,updatedAt,JSON.stringify(items)).run();
    return Response.json({items,updatedAt,fromCache:false});
  } catch {
    return Response.json({items:cached?JSON.parse(cached.payload):[],updatedAt:cached?.updated_at,fromCache:true});
  }
}
