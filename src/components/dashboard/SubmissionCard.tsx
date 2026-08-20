import { Card } from '../ui/Card'

export function SubmissionCard({
  guestName,
  photoUrl,
  audioUrl,
}: {
  guestName: string
  photoUrl: string
  audioUrl: string
}) {
  return (
    <Card className="flex flex-col gap-2 p-3">
      <img src={photoUrl} alt={guestName} className="rounded aspect-square object-cover w-full" />
      <p className="font-medium text-(--color-on-surface)">{guestName}</p>
      <audio src={audioUrl} controls className="w-full" />
    </Card>
  )
}
