export function centerCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: number,
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const sourceRatio = sourceWidth / sourceHeight
  if (sourceRatio > targetRatio) {
    const sWidth = sourceHeight * targetRatio
    return { sx: (sourceWidth - sWidth) / 2, sy: 0, sWidth, sHeight: sourceHeight }
  }
  const sHeight = sourceWidth / targetRatio
  return { sx: 0, sy: (sourceHeight - sHeight) / 2, sWidth: sourceWidth, sHeight }
}

export async function resizeAndCompress(
  source: ImageBitmap | HTMLVideoElement,
  maxDim: number,
  quality = 0.8,
  aspectRatio?: number,
): Promise<Blob> {
  const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.width
  const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.height

  const crop = aspectRatio
    ? centerCropRect(sourceWidth, sourceHeight, aspectRatio)
    : { sx: 0, sy: 0, sWidth: sourceWidth, sHeight: sourceHeight }

  const scale = Math.min(1, maxDim / Math.max(crop.sWidth, crop.sHeight))
  const targetWidth = Math.round(crop.sWidth * scale)
  const targetHeight = Math.round(crop.sHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, crop.sx, crop.sy, crop.sWidth, crop.sHeight, 0, 0, targetWidth, targetHeight)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })
}
