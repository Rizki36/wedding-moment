import { describe, expect, it } from "vitest";
import { compositePhotoWithFrame } from "../src/components/capture/FrameOverlayCanvas";

function solidColorBlob(color: string, w: number, h: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png"),
  );
}

// jsdom's URL.createObjectURL doesn't back a real resource loader (fetching
// a blob: URL in this test environment returns garbage, not the blob bytes),
// so tests use a data: URL as a stand-in for what would be a blob: or https:
// URL in the browser. compositePhotoWithFrame just needs a loadable <img> src.
async function solidColorDataUrl(
  color: string,
  w: number,
  h: number,
): Promise<string> {
  const blob = await solidColorBlob(color, w, h);
  const buffer = Buffer.from(await blob.arrayBuffer());
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

describe("compositePhotoWithFrame", () => {
  it("returns the original photo re-encoded as JPEG when no frame is given", async () => {
    const photo = await solidColorBlob("blue", 400, 400);
    const result = await compositePhotoWithFrame(photo, null);
    expect(result.type).toBe("image/jpeg");
  });

  it("layers a transparent frame PNG on top of the photo", async () => {
    const photo = await solidColorBlob("blue", 400, 400);
    const frameUrl = await solidColorDataUrl("rgba(255,0,0,0.5)", 400, 400);
    const result = await compositePhotoWithFrame(photo, frameUrl);
    expect(result.type).toBe("image/jpeg");

    const bitmap = await createImageBitmap(result);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const pixel = ctx.getImageData(200, 200, 1, 1).data;
    // Composited pixel should be a blend, not pure blue (0,0,255) nor pure red
    expect(pixel[0]).toBeGreaterThan(0);
  });

  it("does not distort the frame when photo and frame are both 9:16 (non-square)", async () => {
    const photo = await solidColorBlob("blue", 450, 800);
    const frameUrl = await solidColorDataUrl("rgba(255,0,0,0.5)", 450, 800);
    const result = await compositePhotoWithFrame(photo, frameUrl);
    const bitmap = await createImageBitmap(result);
    expect(bitmap.width / bitmap.height).toBeCloseTo(9 / 16, 2);
  });
});
