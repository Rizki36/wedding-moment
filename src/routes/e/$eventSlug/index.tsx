import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { getEventBySlug } from '../../../server/functions/events'
import { listFramesForEvent } from '../../../server/functions/frames'
import { getPresignedGetUrl } from '../../../server/storage/presign'
import { GuestNameForm } from '../../../components/capture/GuestNameForm'
import { FramePicker } from '../../../components/capture/FramePicker'

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
const getGuestLandingDataFn = createServerFn({ method: 'GET' })
  .validator((eventSlug: string) => eventSlug)
  .handler(async ({ data: eventSlug }) => {
    const event = await getEventBySlug(eventSlug)
    if (!event || event.status !== 'active') return { event: null, frames: [] }
    const frames = await listFramesForEvent(event.id)
    // `objectKey` is overwritten with a short-lived presigned GET URL so the
    // frame picker thumbnail can load it directly — frame PNGs live in a
    // private R2 bucket, not a public one.
    const framesWithUrls = await Promise.all(
      frames.map(async (f) => ({ ...f, objectKey: await getPresignedGetUrl(f.objectKey) })),
    )
    return { event, frames: framesWithUrls }
  })

export const Route = createFileRoute('/e/$eventSlug/')({
  loader: async ({ params }) => getGuestLandingDataFn({ data: params.eventSlug }),
  component: GuestLandingPage,
})

type Step = 'name' | 'frame' | 'capture'

function GuestLandingPage() {
  const { event, frames } = Route.useLoaderData()
  const [step, setStep] = useState<Step>('name')
  const [guestName, setGuestName] = useState('')
  const [frameId, setFrameId] = useState<string | null>(null)

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p>Acara ini tidak lagi tersedia.</p>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <GuestNameForm
        onSubmit={(name) => {
          setGuestName(name)
          setStep('frame')
        }}
      />
    )
  }

  if (step === 'frame') {
    return <FramePicker frames={frames} value={frameId} onChange={setFrameId} onSkip={() => setStep('capture')} />
  }

  // step === 'capture': the real camera/audio capture flow is wired up in
  // Tasks 12-15. This is intentionally a placeholder.
  return (
    <div className="p-8">
      Capture flow untuk {guestName} (frame: {frameId ?? 'tanpa bingkai'})
    </div>
  )
}
