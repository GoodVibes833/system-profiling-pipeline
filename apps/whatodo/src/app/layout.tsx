import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import OnboardingModal from "@/components/OnboardingModal";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "오늘 뭐하지? — 지금 주변 핫플 바로 찾기",
  description:
    "오늘 뭐할지 모르겠을 때! 현재 위치 기반으로 주변 맛집, 카페, 액티비티, 야경 스팟을 바로 찾아줘요.",
  keywords: ["오늘뭐하지", "주변맛집", "토론토", "핫플", "카페", "액티비티", "데이트코스", "주변관광"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} antialiased`}>
        <Navbar />
        <OnboardingModal />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
