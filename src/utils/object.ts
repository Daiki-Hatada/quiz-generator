import type { ZodSchema } from 'zod'

export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null
export const pick = <T extends object, K extends keyof T>(
  base: T,
  keys: K[],
): Pick<T, K> => {
  const entries: [K, T[K]][] = keys.map((key) => [key, base[key]])
  return Object.fromEntries(entries) as Pick<T, K> // entries[number][0] がKであり[1]がvalueなのでasを使っても問題ない
}
export const omit = <T, K extends readonly string[]>(
  value: T,
  keysToOmit: K,
): Omit<T, K[number]> => {
  if (typeof value !== 'object' || value === null) return value
  keysToOmit.forEach((key) => {
    if (key in value)
      delete (value as unknown as Record<typeof key, unknown>)[key]
  })
  return value
}
export const getKeyMapping = <T extends object>(
  value: T,
): { [K in keyof T]: K } =>
  Object.fromEntries(Object.keys(value).map((key) => [key, key])) as {
    [K in keyof T]: K
  }

export const omitId = <T extends { id?: unknown }>(value: T): Omit<T, 'id'> =>
  omit(value, ['id'] as const)
export const deleteUndefinedKeys = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, value]) =>
      value !== undefined ? [[key, value]] : [],
    ),
  ) as T
// valueがundefinedの可能性があるobjectからkey valueを削除しているだけなので、型は変わらない。そのためas を使ってキャストしている
export const required = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, value]) =>
      value !== undefined ? [[key, value]] : [],
    ),
  ) as T
export const keys = <T extends object>(value: T) =>
  Object.keys(value) as (keyof T & string)[]
export const isKey = <T extends object>(
  value: PropertyKey,
  obj: T,
): value is keyof T => Object.keys(obj).includes(value as keyof T & string)

export const values = <T extends object>(value: T) =>
  Object.values(value) as T[keyof T][]
export const isValue = <T extends object>(
  value: unknown,
  obj: T,
): value is T[keyof T] => Object.values(obj).includes(value)

export const splitObject = <T extends { [key: string]: unknown }>(
  obj: T,
): T[] => Object.entries(obj).map(([key, value]) => ({ [key]: value })) as T[]

export const isEmpty = (value: object) => Object.keys(value).length === 0

export const jsonSafeParse = <T, S extends ZodSchema<T>>(
  value: string,
  schema: S,
): T | undefined => {
  try {
    const raw: unknown = JSON.parse(value)
    const result = schema.safeParse(raw)
    if (!result.success) return undefined
    return result.data
  } catch {
    return undefined
  }
}
