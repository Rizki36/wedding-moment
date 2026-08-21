export const MAX_AUDIO_SECONDS = 30
export const RETENTION_DAYS = 30
export const MAX_PHOTO_DIMENSION = 1600
// Guest-facing photo aspect ratio (width:height). Matches the Tailwind
// `aspect-[3/4]` classes in CameraCapture.tsx and CapturePreview.tsx —
// those stay literal strings for Tailwind's JIT scanner, but keep this
// constant and both class names in sync if the ratio ever changes.
export const PHOTO_ASPECT_RATIO = 3 / 4
