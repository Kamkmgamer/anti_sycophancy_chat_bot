import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TruthBot",
  description: "An AI assistant that speaks truth without flattery",
  icons: [{ rel: "icon", url: "/icon.png" }],
  openGraph: {
    title: "TruthBot",
    description:
      "An AI assistant that speaks truth without flattery. No more yes-men.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark`}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
