import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aempy — Create the next iconic YouTube story",
  description:
    "aempy helps YouTube creators write the next iconic story with professional prompts that generate scene images and video clips.",
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
