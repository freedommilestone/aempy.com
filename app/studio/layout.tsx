import type { Metadata } from "next";
import { StudioShell } from "./StudioShell";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio — aempy",
  description:
    "Add the pieces each YouTube video needs — titles, thumbnails, scripts, stills — without a forced pipeline.",
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="studio-body">
      <StudioShell>{children}</StudioShell>
    </div>
  );
}
