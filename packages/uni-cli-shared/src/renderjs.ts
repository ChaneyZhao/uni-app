import { parseVueRequest } from './vite/utils/url'

const WXS_RE = /vue&type=wxs/
export function isWxs(id: string) {
  return WXS_RE.test(id)
}

const RENDERJS_RE = /vue&type=renderjs/
export function isRenderjs(id: string) {
  return RENDERJS_RE.test(id)
}

export function parseRenderjs(id: string) {
  if (isWxs(id)) {
    const { query, filename } = parseVueRequest(id)
    return {
      type: 'wxs',
      name: (query as any).name as string,
      filename,
    } as const
  }
  if (isRenderjs(id)) {
    const { query, filename } = parseVueRequest(id)
    return {
      type: 'renderjs',
      name: (query as any).name as string,
      filename,
    } as const
  }
  return {
    type: '',
    name: '',
    filename: '',
  } as const
}

export function missingModuleName(type: 'wxs' | 'renderjs', code: string) {
  return `<script module="missing module name" lang="${type}">
${code}
</script>`
}
