import { mkdir, rm, writeFile } from 'node:fs/promises'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { type BaseMessage, HumanMessage } from '@langchain/core/messages'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { VertexAIEmbeddings } from '@langchain/google-vertexai'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { validator } from 'hono/validator'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import z from 'zod'
import { env } from '../env'
import { storage } from '../libs/firebase'

const QuizListSchema: z.ZodType<{
  quizes: { question: string; answer: string; source: string }[]
}> = z.object({
  quizes: z
    .object({
      question: z.string(),
      answer: z.string(),
      source: z.string(),
    })
    .array(),
})

export const ChainResultSchema = z.object({
  result: QuizListSchema,
})

const RequestBodySchema = z.object({
  query: z.string(),
  vectorStoreSourcePrefix: z.string(),
})

export const search = new Hono()

search.post(
  '/',
  validator('json', (value) => {
    const parsed = RequestBodySchema.safeParse(value)
    if (!parsed.success)
      throw new HTTPException(400, { message: 'Invalid URL' })
    return parsed.data
  }),
  async (c) => {
    const { query: userQuery, vectorStoreSourcePrefix } = c.req.valid('json')

    const gpt35 = new ChatOpenAI({
      model: 'gpt-3.5-turbo',
      apiKey: env.OPENAI_API_KEY,
    })

    const gemini = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0,
      maxRetries: 2,
      apiKey: env.GEMINI_API_KEY,
    })

    const query = await gemini
      .invoke(
        `以下の質問を分かりやすい日本語に変換してください。\n以下変換対象\n\n---\n${userQuery}`,
      )
      .then((msg) => msg.content.toString())

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

    const tmpLocalVectorStorePathname = `/tmp/ssw-vector-${Date.now()}`
    const [files] = await storage.bucket().getFiles({
      prefix: vectorStoreSourcePrefix,
    })
    if (!files.length) {
      throw new HTTPException(404, { message: 'Vector store not found' })
    }
    await mkdir(tmpLocalVectorStorePathname)
    await Promise.all(
      files.map((file) =>
        writeFile(
          `${tmpLocalVectorStorePathname}/${file.name.split('/').at(-1)}`,
          file.createReadStream(),
        ),
      ),
    )
    const vectorStore = await FaissStore.load(
      tmpLocalVectorStorePathname,
      vertexAIEmbeddings ?? huggingFaceInferenceEmbeddings ?? openAIEmbeddings,
    )
    await rm(tmpLocalVectorStorePathname, { recursive: true, force: true })

    const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
      const lastMessage = params.messages.at(-1)
      if (lastMessage?.content) {
        return lastMessage.content
      }
      return ''
    }
    const retriever = vectorStore.asRetriever({
      searchKwargs: { fetchK: 6 },
    })
    const retrievalChain = RunnableSequence.from([
      parseRetrieverInput,
      retriever,
    ])

    const SYSTEM_TEMPLATE = `# Instructions
Please answer the following questions in Japanese.
If the context does not provide information for the question or if there is no clear source of information, just answer "わかりません。"
Do not speculate or create information. Be sure to answer in Japanese.

# Context
{context}

<context>
{context}
</context>
`
    const documentChain = await createStuffDocumentsChain({
      llm: gpt35,
      prompt: ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_TEMPLATE],
        new MessagesPlaceholder('messages'),
      ]),
    })

    const parser = StructuredOutputParser.fromZodSchema(QuizListSchema)
    const parserChain = RunnableSequence.from([
      (params: { query: string }) => {
        return {
          query: params.query,
          format_instructions: parser.getFormatInstructions(),
        }
      },
      ChatPromptTemplate.fromTemplate(
        'Answer the users question as best as possible.\n{format_instructions}\n{query}',
      ),
      gemini,
      parser,
    ])

    const chain = RunnablePassthrough.assign({
      context: retrievalChain,
    })
      .assign({
        query: documentChain,
      })
      .assign({
        result: parserChain,
      })

    const output: unknown = await chain
      .invoke({
        messages: [new HumanMessage(query)],
      })
      .catch(console.error)

    const { result } = ChainResultSchema.parse(output)
    return c.json({
      result,
    })
  },
)
