import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extensionForMimeType,
  pickSupportedMimeType,
} from "../src/lib/audio-mime";

describe("pickSupportedMimeType", () => {
  afterEach(() => vi.restoreAllMocks());

  it("prefers audio/webm;codecs=opus when supported", () => {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (type: string) => type === "audio/webm;codecs=opus",
    });
    expect(pickSupportedMimeType()).toBe("audio/webm;codecs=opus");
  });

  it("falls back to audio/mp4 when webm is unsupported (Safari)", () => {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (type: string) => type === "audio/mp4",
    });
    expect(pickSupportedMimeType()).toBe("audio/mp4");
  });

  it("returns an empty string when nothing is supported", () => {
    vi.stubGlobal("MediaRecorder", { isTypeSupported: () => false });
    expect(pickSupportedMimeType()).toBe("");
  });
});

describe("extensionForMimeType", () => {
  it("maps mp4 to m4a", () => {
    expect(extensionForMimeType("audio/mp4")).toBe("m4a");
  });

  it("maps ogg to ogg", () => {
    expect(extensionForMimeType("audio/ogg")).toBe("ogg");
  });

  it("defaults to webm", () => {
    expect(extensionForMimeType("audio/webm;codecs=opus")).toBe("webm");
    expect(extensionForMimeType("")).toBe("webm");
  });
});
