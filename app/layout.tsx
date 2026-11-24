import type { Metadata, Viewport } from "next";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monet Canvas: a pop-up book",
  description: "Monet's garden at Vétheuil as a pop-up book: a remix of unfold by Dakshie. Open a room and step into the painting.",
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
