import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Layout from "./components/Layout";

export const metadata: Metadata = {
  title: "OutfitInABag",
  description: "Complete outfits for every occasion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Layout>{children}</Layout>
        </body>
      </html>
    </ClerkProvider>
  );
}