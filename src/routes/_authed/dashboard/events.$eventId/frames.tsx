import { createFileRoute, useRouter } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { listFramesForEventFn, deleteFrameFn } from '../../../../server/functions/frames'
import { FrameUploadForm } from '../../../../components/dashboard/FrameUploadForm'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/frames')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => listFramesForEventFn({ data: params.eventId }),
  component: FramesPage,
})

function FramesPage() {
  const frameList = Route.useLoaderData()
  const { eventId } = Route.useParams()
  const router = useRouter()

  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface) mb-4">Bingkai Foto</h1>
      <FrameUploadForm eventId={eventId} onUploaded={() => router.invalidate()} />
      <ul className="grid grid-cols-3 gap-4 mt-6">
        {frameList.map((frame) => (
          <li
            key={frame.id}
            className="bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] p-2"
          >
            <p className="text-sm text-(--color-on-surface)">{frame.name}</p>
            <button
              onClick={async () => {
                await deleteFrameFn({ data: { frameId: frame.id } })
                router.invalidate()
              }}
              className="text-red-600 text-sm"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {frameList.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada bingkai.</p>}
    </div>
  )
}
