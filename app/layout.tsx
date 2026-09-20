import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aempy — Create the next iconic YouTube story",
  description:
    "aempy helps YouTube creators track the pieces of each video they actually use: titles, thumbnails, boards, stills, clips, sound, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
