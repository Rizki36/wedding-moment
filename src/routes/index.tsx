import { createFileRoute } from '@tanstack/react-router'
import { LinkButton } from '#/components/ui/Button'
import { Badge } from '#/components/ui/Badge'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="bg-(--color-bg) min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
        <Badge className="mb-2">♥</Badge>
        <h1 className="font-(--font-display) text-(--color-fg) text-4xl sm:text-6xl uppercase leading-tight tracking-tight">
          Kenangan Diabadikan
          <br />
          di Setiap Momen
        </h1>
        <p className="text-(--color-fg-muted) max-w-md">
          Ambil foto dan rekam ucapan untuk pengantin, langsung dari ponsel Anda — tanpa aplikasi, cukup pindai
          kode QR.
        </p>
        <div className="flex gap-4 flex-wrap justify-center mt-2">
          <LinkButton to="/login">Masuk</LinkButton>
          <LinkButton to="/register" variant="outline">
            Daftar
          </LinkButton>
        </div>
      </div>
    </main>
  )
}

export default Home
