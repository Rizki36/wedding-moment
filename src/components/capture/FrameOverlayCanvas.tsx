// Composites a transparent frame PNG over a captured photo using canvas.
// Browser-only (canvas, Image, createImageBitmap) — must only be called from
// client code (event handlers / effects), never at module scope.
export async function compositePhotoWithFrame(
  photoBlob: Blob,
  frameUrl: string | null,
): Promise<Blob> {
  const photoBitmap = await createImageBitmap(photoBlob)
  const canvas = document.createElement('canvas')
  canvas.width = photoBitmap.width
  canvas.height = photoBitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(photoBitmap, 0, 0)

  if (frameUrl) {
    const frameImg = new Image()
    frameImg.crossOrigin = 'anonymous'
    frameImg.src = frameUrl
    await new Promise((resolve, reject) => {
      frameImg.onload = resolve
      frameImg.onerror = () => reject(new Error('Failed to load frame image'))
    })
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.85,
    )
  })
}
