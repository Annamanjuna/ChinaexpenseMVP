import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Расходы: поездка в Китай",
  description:
    "Общий учёт расходов для Anna, Kostya и Taya — CNY в VND",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Расходы: Китай",
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
    <html lang="ru">
      <body className="min-h-screen antialiased safe-bottom">
        {children}
      </body>
    </html>
  );
}
