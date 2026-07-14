# 全球动量雷达 Site(纯AI制作版)

用于好友分享的只读版股票与基金动量看板。页面支持桌面与手机浏览，包含策略总览、每日新闻、候选池和指标公式。

## 数据策略

- 评分区展示当前已验证的市场快照，不在公共页面暴露本地服务或重启能力。
- 新闻通过服务端 iFind MCP 获取，凭据只保存在托管环境变量中。
- D1 保存最近一次新闻结果，一小时内优先读取缓存，避免频繁请求数据服务。
- 公共访问者不能强制刷新，避免接口凭据被滥用。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

如需本地请求实时新闻，将 `.env.example` 复制为 `.env.local` 并填写：

```dotenv
IFIND_NEWS_URL=
IFIND_AUTHORIZATION=
```

## 校验与数据库

```bash
npm run lint
npm run build
npm run db:generate
```

数据库迁移位于 `drizzle/`，D1 绑定名为 `DB`。

## GitHub Pages 分享版

`public-github/` 是可直接公开托管的响应式只读页面。`.github/workflows/pages.yml` 每小时调用一次 iFind 新闻 MCP，优先保留上次发布的有效快照，再部署到 GitHub Pages。

iFind 配置必须保存为仓库 Secrets：

- `IFIND_NEWS_URL`
- `IFIND_AUTHORIZATION`

任何密钥都不应写入 `public-github/` 或 Git 历史。
