import { createFileRoute } from '@tanstack/react-router'

// Placeholder route so the pathless `_authed` layout has a child (TanStack
// Router's file-based generator conflicts a childless pathless layout route
// with `index.tsx`'s `/`). Task 7 replaces this with the real dashboard.
export const Route = createFileRoute('/_authed/dashboard')({
  component: () => <p>dashboard stub (task 6 manual verification, superseded by Task 7)</p>,
})
