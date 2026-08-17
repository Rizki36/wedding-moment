// @vitest-environment node
import 'dotenv/config'
import { describe, it, expect, afterAll } from 'vitest'
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, R2_BUCKET_NAME } from '../src/server/storage/r2-client'

const testKey = 'events/test-event/submissions/test-sub/photo.jpg'

describe('R2 client', () => {
  it('puts and gets an object', async () => {
    await s3Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from('test-content'),
      ContentType: 'image/jpeg',
    }))

    const result = await s3Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: testKey }))
    const body = await result.Body!.transformToString()
    expect(body).toBe('test-content')
  })

  afterAll(async () => {
    await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: testKey }))
  })
})
