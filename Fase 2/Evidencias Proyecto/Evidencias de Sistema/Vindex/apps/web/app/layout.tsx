import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import SecondaryNavbar from "@/components/SecondaryNavbar";
import Footer from "@/components/Footer";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vindex | Marketplace de Chile",
  description:
    "Compra, vende y puja en vivo con custodia de pagos y validación OTP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable, outfitHeading.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Navbar />
        <SecondaryNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
