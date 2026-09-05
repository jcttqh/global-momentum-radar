/* Shared, evidence-based research view for local and static publishing. */
(function (root) {
  const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const numeric = x => x != null && Number.isFinite(Number(x));
  const num = (x, d=1) => numeric(x) ? Number(x).toFixed(d) : "—";
  const url = x => { try { const u=new URL(x); return ["https:","http:"].includes(u.protocol)?u.href:"#"; } catch { return "#"; } };
  const pct = x => numeric(x) ? `${Number(x)>0?"+":""}${num(x)}%` : "—";
  function metric(item, days) {
    if(numeric(item[`return${days}d`])) return Number(item[`return${days}d`]);
    const s=item.series||[];
    return s.length>days && s[s.length-1-days]>0 ? (s.at(-1)/s[s.length-1-days]-1)*100 : null;
  }
  function analyze(snapshot, now=Date.now()) {
    const items=snapshot.items||[];
    const usable=items.filter(x=>numeric(metric(x,20)));
    const positive=usable.filter(x=>metric(x,20)>0).length;
    const breadth=usable.length ? positive/usable.length*100 : null;
    const dates=items.map(x=>x.priceDate).filter(Boolean).sort();
    const oldest=dates[0];
    const stale=!oldest || now-Date.parse(oldest+"T16:00:00+08:00")>5*86400000;
    const sorted=[...items].sort((a,b)=>Number(b.v5FinalScore||0)-Number(a.v5FinalScore||0));
    const groups={};
    sorted.slice(0,10).forEach(x=>{const key=x.sector||"未分类";groups[key]=(groups[key]||0)+1;});
    const concentration=Object.entries(groups).sort((a,b)=>b[1]-a[1])[0];
    return {items,usable,positive,breadth,oldest,stale,sorted,concentration};
  }
  function render(snapshot={}, news=[]) {
    const a=analyze(snapshot);
    if(!a.items.length)return '<p class="research-note">尚无行情快照，更新行情后显示判断依据。</p>';
    const freshNews=news.filter(x=>{const t=Date.parse(x.time);return Number.isFinite(t)&&Date.now()-t<31*86400000&&t<=Date.now()+86400000;});
    const policies=freshNews.filter(x=>x.category==="政策"||/央行|国务院|财政部|发改委|政策|降准|关税|利率/.test(x.title||""));
    const sectors=[...new Set(a.items.map(x=>x.sector||"未分类"))];
    const average=(field)=>{const xs=a.items.filter(x=>numeric(x[field]));return xs.length?xs.reduce((s,x)=>s+Number(x[field]),0)/xs.length:null;};
    const regime=a.breadth===null?"数据不足":a.breadth>=65?"趋势扩散":a.breadth<=35?"偏弱防守":"结构分化";
    const guidance=a.stale?"行情日期缺失或已有超过 5 个自然日未更新：先刷新数据，暂停方向性判断。":a.breadth>=65?"多数观察标的中期走强，可优先跟踪强势行业的回调承接；若上涨比例下降或放量下跌，应降低趋势延续预期。":a.breadth<=35?"多数观察标的中期偏弱，先观察下跌是否缩量、宽基能否企稳；单日反弹不足以确认反转。":"行情分化，优先比较同一行业的相对强弱；等待价格与量能共同改善，避免仅按排名追涨。";
    return `<section class="research-block"><div class="research-heading"><div><h2>行情判断台</h2><p>观察池统计 · 价格日期 ${esc(a.oldest||"未知")} · ${a.items.length} 个标的 / ${sectors.length} 个分类</p></div><strong>${a.stale?"需更新":regime}</strong></div>
      <div class="research-metrics"><article><span>20日上涨占比</span><b>${num(a.breadth)}%</b><small>${a.positive}/${a.usable.length} 个可计算标的，并非全市场涨跌家数</small></article><article><span>平均距20日高点回撤</span><b>${num(average("drawdownPct"))}%</b><small>越大表示近期承压越明显</small></article><article><span>V5前10集中方向</span><b>${esc(a.concentration?.[0]||"—")}</b><small>${a.concentration?.[1]||0} 个；同主题ETF可能高度重叠</small></article><article><span>近30日有效资讯</span><b>${freshNews.length}</b><small>其中政策线索 ${policies.length} 条，需核实原文</small></article></div>
      <div class="research-advice"><h3>观察建议：${a.stale?"先更新数据":regime}</h3><p>${guidance}</p><p>依据：20日上涨占比 ${num(a.breadth)}%，平均回撤 ${num(average("drawdownPct"))}%。这是规则生成的观察意见，不是收益预测。</p></div>
      <details><summary>信息接入与使用边界</summary><p>已接入日K线、1/5/20日涨跌、距高点回撤、成交量相对前5日均量、V4/V5评分，以及市场/政策/宏观/行业新闻。量比只在数据源提供成交量时显示。</p><p>ETF申赎份额、真实IOPV溢价、估值分位、融资余额尚未接入，不能据现有价格或量比推断净资金流入。现有V4溢价项使用价格代理，参考性有限；V5为池内相对百分位，扩池前后的分数不可直接比较。价格序列未复权，分红拆分可能影响涨跌。</p><p>来源：新浪/AKShare日K线；iFind资讯。ETF代码核对：<a href="https://english.sse.com.cn/access/via/eligible/" target="_blank" rel="noreferrer">上交所基金清单</a>。以下官方入口用于交叉核实，不表示已自动获取其全部数据。</p><div class="research-links"><a href="https://www.stats.gov.cn/sj/" target="_blank" rel="noreferrer">统计局 · PMI / CPI / 工业利润</a><a href="https://www.pbc.gov.cn/" target="_blank" rel="noreferrer">央行 · 利率 / 社融</a><a href="https://www.ndrc.gov.cn/" target="_blank" rel="noreferrer">发改委 · 产业 / 投资政策</a><a href="https://www.gov.cn/zhengce/" target="_blank" rel="noreferrer">国务院 · 政策原文</a></div></details>
      <h3>政策与宏观线索</h3><p class="research-note">核实发布机构、实施时间和适用范围，再观察相关行业价格是否确认；利好也可能已被定价。</p><div class="research-news">${freshNews.filter(x=>["政策","宏观","行业"].includes(x.category)||policies.includes(x)).slice(0,9).map(x=>`<article><small>${esc(x.category||"政策线索")} · ${esc(x.time)} · ${esc(x.source)}</small><h4><a href="${esc(url(x.url))}" target="_blank" rel="noreferrer">${esc(x.title)}</a></h4><p>${esc((x.summary||"").slice(0,220))}</p></article>`).join("")||'<p>暂无近期可验证的政策/宏观线索。点击“更新新闻”检索；数据不足时不生成政策利好判断。</p>'}</div>
      <div class="research-heading"><h3>前20候选 · 多维比较</h3><label>排序 <select data-research-sort><option value="v5FinalScore">V5 相对强度</option><option value="finalScore">V4 综合分</option><option value="return20d">20日涨幅</option></select></label><label>行业 <select data-research-sector><option value="">全部</option>${sectors.map(s=>`<option>${esc(s)}</option>`).join("")}</select></label></div>
      <p class="research-note">前20是观察名单，不是20个买入建议。V4保留前6入选规则；行业筛选可查看不在总榜前20的方向。港美股按现有可用池展示。</p><div class="research-table"></div><p class="research-note">通用研究辅助，未考虑你的持仓、期限和风险承受能力。政策线索与交易信号应分别验证。</p></section>`;
  }
  function table(snapshot, sort="v5FinalScore", sector="") {
    const items=[...(snapshot.items||[])].filter(x=>!sector||(x.sector||"未分类")===sector).sort((a,b)=>Number(sort==="return20d"?metric(b,20):b[sort]||0)-Number(sort==="return20d"?metric(a,20):a[sort]||0)).slice(0,20);
    return `<table><thead><tr>${["排名 / 标的","行业","V4 / V5","1日","5日","20日","回撤","量比¹","价格日期","观察条件"].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${items.map((x,i)=>{const stale=!x.priceDate||Date.now()-Date.parse(x.priceDate)>5*86400000;const note=stale?"先更新数据":metric(x,20)<0?"等待趋势修复":Number(x.drawdownPct)>8?"回撤偏大，等待企稳":Number(x.volumeRatio)>1.5&&metric(x,1)<0?"放量下跌，谨慎观察":"跟踪回调承接，避免追高";return `<tr><td>${i+1}. ${esc(x.name)}<small>${esc(x.symbol)}</small></td><td>${esc(x.sector||"未分类")}</td><td>${num(x.finalScore)} / ${num(x.v5FinalScore)}</td>${[1,5,20].map(d=>`<td class="${metric(x,d)>=0?"research-up":"research-down"}">${pct(metric(x,d))}</td>`).join("")}<td>${num(x.drawdownPct)}%</td><td>${num(x.volumeRatio,2)}</td><td>${esc(x.priceDate||"未知")}</td><td>${note}</td></tr>`;}).join("")}</tbody></table><small>¹ 当日成交量 / 此前5个交易日平均成交量；不等于资金净流入。缺失数据以 — 表示。</small>`;
  }
  function mount(element,snapshot,news) {
    if(!element)return;
    element.innerHTML=render(snapshot,news);
    const target=element.querySelector(".research-table");
    if(!target)return;
    const update=()=>{target.innerHTML=table(snapshot,element.querySelector("[data-research-sort]").value,element.querySelector("[data-research-sector]").value);};
    element.querySelectorAll("select").forEach(x=>x.addEventListener("change",update));update();
  }
  root.Research={mount,analyze,metric,table,render};
  if(typeof module!=="undefined")module.exports=root.Research;
})(globalThis);
