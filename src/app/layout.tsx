import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
// import { QueryProvider } from '@/components/providers/query-provider';
import { QueryProvider } from "../components/providers/query-provider";
import { VideoProvider } from "@/contexts/video-context";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
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
  title: "GenZ Memories - Preserve the Voice of Change",
  description:
    "A social platform for documenting and preserving Gen Z protest movements and social activism through video content.",
  keywords: [
    "GenZ",
    "protests",
    "activism",
    "social media",
    "video sharing",
    "movements",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          rootBox: "mx-auto",
        },
      }}
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
        >
          <QueryProvider>
            <VideoProvider>
              {children}
              <Toaster
                position="bottom-center"
                toastOptions={{
                  className: "bg-gray-800 text-white border border-gray-700",
                  duration: 4000,
                }}
              />
            </VideoProvider>
          </QueryProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
