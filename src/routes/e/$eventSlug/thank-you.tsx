import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '#/components/ui/Badge'

export const Route = createFileRoute('/e/$eventSlug/thank-you')({
  component: () => (
    <div className="bg-(--color-surface) min-h-screen p-8 text-center flex flex-col items-center gap-4 justify-center">
      <Badge>♥</Badge>
      <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">Terima kasih!</h1>
      <p className="text-(--color-on-surface-variant)">Ucapan Anda telah tersimpan untuk pengantin.</p>
    </div>
  ),
})
