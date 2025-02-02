import { rm } from 'node:fs/promises'
import path from 'node:path'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { VertexAIEmbeddings } from '@langchain/google-vertexai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import type { getStorage } from 'firebase-admin/storage'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { validator } from 'hono/validator'
import z from 'zod'
import { env } from '../env'
import { storage } from '../libs/firebase'
import { listLocalFilePaths } from '../utils/file'

async function uploadDirectory(
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  directoryPath: string,
  prefix = '',
) {
  let successfulUploads = 0
  for await (const filePath of listLocalFilePaths(directoryPath)) {
    try {
      const dirname = path.dirname(directoryPath)
      const subDirname = path.relative(dirname, filePath).split(path.sep)[0]
      const destination = path.join(prefix, path.relative(subDirname, filePath))
      await bucket.upload(filePath, { destination })
      successfulUploads++
    } catch (e) {
      console.error(`Error uploading ${filePath}:`, e)
    }
  }
}

const RequestBodySchema = z.object({
  url: z.string().optional(),
  path: z.string().optional(),
  vectorStoreSourcePrefix: z.string(),
})

export const embedding = new Hono()

const loadPdfDocs = async (path: string) => {
  const loader = new PDFLoader(path)
  return loader.load()
}

embedding.post(
  '/',
  validator('json', (value) => {
    const parsed = RequestBodySchema.safeParse(value)
    if (!parsed.success)
      throw new HTTPException(400, { message: 'Invalid URL' })
    return parsed.data
  }),
  async (c) => {
    const { path, vectorStoreSourcePrefix } = c.req.valid('json')
    const docs = path !== undefined ? await loadPdfDocs(path) : []

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 75,
    })
    const huggingFaceInferenceEmbeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: env.HUGGINGFACE_ACCESS_TOKEN,
      model: 'intfloat/multilingual-e5-large',
    })
    const openAIEmbeddings = new OpenAIEmbeddings({
      apiKey: env.OPENAI_API_KEY,
    })
    const vertexAIEmbeddings = new VertexAIEmbeddings({
      model: 'text-multilingual-embedding-002',
      authOptions: {
        projectId: env.PROJECT_ID,
        credentials: {
          client_email: env.CLIENT_EMAIL,
          private_key: env.PRIVATE_KEY,
        },
      },
    })

    const docSplits = await textSplitter.splitDocuments(docs)
    const vectorStore = await FaissStore.fromDocuments(
      docSplits,
      vertexAIEmbeddings ?? huggingFaceInferenceEmbeddings ?? openAIEmbeddings,
    )

    const tmpLocalVectorStorePathname = `/tmp/ssw-vector-${Date.now()}`
    await vectorStore.save(tmpLocalVectorStorePathname)
    await uploadDirectory(
      storage.bucket(),
      tmpLocalVectorStorePathname,
      vectorStoreSourcePrefix,
    )
    await rm(tmpLocalVectorStorePathname, { recursive: true, force: true })
    return c.json({
      message: 'Success',
    })
  },
)
