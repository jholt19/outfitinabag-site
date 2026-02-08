import type { Metadata } from "next";
import "./globals.css";
import Layout from "./components/Layout";

export const metadata: Metadata = {
  title: "OutfitInABag",
  description: "Complete outfits for every occasion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{}}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
