export async function resizeAndCompress(
  source: ImageBitmap | HTMLVideoElement,
  maxDim: number,
  quality = 0.8,
): Promise<Blob> {
  const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.width
  const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.height

  const scale = Math.min(1, maxDim / Math.max(sourceWidth, sourceHeight))
  const targetWidth = Math.round(sourceWidth * scale)
  const targetHeight = Math.round(sourceHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })
}
