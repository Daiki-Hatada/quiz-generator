export const env = {
  CLIENT_EMAIL: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.CLIENT_EMAIL !== 'string')
      throw new Error('`CLIENT_EMAIL` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.CLIENT_EMAIL
  })(),
  HUGGINGFACE_ACCESS_TOKEN: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.HUGGINGFACE_ACCESS_TOKEN !== 'string')
      throw new Error('`HUGGINGFACE_ACCESS_TOKEN` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.HUGGINGFACE_ACCESS_TOKEN
  })(),
  OPENAI_API_KEY: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.OPENAI_API_KEY !== 'string')
      throw new Error('`OPENAI_API_KEY` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.OPENAI_API_KEY
  })(),
  PRIVATE_KEY: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.PRIVATE_KEY !== 'string')
      throw new Error('`PRIVATE_KEY` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  })(),
  PROJECT_ID: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.PROJECT_ID !== 'string')
      throw new Error('`PROJECT_ID` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.PROJECT_ID
  })(),
  STORAGE_BUCKET: (() => {
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    if (typeof process.env.STORAGE_BUCKET !== 'string')
      throw new Error('`STORAGE_BUCKET` is not properly set.')
    // biome-ignore lint/nursery/noProcessEnv: This is the only place where we should be using `process.env`.
    return process.env.STORAGE_BUCKET
  })(),
}
