import path from 'path'
import qs from 'querystring'
import { EXTNAME_JS_RE, EXTNAME_VUE } from '../../constants'

export interface VueQuery {
  vue?: boolean
  src?: boolean
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  lang?: string
  raw?: boolean
  mpType?: 'page'
}

export function parseVueRequest(id: string) {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query = qs.parse(rawQuery) as VueQuery
  if (query.vue != null) {
    query.vue = true
  }
  if (query.src != null) {
    query.src = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  return {
    filename,
    query,
  }
}

const importQueryRE = /(\?|&)import(?:&|$)/
export const isImportRequest = (url: string) => importQueryRE.test(url)

export const queryRE = /\?.*$/
export const hashRE = /#.*$/

export const cleanUrl = (url: string) =>
  url.replace(hashRE, '').replace(queryRE, '')

export function isJsFile(id: string) {
  const isJs = EXTNAME_JS_RE.test(id)
  if (isJs) {
    return true
  }
  const { filename, query } = parseVueRequest(id)
  const isVueJs = EXTNAME_VUE.includes(path.extname(filename)) && !query.vue
  if (isVueJs) {
    return true
  }
  return false
}
