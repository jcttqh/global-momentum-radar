import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "全球动量雷达",
  description: "A股、港股与美股的动量评分、候选池、每日市场新闻和基金股票研报。",
  openGraph: {
    title: "全球动量雷达",
    description: "每周动量评分、候选池、每日市场新闻与基金股票研报",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og-momentum-radar.png", width: 1732, height: 909, alt: "全球动量雷达" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "全球动量雷达",
    description: "每周动量评分、候选池、每日市场新闻与基金股票研报",
    images: ["/og-momentum-radar.png"],
  },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
