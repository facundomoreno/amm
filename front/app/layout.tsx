import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutUseClient from "@/components/LayoutUseClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tokens Market",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutUseClient>{children}</LayoutUseClient>
      </body>
    </html>
  );
}
