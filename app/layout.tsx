import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "游戏公司对账系统",
  description: "内部对账管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
