import { canvasToJpegBlob } from "#/lib/image";

// Composites a transparent frame PNG over a captured photo using canvas.
// Browser-only (canvas, Image) — must only be called from client code (event
// handlers / effects), never at module scope.
//
// Takes the already-rendered photo canvas (from CameraCapture's
// renderPhotoToCanvas — already cropped to PHOTO_ASPECT_RATIO, scaled, and
// mirrored) and draws it plus an optional frame overlay onto a fresh canvas,
// encoding to JPEG exactly once. Do not decode-then-redraw an already-encoded
// blob here — that reintroduces the double-compression pipeline this
// function was rewritten to avoid.
export async function compositePhotoWithFrame(
  photoCanvas: HTMLCanvasElement,
  frameUrl: string | null,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = photoCanvas.width;
  canvas.height = photoCanvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(photoCanvas, 0, 0);

  if (frameUrl) {
    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = frameUrl;
    await new Promise((resolve, reject) => {
      frameImg.onload = resolve;
      frameImg.onerror = () => reject(new Error("Failed to load frame image"));
    });
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  }

  return canvasToJpegBlob(canvas, quality);
}
