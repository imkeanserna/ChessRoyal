import "@repo/ui/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@repo/ui/context/ThemeContext";
import { AuthProvider } from "@/context/AuthProvider";
import { Toaster } from "@repo/ui/components/ui/sonner";
import RecoilContextProvider from "@/components/Provider";
import { GithubRepository } from "@/components/ui/GithubRepository";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Royal",
  description: "Chess game for royal players",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.ico",
        sizes: "48x48",
      },
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: {
      url: "/favicon/apple-touch-icon.png",
      sizes: "180x180",
    },
    shortcut: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <RecoilContextProvider>
              {children}
              <Analytics />
              <GithubRepository
                className="z-50 fixed bottom-10 right-10"
                link="https://github.com/imkeanserna/chess-game"
              />
            </RecoilContextProvider>
          </AuthProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
