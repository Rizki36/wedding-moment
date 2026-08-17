// @vitest-environment node
import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { db } from '../src/server/db/client'
import { sql } from 'drizzle-orm'

describe('database connection', () => {
  it('connects and runs a trivial query', async () => {
    const result = await db.execute(sql`select 1 as one`)
    expect(result.rows[0].one).toBe(1)
  })
})
