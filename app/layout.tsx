import type { Metadata, Viewport } from "next";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "unfold — a journal house",
  description: "A hand-drawn pop-up journal: a book of rooms that fold open.",
};

export const viewport: Viewport = {
  themeColor: "#ecebe7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
