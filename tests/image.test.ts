import { describe, it, expect } from 'vitest'
import { centerCropRect, resizeAndCompress } from '../src/lib/image'

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

  it('crops a non-3:4 source to exactly 3:4 when aspectRatio is given', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, 1280, 720)
    const bitmap = await createImageBitmap(canvas)

    const blob = await resizeAndCompress(bitmap, 1600, 0.8, 3 / 4)
    const resultBitmap = await createImageBitmap(blob)
    expect(resultBitmap.width / resultBitmap.height).toBeCloseTo(3 / 4, 2)
  })
})

describe('centerCropRect', () => {
  it('crops the sides of a landscape 16:9 source to 3:4', () => {
    const { sx, sy, sWidth, sHeight } = centerCropRect(1280, 720, 3 / 4)
    expect(sWidth / sHeight).toBeCloseTo(3 / 4, 5)
    expect(sHeight).toBe(720)
    expect(sy).toBe(0)
    expect(sx).toBeCloseTo((1280 - sWidth) / 2, 5)
  })

  it('crops the sides of a 4:3 source to 3:4', () => {
    const { sWidth, sHeight, sx, sy } = centerCropRect(640, 480, 3 / 4)
    expect(sWidth / sHeight).toBeCloseTo(3 / 4, 5)
    expect(sHeight).toBe(480)
    expect(sy).toBe(0)
    expect(sx).toBeGreaterThan(0)
  })

  it('crops the top/bottom of a too-tall 9:16 portrait source', () => {
    const { sWidth, sHeight, sx, sy } = centerCropRect(720, 1280, 3 / 4)
    expect(sWidth / sHeight).toBeCloseTo(3 / 4, 5)
    expect(sWidth).toBe(720)
    expect(sx).toBe(0)
    expect(sy).toBeGreaterThan(0)
  })

  it('is a no-op for a source that already is 3:4', () => {
    const { sWidth, sHeight, sx, sy } = centerCropRect(900, 1200, 3 / 4)
    expect(sWidth).toBe(900)
    expect(sHeight).toBe(1200)
    expect(sx).toBe(0)
    expect(sy).toBe(0)
  })
})
