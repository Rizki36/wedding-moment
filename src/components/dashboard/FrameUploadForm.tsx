import { nanoid } from "nanoid";
import { useState } from "react";
import { createFrameFn } from "../../server/functions/frames";

export function FrameUploadForm({
  eventId,
  onUploaded,
}: {
  eventId: string;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      alert("Bingkai harus berupa PNG transparan");
      return;
    }
    setUploading(true);
    try {
      const frameId = nanoid(10);
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        body: JSON.stringify({
          kind: "frame",
          eventId,
          frameId,
          contentType: file.type,
        }),
      });
      if (!presignRes.ok) {
        alert("Gagal mendapatkan izin unggah.");
        return;
      }
      const { url, key } = await presignRes.json();
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await createFrameFn({
        data: { eventId, name: file.name, objectKey: key },
      });
      onUploaded();
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="rounded border border-(--color-primary) text-(--color-primary) px-4 py-2 text-sm font-medium cursor-pointer inline-block transition hover:bg-(--color-primary-container)/40">
      {uploading ? "Mengunggah..." : "Unggah Bingkai (PNG)"}
      <input
        type="file"
        accept="image/png"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}
