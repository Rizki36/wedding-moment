import { useEffect, useRef, useState } from 'react'
import { pickSupportedMimeType } from '#/lib/audio-mime'
import { MAX_AUDIO_SECONDS } from '#/lib/constants'
import { Button } from '#/components/ui/Button'

export function AudioRecorder({ onRecorded }: { onRecorded: (blob: Blob, mimeType: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MAX_AUDIO_SECONDS)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        // Detach handlers so onRecorded/setAudioUrl don't fire after unmount.
        recorder.onstop = null
        recorder.ondataavailable = null
        recorder.stop()
        recorder.stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickSupportedMimeType()
      mimeTypeRef.current = mimeType
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        onRecorded(blob, mimeTypeRef.current)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setSecondsLeft(MAX_AUDIO_SECONDS)

      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            recorder.stop()
            setRecording(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch {
      setError('Tidak dapat mengakses mikrofon. Mohon izinkan akses mikrofon.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function reRecord() {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setSecondsLeft(MAX_AUDIO_SECONDS)
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  if (audioUrl) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <audio src={audioUrl} controls />
        <Button type="button" variant="outline" onClick={reRecord}>
          Rekam Ulang
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {recording ? (
        <>
          <p className="text-(--color-on-surface)">Merekam... {secondsLeft}s</p>
          <Button type="button" onClick={stopRecording} className="!bg-red-600">
            Berhenti
          </Button>
        </>
      ) : (
        <Button type="button" onClick={startRecording}>
          Rekam Pesan Suara (maks {MAX_AUDIO_SECONDS}s)
        </Button>
      )}
    </div>
  )
}
