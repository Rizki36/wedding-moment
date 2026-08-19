import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'

describe('qr generation', () => {
  it('encodes and decodes back to the event URL', async () => {
    const url = 'https://wedding-moment.example.com/e/abc123'
    const buffer = await QRCode.toBuffer(url, { type: 'png' })
    const png = PNG.sync.read(buffer)
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    expect(decoded?.data).toBe(url)
  })
})
