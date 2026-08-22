export const MAX_AUDIO_SECONDS = 30;
export const RETENTION_DAYS = 30;
export const MAX_PHOTO_DIMENSION = 1600;
// Guest-facing photo aspect ratio (width:height). Matches the Tailwind
// `aspect-[9/16]` classes in CameraCapture.tsx and CapturePreview.tsx —
// those stay literal strings for Tailwind's JIT scanner, but keep this
// constant and both class names in sync if the ratio ever changes.
export const PHOTO_ASPECT_RATIO = 9 / 16;
// Single JPEG encode quality for the captured photo, used whether or not a
// frame overlay is composited. The pipeline used to encode twice (capture,
// then re-encode during frame compositing) which visibly degraded quality —
// there is now exactly one encode step, so keep this reasonably high.
export const PHOTO_JPEG_QUALITY = 0.92;
