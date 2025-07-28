import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap', 

});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: 'swap', 

});

export const metadata: Metadata = {
  title: "Pod Voting dApp",
  description: "Decentralized voting interface powered by blockchain",
  icons: {
    icon: '/images/pod_favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceMono.variable} antialiased`}
        style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}