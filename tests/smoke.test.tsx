import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Index from '../src/routes/index'

describe('home route', () => {
  it('renders the Wedding Moment heading', () => {
    render(<Index />)
    expect(screen.getByRole('heading', { name: /wedding moment/i })).toBeInTheDocument()
  })
})
