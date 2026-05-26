import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NCTM CellLog",
  description: "NCTM 학습 기록 시스템",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CellLog" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0A0A0F' }}>
        {children}
      </body>
    </html>
  );
}