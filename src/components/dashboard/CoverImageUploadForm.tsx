import { useState } from "react";
import { updateEventFn } from "../../server/functions/events";

export function CoverImageUploadForm({
  eventId,
  currentUrl,
  onUploaded,
}: {
  eventId: string;
  currentUrl: string | null;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      alert("Gambar sampul harus berupa JPEG atau PNG");
      return;
    }
    setUploading(true);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        body: JSON.stringify({
          kind: "cover-image",
          eventId,
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
      await updateEventFn({ data: { eventId, coverImageKey: key } });
      onUploaded();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {currentUrl ? (
        <img
          src={currentUrl}
          alt=""
          className="w-32 aspect-square object-cover rounded-(--radius-md) bg-(--color-surface-variant)"
        />
      ) : (
        <p className="text-sm text-(--color-on-surface-variant)">
          Belum ada gambar.
        </p>
      )}
      <label className="rounded border border-(--color-primary) text-(--color-primary) px-4 py-2 text-sm font-medium cursor-pointer inline-block w-fit transition hover:bg-(--color-primary-container)/40">
        {uploading ? "Mengunggah..." : "Unggah Gambar Sampul"}
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
