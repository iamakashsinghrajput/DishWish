import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DishWish AI",
  description: "Craft your next delicious meal with AI precision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full`}>
        <ClientBody>
          <div className="flex-grow"> 
            <Navbar />
            <main>{children}</main>
          </div>
          <Footer />
          <Analytics />
        </ClientBody>
      </body>
    </html>
  );
}