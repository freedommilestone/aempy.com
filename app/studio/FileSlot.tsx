"use client";

import { useEffect, useState } from "react";
import { deleteAsset, getAsset, putAsset } from "@/lib/assets";
import { uid } from "@/lib/projects";

type FileKind = "image" | "audio" | "video" | "file";

export const FILE_LIMITS = {
  image: 20 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
  video: 80 * 1024 * 1024,
  file: 20 * 1024 * 1024,
};

export function FileSlot({
  label,
  accept,
  kind,
  assetId,
  multiple = false,
  maxBytes,
  onAssigned,
  onAssignedMany,
}: {
  label: string;
  accept: string;
  kind: FileKind;
  assetId?: string;
  multiple?: boolean;
  maxBytes?: number;
  onAssigned: (nextId?: string) => void;
  onAssignedMany?: (ids: { id: string; name: string }[]) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const limit = maxBytes ?? FILE_LIMITS[kind];

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
      {url && kind === "file" ? (
        <a className="file-link" href={url} target="_blank" rel="noreferrer">
          Open uploaded file
        </a>
      ) : null}
      <label className="file-input">
        <span>
          {multiple
            ? "Upload files"
            : assetId
              ? "Replace file"
              : "Upload file"}
        </span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          aria-label={label}
          onChange={async (event) => {
            const list = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (list.length === 0) return;
            const tooBig = list.find((file) => file.size > limit);
            if (tooBig) {
              const mb = Math.round(limit / (1024 * 1024));
              setError(`Keep files under ${mb} MB on this device.`);
              return;
            }
            setError("");
            const saved: { id: string; name: string }[] = [];
            for (const file of list) {
              const nextId = uid();
              await putAsset(nextId, file);
              saved.push({ id: nextId, name: file.name });
            }
            if (multiple && onAssignedMany) {
              onAssignedMany(saved);
              return;
            }
            if (assetId) await deleteAsset(assetId);
            onAssigned(saved[0]?.id);
          }}
        />
      </label>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
