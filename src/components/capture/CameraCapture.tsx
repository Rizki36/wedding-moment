import { useEffect, useRef, useState } from 'react'
import { resizeAndCompress } from '#/lib/image'
import { MAX_PHOTO_DIMENSION, PHOTO_ASPECT_RATIO } from '#/lib/constants'
import { Button } from '#/components/ui/Button'

export function CameraCapture({
  onCapture,
  frameUrl,
}: {
  onCapture: (blob: Blob) => void
  frameUrl?: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isMirrored, setIsMirrored] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [captureError, setCaptureError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const effectiveMirror = facingMode === 'user' && isMirrored

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    setIsReady(false)

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Tidak dapat mengakses kamera. Mohon izinkan akses kamera.'))

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facingMode])

  async function handleShutter() {
    if (!videoRef.current || isCapturing) return
    setIsCapturing(true)
    setCaptureError(null)
    try {
      const blob = await resizeAndCompress(
        videoRef.current,
        MAX_PHOTO_DIMENSION,
        0.8,
        PHOTO_ASPECT_RATIO,
        effectiveMirror,
      )
      onCapture(blob)
    } catch {
      setCaptureError('Gagal mengambil foto. Silakan coba lagi.')
    } finally {
      setIsCapturing(false)
    }
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedData={() => setIsReady(true)}
        className="w-full aspect-[3/4] object-cover"
        style={effectiveMirror ? { transform: 'scaleX(-1)' } : undefined}
      />
      {frameUrl && (
        <img
          src={frameUrl}
          alt=""
          crossOrigin="anonymous"
          className="absolute inset-0 w-full aspect-[3/4] object-contain pointer-events-none"
        />
      )}
      {captureError && <p className="px-4 pt-4 text-center text-red-600">{captureError}</p>}
      <div className="flex justify-center gap-4 p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
        >
          Balik Kamera
        </Button>
        {facingMode === 'user' && (
          <Button
            type="button"
            variant="outline"
            aria-pressed={isMirrored}
            onClick={() => setIsMirrored((m) => !m)}
            className={isMirrored ? 'bg-(--color-primary-container)/40' : ''}
          >
            Cerminkan
          </Button>
        )}
        <Button type="button" onClick={handleShutter} disabled={!isReady || isCapturing}>
          Ambil Foto
        </Button>
      </div>
    </div>
  )
}
