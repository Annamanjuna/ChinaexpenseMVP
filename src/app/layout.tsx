import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "China Trip Expenses",
  description:
    "Shared travel expense tracker for Anna, Husband & Taya — CNY to VND",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trip Expenses",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased safe-bottom">
        {children}
      </body>
    </html>
  );
}
