import { describe, expect, it } from 'vitest'
import z from 'zod'
import { app } from '../src/app'
import { ChainResultSchema } from '../src/routes/search'

const ResponseSchema = z.object({
  result: ChainResultSchema.shape.result,
})

describe(
  'search request',
  {
    timeout: 30000,
  },
  () => {
    it('should search', async () => {
      const input = {
        query:
          '飲食店の接客のQSCAとはなんでしょうか？それに関する問題を10問作ってください。それぞれの回答を該当箇所の章番号を添えて教えてください。',
        vectorStoreSourcePrefix: 'ssw-vector',
      }
      const res = await app.request('/api/v0/search', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(input),
      })
      const data: unknown = await res.json()
      expect(ResponseSchema.safeParse(data).success).toBeTruthy()
    })
  },
)
