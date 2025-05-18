// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "react-hot-toast";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "DishWish - AI Recipe Generator",
//   description: "Generate amazing recipes with AI, your AI kitchen companion.",
// };

// export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} antialiased`}>
//           {children}
//           <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer"; // Import Footer

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
      <body className={`${inter.className} flex flex-col min-h-full`}> {/* Ensure body can grow */}
        <ClientBody>
          <div className="flex-grow"> {/* Allow children to take available space */}
            <Navbar />
            <main>{children}</main>
          </div>
          <Footer /> {/* Add Footer here */}
        </ClientBody>
      </body>
    </html>
  );
}