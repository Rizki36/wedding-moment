import { createFileRoute } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { listSubmissionsForEventFn } from '../../../../server/functions/submissions'
import { SubmissionGrid } from '../../../../components/dashboard/SubmissionGrid'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/submissions')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => listSubmissionsForEventFn({ data: params.eventId }),
  component: SubmissionsPage,
})

function SubmissionsPage() {
  const submissionList = Route.useLoaderData()

  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg) mb-6">Ucapan Tamu</h1>
      <SubmissionGrid submissions={submissionList} />
    </div>
  )
}
