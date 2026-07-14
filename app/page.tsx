"use client";

import { useEffect, useState } from "react";

type Tab = "overview" | "news" | "pool" | "formula";
type Asset = { symbol:string; name:string; v4:number; v4Decision:string; v5:number; v5Decision:string; momentum:number; drawdown:number; strength:number };
type News = { title:string; summary:string; source:string; time:string; url:string; sentiment:string };

const assets: Asset[] = [
  {symbol:"512010",name:"医药 ETF",v4:86.6,v4Decision:"入选",v5:87.5,v5Decision:"入选",momentum:90,drawdown:90,strength:80},
  {symbol:"513130",name:"恒生科技 ETF",v4:77,v4Decision:"入选",v5:82,v5Decision:"入选",momentum:60,drawdown:100,strength:100},
  {symbol:"588000",name:"科创50 ETF",v4:70.7,v4Decision:"入选",v5:57,v5Decision:"入选",momentum:100,drawdown:40,strength:0},
  {symbol:"512880",name:"证券 ETF",v4:61.8,v4Decision:"入选",v5:63.5,v5Decision:"入选",momentum:80,drawdown:50,strength:50},
  {symbol:"513100",name:"纳指 ETF",v4:59.8,v4Decision:"入选",v5:60,v5Decision:"入选",momentum:30,drawdown:80,strength:90},
  {symbol:"159941",name:"纳指100 ETF",v4:58.5,v4Decision:"入选",v5:56.5,v5Decision:"入选",momentum:40,drawdown:70,strength:70},
  {symbol:"510300",name:"沪深300 ETF",v4:56.8,v4Decision:"淘汰",v5:55.5,v5Decision:"入选",momentum:50,drawdown:60,strength:60},
  {symbol:"510500",name:"中证500 ETF",v4:49.1,v4Decision:"淘汰",v5:45.5,v5Decision:"淘汰",momentum:70,drawdown:30,strength:20},
  {symbol:"159915",name:"创业板 ETF",v4:40.9,v4Decision:"淘汰",v5:14.5,v5Decision:"淘汰",momentum:20,drawdown:10,strength:10},
  {symbol:"512100",name:"中证1000 ETF",v4:38.6,v4Decision:"淘汰",v5:20.5,v5Decision:"淘汰",momentum:10,drawdown:20,strength:40},
  {symbol:"515790",name:"光伏 ETF",v4:21.9,v4Decision:"淘汰",v5:7.5,v5Decision:"淘汰",momentum:0,drawdown:0,strength:30},
];

const seedNews: News[] = [
  {title:"涨超2.5%，科创价值ETF华夏盘中上涨2.50%",summary:"科创价值指数成分股涨跌互现，ETF盘中活跃，近一个月累计表现受到市场关注。",source:"同花顺 iFind",time:"2026-07-14",url:"https://aigc.ylaigc.com/yly-boot/saas/common/previewConsultingById?id=6203427",sentiment:"中性"},
  {title:"科创创业ETF易方达融资净买入1531.76万元",summary:"杠杆资金连续流入，融资净买入规模居可比基金前列。",source:"同花顺 iFind",time:"2026-07-14",url:"https://aigc.ylaigc.com/yly-boot/saas/common/previewConsultingById?id=6203500",sentiment:"偏多"},
  {title:"午间收评：科创50指数调整，医药与油气逆势活跃",summary:"市场早间冲高回落，板块分化明显，半导体芯片股持续调整。",source:"华尔街见闻",time:"2026-07-14",url:"https://wallstreetcn.com/livenews/3133292",sentiment:"偏空"},
];

const tabs: {id:Tab; label:string}[] = [{id:"overview",label:"策略总览"},{id:"news",label:"每日新闻"},{id:"pool",label:"候选池"},{id:"formula",label:"指标公式"}];

function Badge({value}:{value:string}) { return <span className={`badge ${value === "入选" || value === "偏多" ? "good" : value === "淘汰" || value === "偏空" ? "bad" : ""}`}>{value}</span> }

export default function Home() {
  const [tab,setTab] = useState<Tab>("overview");
  const [news,setNews] = useState(seedNews);
  const [newsStatus,setNewsStatus] = useState("公开快照");

  useEffect(() => {
    fetch("/api/news?market=cn").then(r => r.json()).then(data => {
      if (data.items?.length) setNews(data.items);
      setNewsStatus(data.fromCache ? "一小时缓存" : "今日更新");
    }).catch(() => setNewsStatus("最近有效快照"));
  }, []);

  return <main>
    <header className="topbar">
      <button className="brand" onClick={()=>setTab("overview")}><span className="target">◎</span><b>全球动量雷达</b></button>
      <nav aria-label="主导航">{tabs.map(x=><button key={x.id} className={tab===x.id?"active":""} onClick={()=>setTab(x.id)}>{x.label}</button>)}</nav>
      <span className="share-state"><i/>公开只读版</span>
    </header>

    {tab === "overview" && <div className="grid">
      <section className="panel hero"><div><p className="eyebrow">WEEKLY MOMENTUM / 周度信号</p><h1>本周动量信号</h1><div className="counts"><strong>6</strong><span>V4 入选</span><em>·</em><strong>7</strong><span>V5 入选</span></div><p className="muted">V5 为三因子百分位实验版，55 分入选；每周三更新。</p></div><div className="radar"><span/><span/><span/><span/><b/></div></section>
      <section className="panel score-card"><p className="eyebrow">V4 / V5 PARALLEL</p><h2>双版本观察</h2><div className="big-score">87.5</div><p>V5 最高分 · 医药 ETF</p><div className="mini-factors"><span>动量 90</span><span>回撤 90</span><span>强度 80</span></div></section>
      <Ranking items={assets.slice(0,7)} />
      <section className="panel factors"><Factor name="动量" value={90}/><Factor name="回撤" value={90}/><Factor name="强度" value={80}/></section>
    </div>}

    {tab === "news" && <div className="news-layout"><section className="panel page-head"><div><p className="eyebrow">DAILY MARKET BRIEF</p><h1>今日新闻雷达</h1><p className="muted">优先显示当天资讯，每条均标注发布时间并链接原文。</p></div><div className="news-stat"><strong>{news.length}</strong><span>条重点资讯</span><small>{newsStatus}</small></div></section><section className="panel feed">{news.map((item,i)=><article className="news-item" key={`${item.title}-${i}`}><span className="num">{String(i+1).padStart(2,"0")}</span><div><div className="meta"><Badge value={item.sentiment}/><span>{item.source}</span><time>发布时间：{item.time || "未提供"}</time></div><h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2><p>{item.summary}</p></div><a className="out" href={item.url} target="_blank" rel="noreferrer">↗</a></article>)}</section></div>}

    {tab === "pool" && <div className="stack"><section className="panel page-head"><div><p className="eyebrow">CANDIDATE ARCHIVE</p><h1>候选池</h1><p className="muted">查看 V4 与实验版 V5 的同期差异。</p></div><div className="news-stat"><strong>11</strong><span>观察标的</span><small>最近有效快照</small></div></section><Ranking items={assets}/></div>}

    {tab === "formula" && <div className="stack"><section className="panel page-head"><div><p className="eyebrow">SCORING MODEL</p><h1>评分机制</h1><p className="muted">V4 正式对照，V5 实验观察。评分仅用于研究，不构成投资建议。</p></div><div className="news-stat accent"><strong>55</strong><span>V5 入选线</span><small>实验版</small></div></section><section className="formula-grid"><Formula n="01" title="动量" text="最近 5 个交易日的 20 日收益率均值，转换为候选池内百分位。" weight="45%"/><Formula n="02" title="回撤" text="最近 5 个交易日距 20 日高点回撤均值，回撤越小得分越高。" weight="30%"/><Formula n="03" title="强度" text="10 日趋势相对 20 日趋势的增强程度，经 5 日平滑后计算百分位。" weight="25%"/></section></div>}

    <footer>数据快照：2026-07-14 · 同花顺 iFind · V5 尚未经过实盘验证</footer>
  </main>
}

function Ranking({items}:{items:Asset[]}) { return <section className="panel ranking"><div className="section-title"><div><p className="eyebrow">RANKING</p><h2>候选池排名</h2></div><span>V4 / V5</span></div><div className="table"><div className="tr head"><span>代码 / 名称</span><span>V4</span><span>状态</span><span>V5</span><span>状态</span></div>{items.map(x=><div className="tr" key={x.symbol}><span><code>{x.symbol}</code><b>{x.name}</b></span><strong>{x.v4.toFixed(1)}</strong><Badge value={x.v4Decision}/><strong className={x.v5>=55?"green":"red"}>{x.v5.toFixed(1)}</strong><Badge value={x.v5Decision}/></div>)}</div></section> }
function Factor({name,value}:{name:string;value:number}) { return <article><span>{name}</span><strong>{value}</strong><div className="bar"><i style={{width:`${value}%`}}/></div><small>V5 百分位</small></article> }
function Formula({n,title,text,weight}:{n:string;title:string;text:string;weight:string}) { return <article className="panel formula"><span>{n}</span><b>{weight}</b><h2>{title}</h2><p>{text}</p></article> }
