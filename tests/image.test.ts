import { describe, it, expect } from 'vitest'
import { resizeAndCompress } from '../src/lib/image'

describe('resizeAndCompress', () => {
  it('produces a JPEG blob no larger than the requested max dimension', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 3000
    canvas.height = 2000
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 3000, 2000)
    const bitmap = await createImageBitmap(canvas)

    const blob = await resizeAndCompress(bitmap, 1600)
    expect(blob.type).toBe('image/jpeg')

    const resultBitmap = await createImageBitmap(blob)
    expect(Math.max(resultBitmap.width, resultBitmap.height)).toBeLessThanOrEqual(1600)
  })
})
