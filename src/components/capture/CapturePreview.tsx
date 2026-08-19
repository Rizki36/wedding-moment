import { useEffect, useState } from 'react'

export function CapturePreview({
  photoBlob,
  audioUrl,
  onRetakePhoto,
  onReRecordAudio,
  onDownloadPhoto,
  onSubmit,
}: {
  photoBlob: Blob
  audioUrl: string
  onRetakePhoto: () => void
  onReRecordAudio: () => void
  onDownloadPhoto: () => void
  onSubmit: () => void
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // Re-derive the object URL whenever a new composited photo comes in (e.g.
  // after a retake), and revoke the previous one so it doesn't leak.
  useEffect(() => {
    const url = URL.createObjectURL(photoBlob)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoBlob])

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {photoUrl && (
        <img src={photoUrl} alt="Pratinjau foto" className="w-full max-w-sm rounded-t-full" />
      )}
      <audio src={audioUrl} controls />
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          type="button"
          onClick={onRetakePhoto}
          className="rounded-full border border-(--color-fg) px-4 py-2"
        >
          Ulangi Foto
        </button>
        <button
          type="button"
          onClick={onReRecordAudio}
          className="rounded-full border border-(--color-fg) px-4 py-2"
        >
          Rekam Ulang
        </button>
        <button
          type="button"
          onClick={onDownloadPhoto}
          className="rounded-full border border-(--color-fg) px-4 py-2"
        >
          Unduh Foto
        </button>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-full bg-(--color-fg) text-white px-8 py-3"
      >
        Kirim
      </button>
    </div>
  )
}
