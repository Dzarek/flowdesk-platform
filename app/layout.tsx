import type { Metadata } from "next";
import { Geist, Manrope, Inter, Quicksand } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { Doppio_One } from "next/font/google";
import { Toaster } from "react-hot-toast";

export const doppioOne = Doppio_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-doppio-one", // opcjonalna zmienna CSS
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "LifeHub - Domowe Centrum Operacji",
  description: "Twoje Domowe Centrum Operacji",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${doppioOne.variable} ${quicksand.variable} ${inter.variable} ${manrope.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-center"
          containerStyle={{
            top: 100,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#222",
              color: "#fff",
              border: "1px solid #4c7868",
            },
            success: {
              iconTheme: {
                primary: "#4c7868",
                secondary: "#222",
              },
            },
            error: {
              iconTheme: {
                primary: "#fff",
                secondary: "#222",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
