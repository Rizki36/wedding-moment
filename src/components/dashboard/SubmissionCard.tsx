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
    <div className="border border-(--color-fg) rounded-2xl p-3 flex flex-col gap-2">
      <img src={photoUrl} alt={guestName} className="rounded-xl aspect-square object-cover w-full" />
      <p className="font-medium text-(--color-fg)">{guestName}</p>
      <audio src={audioUrl} controls className="w-full" />
    </div>
  )
}
