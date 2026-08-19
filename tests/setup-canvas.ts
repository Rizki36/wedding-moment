// jsdom + the `canvas` npm package provide real 2D canvas rendering
// (HTMLCanvasElement#getContext, #toBlob), but jsdom does not implement the
// `createImageBitmap()` Web API used by `resizeAndCompress()`. This adds a
// minimal polyfill for tests only:
//   - HTMLCanvasElement sources are already drawable via ctx.drawImage(),
//     jsdom just returns them as-is (they already expose width/height).
//   - Blob sources are decoded through an <img> element, which jsdom backs
//     with the `canvas` package's Image decoder and which ctx.drawImage()
//     also recognizes.
if (typeof globalThis.createImageBitmap === 'undefined') {
  globalThis.createImageBitmap = (async (
    source: HTMLCanvasElement | Blob,
  ): Promise<ImageBitmap> => {
    if (source instanceof Blob) {
      const buffer = Buffer.from(await source.arrayBuffer())
      const dataUrl = `data:${source.type};base64,${buffer.toString('base64')}`
      const img = document.createElement('img')
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('createImageBitmap polyfill: failed to decode blob'))
        img.src = dataUrl
      })
      return img as unknown as ImageBitmap
    }
    return source as unknown as ImageBitmap
  }) as typeof createImageBitmap
}
