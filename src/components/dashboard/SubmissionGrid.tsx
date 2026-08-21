import { SubmissionCard } from './SubmissionCard'

type SubmissionWithUrls = { id: string; guestName: string; photoUrl: string; audioUrl: string | null }

export function SubmissionGrid({ submissions }: { submissions: SubmissionWithUrls[] }) {
  if (submissions.length === 0) {
    return <p className="text-(--color-on-surface-variant) p-8 text-center">Belum ada ucapan dari tamu.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} guestName={s.guestName} photoUrl={s.photoUrl} audioUrl={s.audioUrl} />
      ))}
    </div>
  )
}
