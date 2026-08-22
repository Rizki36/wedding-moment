import { FlipHorizontal, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_PHOTO_DIMENSION, PHOTO_ASPECT_RATIO } from "#/lib/constants";
import { renderPhotoToCanvas } from "#/lib/image";
import { type Frame, FramePicker } from "./FramePicker";

const iconButtonClasses =
  "flex h-12 w-12 items-center justify-center rounded-full border border-(--color-outline-variant) text-(--color-on-surface) transition hover:bg-(--color-primary-container)/40 disabled:opacity-50 disabled:cursor-not-allowed";

export function CameraCapture({
  onCapture,
  frameUrl,
  frames,
  frameId,
  onFrameChange,
}: {
  onCapture: (canvas: HTMLCanvasElement) => void;
  frameUrl?: string | null;
  frames: Frame[];
  frameId: string | null;
  onFrameChange: (frameId: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const effectiveMirror = facingMode === "user" && isMirrored;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    setIsReady(false);

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1920 },
        },
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => {
            t.stop();
          });
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() =>
        setError("Tidak dapat mengakses kamera. Mohon izinkan akses kamera."),
      );

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => {
        t.stop();
      });
    };
  }, [facingMode]);

  async function handleShutter() {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const canvas = renderPhotoToCanvas(
        videoRef.current,
        MAX_PHOTO_DIMENSION,
        PHOTO_ASPECT_RATIO,
        effectiveMirror,
      );
      onCapture(canvas);
    } catch {
      setCaptureError("Gagal mengambil foto. Silakan coba lagi.");
    } finally {
      setIsCapturing(false);
    }
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 p-2">
      <div className="relative w-full overflow-hidden rounded-(--radius-lg)">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedData={() => setIsReady(true)}
          className="w-full aspect-[9/16] object-cover"
          style={effectiveMirror ? { transform: "scaleX(-1)" } : undefined}
        />
        {frameUrl && (
          <img
            src={frameUrl}
            alt=""
            crossOrigin="anonymous"
            className="absolute inset-0 w-full aspect-[9/16] object-contain pointer-events-none"
          />
        )}
        {frames.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pt-8">
            <FramePicker
              frames={frames}
              value={frameId}
              onChange={onFrameChange}
            />
          </div>
        )}
      </div>
      {captureError && (
        <p className="text-center text-red-600">{captureError}</p>
      )}
      <div className="flex items-center justify-center gap-6 py-2">
        <button
          type="button"
          aria-label="Balik Kamera"
          className={iconButtonClasses}
          onClick={() =>
            setFacingMode((m) => (m === "user" ? "environment" : "user"))
          }
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Ambil Foto"
          onClick={handleShutter}
          disabled={!isReady || isCapturing}
          className="h-20 w-20 rounded-full bg-(--color-shutter) ring-4 ring-(--color-shutter-ring) transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {facingMode === "user" && (
          <button
            type="button"
            aria-label="Cerminkan Kamera"
            aria-pressed={isMirrored}
            className={`${iconButtonClasses} ${isMirrored ? "bg-(--color-primary-container)/40" : ""}`}
            onClick={() => setIsMirrored((m) => !m)}
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
