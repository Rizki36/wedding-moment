import { useEffect, useRef, useState } from 'react'
import { pickSupportedMimeType } from '#/lib/audio-mime'
import { MAX_AUDIO_SECONDS } from '#/lib/constants'
import { Button } from '#/components/ui/Button'

// Fixed relative bar heights for the decorative waveform (not real amplitude
// data) — kept stable across renders so the bars don't reshuffle every
// second when `secondsLeft` ticks.
const WAVEFORM_HEIGHTS = [
  0.35, 0.6, 0.4, 0.8, 0.5, 0.9, 0.45, 0.65, 0.3, 0.75, 0.5, 0.85, 0.4, 0.6, 0.9, 0.35, 0.7, 0.5,
  0.8, 0.45, 0.65, 0.55, 0.4, 0.75,
]

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function MicIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="7" y="2" width="6" height="10" rx="3" />
      <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5M7 18h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PauseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <rect x="5" y="4" width="3.5" height="12" rx="1" />
      <rect x="11.5" y="4" width="3.5" height="12" rx="1" />
    </svg>
  )
}

function PlayIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6 4.5v11l9-5.5z" />
    </svg>
  )
}

export function AudioRecorder({
  onRecorded,
  onSkip,
}: {
  onRecorded: (blob: Blob, mimeType: string) => void
  onSkip: () => void
}) {
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MAX_AUDIO_SECONDS)
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
        // Detach handlers so onRecorded doesn't fire after unmount.
        recorder.onstop = null
        recorder.ondataavailable = null
        recorder.stop()
        recorder.stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  function startTimer() {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          recorderRef.current?.stop()
          setRecording(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

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
        onRecorded(blob, mimeTypeRef.current)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setPaused(false)
      setSecondsLeft(MAX_AUDIO_SECONDS)
      startTimer()
    } catch {
      setError('Tidak dapat mengakses mikrofon. Mohon izinkan akses mikrofon.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
    setPaused(false)
  }

  function togglePause() {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      recorder.pause()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setPaused(true)
    } else if (recorder.state === 'paused') {
      recorder.resume()
      startTimer()
      setPaused(false)
    }
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  const elapsed = MAX_AUDIO_SECONDS - secondsLeft

  if (recording) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-(--font-display) text-xl text-(--color-on-surface)">Rekam Pesan Suara</h2>

        <div className="relative flex items-center justify-center w-40 h-40">
          <span
            className="absolute inset-0 rounded-full bg-(--color-secondary-container)/70 animate-ping"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          />
          <span
            className="absolute inset-4 rounded-full bg-(--color-secondary-container)/70 animate-ping [animation-delay:0.4s]"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          />
          <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-(--color-error) text-(--color-on-error) shadow-[0_4px_20px_rgba(186,26,26,0.35)]">
            <MicIcon className="w-10 h-10" />
          </div>
        </div>

        <p className="font-(--font-display) text-2xl text-(--color-on-surface) tabular-nums">
          {formatElapsed(elapsed)}
        </p>

        <div className="flex items-end gap-[3px] h-10">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-(--color-error) origin-bottom animate-[waveform-bar_0.9s_ease-in-out_infinite]"
              style={{
                height: `${h * 100}%`,
                animationDelay: `${i * 0.05}s`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={paused ? 'Lanjutkan rekaman' : 'Jeda rekaman'}
            onClick={togglePause}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-(--color-secondary-container) text-(--color-error) transition hover:brightness-95"
          >
            {paused ? <PlayIcon className="w-5 h-5 ml-0.5" /> : <PauseIcon className="w-5 h-5" />}
          </button>
          <Button
            type="button"
            onClick={stopRecording}
            className="!rounded-full !bg-(--color-error) !text-(--color-on-error) !border-transparent hover:!border-transparent !px-8"
          >
            Berhenti
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="font-(--font-display) text-xl text-(--color-on-surface)">Rekam Pesan Suara</h2>
      <p className="text-(--color-on-surface-variant) text-sm -mt-4">Maks {MAX_AUDIO_SECONDS} detik</p>

      <button
        type="button"
        aria-label="Mulai merekam"
        onClick={startRecording}
        className="flex items-center justify-center w-24 h-24 rounded-full bg-(--color-primary) text-(--color-on-primary) shadow-[0_4px_20px_rgba(45,71,57,0.15)] transition hover:brightness-95"
      >
        <MicIcon className="w-10 h-10" />
      </button>

      <Button type="button" variant="outline" onClick={onSkip}>
        Tanpa Pesan Suara
      </Button>
    </div>
  )
}
