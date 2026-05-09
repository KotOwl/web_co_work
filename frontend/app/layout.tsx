import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Finance Tracker - Особисті фінанси",
  description: "Ваш персональний трекер витрат та доходів",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={`${inter.className} animate-fade-in`}>{children}</body>
    </html>
  );
}
