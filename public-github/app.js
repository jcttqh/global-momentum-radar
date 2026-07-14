const assets=[
  ["512010","医药 ETF",86.6,"入选",87.5,"入选",90,90,80],
  ["513130","恒生科技 ETF",77,"入选",82,"入选",60,100,100],
  ["588000","科创50 ETF",70.7,"入选",57,"入选",100,40,0],
  ["512880","证券 ETF",61.8,"入选",63.5,"入选",80,50,50],
  ["513100","纳指 ETF",59.8,"入选",60,"入选",30,80,90],
  ["159941","纳指100 ETF",58.5,"入选",56.5,"入选",40,70,70],
  ["510300","沪深300 ETF",56.8,"淘汰",55.5,"入选",50,60,60],
  ["510500","中证500 ETF",49.1,"淘汰",45.5,"淘汰",70,30,20],
  ["159915","创业板 ETF",40.9,"淘汰",14.5,"淘汰",20,10,10],
  ["512100","中证1000 ETF",38.6,"淘汰",20.5,"淘汰",10,20,40],
  ["515790","光伏 ETF",21.9,"淘汰",7.5,"淘汰",0,0,30]
];
const fallbackNews=[
  {title:"涨超2.5%，科创价值ETF华夏盘中上涨2.50%",summary:"科创价值指数成分股涨跌互现，ETF盘中活跃，近一个月累计表现受到市场关注。",source:"同花顺 iFind",time:"2026-07-14",url:"https://aigc.ylaigc.com/yly-boot/saas/common/previewConsultingById?id=6203427",sentiment:"中性"},
  {title:"科创创业ETF易方达融资净买入1531.76万元",summary:"杠杆资金连续流入，融资净买入规模居可比基金前列。",source:"同花顺 iFind",time:"2026-07-14",url:"https://aigc.ylaigc.com/yly-boot/saas/common/previewConsultingById?id=6203500",sentiment:"偏多"},
  {title:"午间收评：科创50指数调整，医药与油气逆势活跃",summary:"市场早间冲高回落，板块分化明显，半导体芯片股持续调整。",source:"华尔街见闻",time:"2026-07-14",url:"https://wallstreetcn.com/livenews/3133292",sentiment:"偏空"}
];
const reports=[
  ["001475","易方达国防军工混合A","基金研报","国防军工","./reports/funds/001475-20260715.html"],
  ["011609","易方达上证科创50ETF联接C","基金研报","科创50","./reports/funds/011609-20260715.html"],
  ["003096","中欧医疗健康混合C","基金研报","医疗健康","./reports/funds/003096-20260715.html"],
  ["161032","富国中证煤炭指数A","基金研报","煤炭指数","./reports/funds/161032-20260715.html"],
  ["002008","大族激光","股票研报","激光设备","./reports/stocks/002008-20260715.html"],
  ["300502","新易盛","股票研报","光通信","./reports/stocks/300502-20260715.html"],
  ["300750","宁德时代","股票研报","动力电池","./reports/stocks/300750-20260715.html"],
  ["601985","中国核电","股票研报","核电运营","./reports/stocks/601985-20260715.html"],
  ["601088","中国神华","股票研报","煤炭能源","./reports/stocks/china-shenhua-601088-20260715.html"]
];
let news=fallbackNews,newsMeta={updatedAt:"2026-07-14",status:"最近有效快照"};
const content=document.querySelector("#content");
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const safeUrl=value=>{try{const parsed=new URL(value);return ["http:","https:"].includes(parsed.protocol)?parsed.href:"#"}catch{return "#"}};
const badge=v=>`<span class="badge ${v==="入选"||v==="偏多"?"good":v==="淘汰"||v==="偏空"?"bad":""}">${esc(v)}</span>`;
const ranking=items=>`<section class="panel ranking"><div class="section-title"><div><p class="eyebrow">RANKING</p><h2>候选池排名</h2></div><span>V4 / V5</span></div><div class="table"><div class="tr head"><span>代码 / 名称</span><span>V4</span><span>状态</span><span>V5</span><span>状态</span></div>${items.map(x=>`<div class="tr"><span><code>${x[0]}</code><b>${x[1]}</b></span><strong>${x[2].toFixed(1)}</strong>${badge(x[3])}<strong class="${x[4]>=55?"green":"red"}">${x[4].toFixed(1)}</strong>${badge(x[5])}</div>`).join("")}</div></section>`;
const factor=(name,value)=>`<article><span>${name}</span><strong>${value}</strong><div class="bar"><i style="width:${value}%"></i></div><small>V5 百分位</small></article>`;
const reportGroup=(title,label,items)=>`<section class="panel report-section"><div class="section-title"><div><p class="eyebrow">${label}</p><h2>${title}</h2></div><span>更新于 2026-07-15</span></div><div class="report-grid">${items.map(x=>`<a class="report-card" href="${x[4]}" target="_blank" rel="noreferrer"><div class="report-card-top"><code>${x[0]}</code><span>${x[3]}</span></div><h3>${x[1]}</h3><p>${x[2]} · 2026-07-15</p><b>阅读全文 <i>↗</i></b></a>`).join("")}</div></section>`;
const renderers={
  overview:()=>`<div class="grid"><section class="panel hero"><div><p class="eyebrow">WEEKLY MOMENTUM / 周度信号</p><h1>本周动量信号</h1><div class="counts"><strong>6</strong><span>V4 入选</span><em>·</em><strong>7</strong><span>V5 入选</span></div><p class="muted">V5 为三因子百分位实验版，55 分入选；每周三更新。</p></div><div class="radar"><span></span><span></span><span></span><span></span><b></b></div></section><section class="panel score-card"><p class="eyebrow">V4 / V5 PARALLEL</p><h2>双版本观察</h2><div class="big-score">87.5</div><p>V5 最高分 · 医药 ETF</p><div class="mini-factors"><span>动量 90</span><span>回撤 90</span><span>强度 80</span></div></section>${ranking(assets.slice(0,7))}<section class="panel factors">${factor("动量",90)}${factor("回撤",90)}${factor("强度",80)}</section></div>`,
  news:()=>`<div class="news-layout"><section class="panel page-head"><div><p class="eyebrow">DAILY MARKET BRIEF</p><h1>今日新闻雷达</h1><p class="muted">优先显示当天资讯，每条均标注发布时间并链接原文。</p></div><div class="news-stat"><strong>${news.length}</strong><span>条重点资讯</span><small>${esc(newsMeta.status)}</small></div></section><section class="panel feed">${news.map((x,i)=>`<article class="news-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><div class="meta">${badge(x.sentiment)}<span>${esc(x.source||"同花顺 iFind")}</span><time>发布时间：${esc(x.time||"未提供")}</time></div><h2><a href="${safeUrl(x.url)}" target="_blank" rel="noreferrer">${esc(x.title)}</a></h2><p>${esc(x.summary||"暂无摘要")}</p></div><a class="out" href="${safeUrl(x.url)}" target="_blank" rel="noreferrer">↗</a></article>`).join("")}</section></div>`,
  pool:()=>`<div class="stack"><section class="panel page-head"><div><p class="eyebrow">CANDIDATE ARCHIVE</p><h1>候选池</h1><p class="muted">查看 V4 与实验版 V5 的同期差异。</p></div><div class="news-stat"><strong>11</strong><span>观察标的</span><small>最近有效快照</small></div></section>${ranking(assets)}</div>`,
  reports:()=>`<div class="stack"><section class="panel page-head report-head"><div><p class="eyebrow">RESEARCH LIBRARY</p><h1>研报中心</h1><p class="muted">基金与股票研究简报统一归档，点击卡片可在新窗口阅读全文。</p></div><div class="report-stats"><span><strong>9</strong><small>份研报</small></span><span><strong>4</strong><small>只基金</small></span><span><strong>5</strong><small>只股票</small></span></div></section>${reportGroup("基金研报","FUNDS / 4",reports.filter(x=>x[2]==="基金研报"))}${reportGroup("股票研报","STOCKS / 5",reports.filter(x=>x[2]==="股票研报"))}</div>`,
  formula:()=>`<div class="stack"><section class="panel page-head"><div><p class="eyebrow">SCORING MODEL</p><h1>评分机制</h1><p class="muted">V4 正式对照，V5 实验观察。评分仅用于研究，不构成投资建议。</p></div><div class="news-stat accent"><strong>55</strong><span>V5 入选线</span><small>实验版</small></div></section><section class="formula-grid">${[["01","动量","最近 5 个交易日的 20 日收益率均值，转换为候选池内百分位。","45%"],["02","回撤","最近 5 个交易日距 20 日高点回撤均值，回撤越小得分越高。","30%"],["03","强度","10 日趋势相对 20 日趋势的增强程度，经 5 日平滑后计算百分位。","25%"]].map(x=>`<article class="panel formula"><span>${x[0]}</span><b>${x[3]}</b><h2>${x[1]}</h2><p>${x[2]}</p></article>`).join("")}</section></div>`
};
function show(tab){document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));content.innerHTML=renderers[tab]();window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll("[data-tab]").forEach(x=>x.addEventListener("click",()=>show(x.dataset.tab)));
fetch("./data/news.json",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(data.items?.length)news=data.items;newsMeta={updatedAt:data.updatedAt,status:data.status||"定时更新"};if(document.querySelector('[data-tab="news"].active'))show("news");}).catch(()=>{});
show("overview");
