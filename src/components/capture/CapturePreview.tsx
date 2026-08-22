import { useEffect, useState } from "react";
import { Button } from "#/components/ui/Button";

export function CapturePreview({
  photoBlob,
  audioUrl,
  onRetakePhoto,
  onReRecordAudio,
  onDownloadPhoto,
  onSubmit,
}: {
  photoBlob: Blob;
  audioUrl: string | null;
  onRetakePhoto: () => void;
  onReRecordAudio: () => void;
  onDownloadPhoto: () => void;
  onSubmit: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Re-derive the object URL whenever a new composited photo comes in (e.g.
  // after a retake), and revoke the previous one so it doesn't leak.
  useEffect(() => {
    const url = URL.createObjectURL(photoBlob);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoBlob]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Pratinjau foto"
          className="w-full max-w-sm aspect-[9/16] object-cover"
        />
      )}
      {audioUrl ? (
        <audio src={audioUrl} controls />
      ) : (
        <p className="text-(--color-on-surface-variant) text-sm">
          Tidak ada pesan suara
        </p>
      )}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button type="button" variant="outline" onClick={onRetakePhoto}>
          Ulangi Foto
        </Button>
        <Button type="button" variant="outline" onClick={onReRecordAudio}>
          {audioUrl ? "Rekam Ulang" : "Rekam Pesan Suara"}
        </Button>
        <Button type="button" variant="outline" onClick={onDownloadPhoto}>
          Unduh Foto
        </Button>
      </div>
      <Button type="button" onClick={onSubmit} className="!px-8">
        Kirim
      </Button>
    </div>
  );
}
