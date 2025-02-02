import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

export async function* listLocalFilePaths(
  directory: string,
): AsyncGenerator<string> {
  for (const file of await readdir(directory)) {
    const fullPath = path.join(directory, file)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      yield* listLocalFilePaths(fullPath)
    }

    if (stats.isFile()) {
      yield fullPath
    }
  }
}
