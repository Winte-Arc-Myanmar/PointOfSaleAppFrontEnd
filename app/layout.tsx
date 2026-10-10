import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/presentation/providers/SessionProvider";
import { QueryProvider } from "@/presentation/providers/QueryProvider";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";
import { ToastProvider } from "@/presentation/providers/ToastProvider";
import { ConfirmProvider } from "@/presentation/hooks/useConfirm";
import { LanguageProvider } from "@/presentation/providers/LanguageProvider";
import { CurrencyProvider } from "@/presentation/providers/CurrencyProvider";
import { AppShell } from "@/presentation/components/layout/Shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkits POS",
  description: "Linkits point of sale",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/tab-icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <QueryProvider>
                <CurrencyProvider>
                  <ToastProvider>
                    <ConfirmProvider>
                      <AppShell>{children}</AppShell>
                    </ConfirmProvider>
                  </ToastProvider>
                </CurrencyProvider>
              </QueryProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
