import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { useState } from "react";
import { AudioRecorder } from "../../../components/capture/AudioRecorder";
import { CameraCapture } from "../../../components/capture/CameraCapture";
import { CapturePreview } from "../../../components/capture/CapturePreview";
import { compositePhotoWithFrame } from "../../../components/capture/FrameOverlayCanvas";
import { FramePicker, type Frame } from "../../../components/capture/FramePicker";
import { GuestNameForm } from "../../../components/capture/GuestNameForm";
import { extensionForMimeType } from "../../../lib/audio-mime";
import { getEventBySlug } from "../../../server/functions/events";
import { listFramesForEvent } from "../../../server/functions/frames";
import { createSubmissionFn } from "../../../server/functions/submissions";
import { getPresignedGetUrl } from "../../../server/storage/presign";

/**
 * Fully public/unauthenticated route — guests never log in, so this route
 * lives outside the `/_authed` layout and needs no guard or header access.
 * The loader logic still touches `db` (via `getEventBySlug`/
 * `listFramesForEvent`) and R2 credentials (via `getPresignedGetUrl`)
 * though, and this route file has both `loader` and `component`, so it's
 * client-bundled — calling those directly from the loader (loaders run on
 * both server and client) would pull `db/client.ts` into the client bundle,
 * where `neon(process.env.DATABASE_URL!)` throws on import and crashes
 * hydration app-wide. Routing it through `createServerFn` keeps the DB/R2
 * imports server-only.
 */
const getGuestLandingDataFn = createServerFn({ method: "GET" })
  .validator((eventSlug: string) => eventSlug)
  .handler(async ({ data: eventSlug }) => {
    const event = await getEventBySlug(eventSlug);
    if (!event || event.status !== "active") return { event: null, frames: [] };
    const frames = await listFramesForEvent(event.id);
    // `objectKey` is overwritten with a short-lived presigned GET URL so the
    // frame picker thumbnail can load it directly — frame PNGs live in a
    // private R2 bucket, not a public one.
    const framesWithUrls = await Promise.all(
      frames.map(async (f) => ({
        ...f,
        objectKey: await getPresignedGetUrl(f.objectKey),
      })),
    );
    return { event, frames: framesWithUrls };
  });

export const Route = createFileRoute("/e/$eventSlug/")({
  loader: async ({ params }) =>
    getGuestLandingDataFn({ data: params.eventSlug }),
  component: GuestLandingPage,
});

type Step = "name" | "capture";

function GuestLandingPage() {
  const { event, frames } = Route.useLoaderData();
  const [step, setStep] = useState<Step>("name");
  const [guestName, setGuestName] = useState("");

  if (!event) {
    return (
      <div className="bg-(--color-surface) min-h-screen flex items-center justify-center p-8 text-center">
        <p className="text-(--color-on-surface)">
          Acara ini tidak lagi tersedia.
        </p>
      </div>
    );
  }

  if (step === "name") {
    return (
      <GuestNameForm
        onSubmit={(name) => {
          setGuestName(name);
          setStep("capture");
        }}
      />
    );
  }

  // step === 'capture'
  return (
    <CaptureStep
      eventId={event.id}
      eventSlug={event.slug}
      guestName={guestName}
      frames={frames}
    />
  );
}

type CaptureSubStep = "photo" | "audio" | "preview";

/**
 * Sequences camera capture -> audio recording -> preview/submit for a
 * guest. This is a plain client component (not a loader/`beforeLoad`), so
 * it's already only ever rendered in the browser — but it still must not
 * touch `db`/R2 credentials directly. It only ever reaches those through
 * two already-guarded network boundaries: the `/api/uploads/presign` API
 * route (extended in this task to accept `kind: 'submission-photo' |
 * 'submission-audio'`) for uploading blobs, and `createSubmissionFn` (a
 * `createServerFn`) for writing the submission row — both re-verify the
 * target event is `active` server-side, since guests are anonymous and
 * this component's calls are network-reachable independent of this route's
 * loader.
 */
function CaptureStep({
  eventId,
  eventSlug,
  guestName,
  frames,
}: {
  eventId: string;
  eventSlug: string;
  guestName: string;
  frames: Frame[];
}) {
  const navigate = useNavigate();
  const [subStep, setSubStep] = useState<CaptureSubStep>("photo");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [compositedBlob, setCompositedBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string | null>(null);
  const frameUrl = frames.find((f) => f.id === frameId)?.objectKey ?? null;

  async function handlePhotoCapture(blob: Blob) {
    setPhotoBlob(blob);
    try {
      const composited = await compositePhotoWithFrame(blob, frameUrl);
      setCompositedBlob(composited);
    } catch (err) {
      console.error(
        "Frame compositing failed, falling back to unframed photo:",
        err,
      );
      setCompositedBlob(null);
    }
    setSubStep("audio");
  }

  function handleAudioRecorded(blob: Blob, mimeType: string) {
    setAudioBlob(blob);
    setAudioMimeType(mimeType);
    setAudioUrl(URL.createObjectURL(blob));
    setSubStep("preview");
  }

  function handleRetakePhoto() {
    setPhotoBlob(null);
    setCompositedBlob(null);
    setSubStep("photo");
  }

  function handleReRecordAudio() {
    setAudioBlob(null);
    setAudioUrl(null);
    setSubStep("audio");
  }

  function handleSkipAudio() {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioMimeType("");
    setSubStep("preview");
  }

  function handleDownloadPhoto() {
    if (!compositedBlob) return;
    const url = URL.createObjectURL(compositedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-moment.jpg";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function uploadToR2(
    kind: "submission-photo" | "submission-audio",
    submissionId: string,
    blob: Blob,
    contentType: string,
    ext?: string,
  ) {
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      body: JSON.stringify({ kind, eventId, submissionId, contentType, ext }),
    });
    if (!presignRes.ok) throw new Error("Gagal mendapatkan izin unggah.");
    const { url, key } = await presignRes.json();
    const putRes = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": contentType },
    });
    if (!putRes.ok) throw new Error("Gagal mengunggah berkas.");
    return key;
  }

  async function handleSubmit() {
    if (!compositedBlob) return;
    setSubmitting(true);
    setError(null);
    try {
      const submissionId = nanoid(12);
      const photoKey = await uploadToR2(
        "submission-photo",
        submissionId,
        compositedBlob,
        "image/jpeg",
      );
      let audioKey: string | null = null;
      if (audioBlob) {
        const ext = extensionForMimeType(audioMimeType);
        const audioContentType = audioMimeType || "audio/webm";
        audioKey = await uploadToR2(
          "submission-audio",
          submissionId,
          audioBlob,
          audioContentType,
          ext,
        );
      }

      await createSubmissionFn({
        data: {
          eventId,
          guestName,
          frameId,
          photoObjectKey: photoKey,
          audioObjectKey: audioKey,
        },
      });

      navigate({ to: "/e/$eventSlug/thank-you", params: { eventSlug } });
    } catch {
      setError("Gagal mengirim. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (subStep === "photo")
    return (
      <div>
        <CameraCapture onCapture={handlePhotoCapture} frameUrl={frameUrl} />
        <FramePicker frames={frames} value={frameId} onChange={setFrameId} />
      </div>
    );
  if (subStep === "audio")
    return (
      <AudioRecorder
        onRecorded={handleAudioRecorded}
        onSkip={handleSkipAudio}
      />
    );

  return (
    <div>
      <CapturePreview
        photoBlob={compositedBlob ?? photoBlob!}
        audioUrl={audioUrl}
        onRetakePhoto={handleRetakePhoto}
        onReRecordAudio={handleReRecordAudio}
        onDownloadPhoto={handleDownloadPhoto}
        onSubmit={handleSubmit}
      />
      {submitting && (
        <p className="text-center text-(--color-on-surface-variant)">
          Mengirim...
        </p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}
    </div>
  );
}
