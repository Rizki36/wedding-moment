// @vitest-environment node
import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { db } from '../src/server/db/client'
import { sql } from 'drizzle-orm'

describe('schema', () => {
  it('creates events, frames, submissions tables', async () => {
    const rows = await db.execute(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name in ('events', 'frames', 'submissions')
    `)
    const names = rows.rows.map((r: any) => r.table_name).sort()
    expect(names).toEqual(['events', 'frames', 'submissions'])
  })
})
