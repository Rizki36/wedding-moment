import { createFileRoute } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { listSubmissionsForEventFn } from '../../../../server/functions/submissions'
import { SubmissionGrid } from '../../../../components/dashboard/SubmissionGrid'
import { BulkDownloadButton } from '../../../../components/dashboard/BulkDownloadButton'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/submissions')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => listSubmissionsForEventFn({ data: params.eventId }),
  component: SubmissionsPage,
})

function SubmissionsPage() {
  const submissionList = Route.useLoaderData()
  const { eventId } = Route.useParams()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Ucapan Tamu</h1>
        <BulkDownloadButton eventId={eventId} />
      </div>
      <SubmissionGrid submissions={submissionList} />
    </div>
  )
}
