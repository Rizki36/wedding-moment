import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="font-(--font-display) text-(--color-fg) bg-(--color-bg) min-h-screen flex items-center justify-center">
      <h1 className="text-4xl">Wedding Moment</h1>
    </main>
  )
}

export default Home
