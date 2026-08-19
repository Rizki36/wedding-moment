// @vitest-environment node
import 'dotenv/config'
import { describe, it, expect, vi } from 'vitest'
import { Route } from '../src/routes/api/cron.purge'

const postHandler = (Route.options.server!.handlers as { POST: (ctx: { request: Request }) => Promise<Response> })
  .POST

describe('cron purge route', () => {
  it('rejects requests with no secret header', async () => {
    const request = new Request('http://localhost/api/cron/purge', { method: 'POST' })
    const response = await postHandler({ request })
    expect(response.status).toBe(401)
  })

  it('rejects requests with the wrong secret header', async () => {
    vi.stubEnv('CRON_SECRET', 'test-secret')
    const request = new Request('http://localhost/api/cron/purge', {
      method: 'POST',
      headers: { 'x-cron-secret': 'wrong-secret' },
    })
    const response = await postHandler({ request })
    expect(response.status).toBe(401)
    vi.unstubAllEnvs()
  })

  it('purges all due events when the secret matches', async () => {
    vi.stubEnv('CRON_SECRET', 'test-secret')
    const request = new Request('http://localhost/api/cron/purge', {
      method: 'POST',
      headers: { 'x-cron-secret': 'test-secret' },
    })
    const response = await postHandler({ request })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.purgedCount).toBe('number')
    vi.unstubAllEnvs()
  }, 30000)
})
