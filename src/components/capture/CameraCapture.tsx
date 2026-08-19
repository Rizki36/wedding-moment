import { useEffect, useRef, useState } from 'react'
import { resizeAndCompress } from '#/lib/image'
import { Button } from '#/components/ui/Button'

export function CameraCapture({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

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
    if (!videoRef.current) return
    const blob = await resizeAndCompress(videoRef.current, 1600)
    onCapture(blob)
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-[3/4] object-cover rounded-t-full"
      />
      <div className="flex justify-center gap-4 p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
        >
          Balik Kamera
        </Button>
        <Button type="button" onClick={handleShutter}>
          Ambil Foto
        </Button>
      </div>
    </div>
  )
}
