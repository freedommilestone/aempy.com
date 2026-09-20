import type { Metadata } from "next";
import { StudioShell } from "./StudioShell";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio — aempy",
  description:
    "Track each YouTube video from idea to publish: titles, thumbnails, storyboards, scene images, clips, voice over, sound, music, description, and upload checklist.",
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
