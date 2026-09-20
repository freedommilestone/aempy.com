"use client";

import { useEffect, useState } from "react";
import { deleteAsset, getAsset, putAsset } from "@/lib/assets";
import { uid } from "@/lib/projects";

type FileKind = "image" | "audio" | "video";

export function FileSlot({
  label,
  accept,
  kind,
  assetId,
  onAssigned,
}: {
  label: string;
  accept: string;
  kind: FileKind;
  assetId?: string;
  onAssigned: (nextId?: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    if (!assetId) {
      setUrl(null);
      return;
    }
    getAsset(assetId).then((blob) => {
      if (cancelled || !blob) return;
      revoked = URL.createObjectURL(blob);
      setUrl(revoked);
    });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [assetId]);

  return (
    <div className="file-slot">
      <div className="file-slot-head">
        <span className="kicker">{label}</span>
        {assetId ? (
          <button
            className="button ghost"
            type="button"
            onClick={async () => {
              if (assetId) await deleteAsset(assetId);
              onAssigned(undefined);
            }}
          >
            Remove
          </button>
        ) : null}
      </div>
      {url && kind === "image" ? (
        <img className="file-preview" src={url} alt="" />
      ) : null}
      {url && kind === "audio" ? (
        <audio className="file-preview-media" controls src={url} />
      ) : null}
      {url && kind === "video" ? (
        <video className="file-preview-media" controls src={url} />
      ) : null}
      <label className="file-input">
        <span>{assetId ? "Replace file" : "Upload file"}</span>
        <input
          type="file"
          accept={accept}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (file.size > 8 * 1024 * 1024) {
              setError("Keep files under 8 MB on this device.");
              return;
            }
            setError("");
            const nextId = uid();
            await putAsset(nextId, file);
            if (assetId) await deleteAsset(assetId);
            onAssigned(nextId);
          }}
        />
      </label>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
