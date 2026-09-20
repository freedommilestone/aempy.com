import type { Metadata } from "next";
import Link from "next/link";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio — aempy",
  description:
    "Track each YouTube video from idea to publish: title, thumbnail, script, voice over, storyboard, images, clips, sound, music, description, and upload checklist.",
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="studio-body">
      <header className="studio-header">
        <Link className="logo" href="/">
          aempy
        </Link>
        <nav className="studio-nav" aria-label="Studio">
          <Link href="/">Home</Link>
          <Link href="/studio" aria-current="page">
            Studio
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
