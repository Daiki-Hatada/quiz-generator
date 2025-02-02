import { describe, expect, it } from 'vitest'
import z from 'zod'
import { app } from '../src/app'

const ResponseSchema = z.object({
  message: z.literal('Success'),
})

describe('embedding reqeust', {
  timeout: 15000,
}, () => {
  it('should embed', async () => {
    const res = await app.request('/api/v0/embedding', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        path: './docs/ssw2_jf_customer_service_text_ja_v231227.pdf',
        vectorStoreSourcePrefix: 'ssw-vector',
      }),
    })
    const data: unknown = await res.json()
    expect(ResponseSchema.safeParse(data).success).toBeTruthy()
  })
})
