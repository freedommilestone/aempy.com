import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aempy — Create the next iconic YouTube story",
  description:
    "aempy helps YouTube creators track each video from idea to publish: titles, thumbnails, storyboards, scene images, clips, voice over, sound, music, and description.",
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
