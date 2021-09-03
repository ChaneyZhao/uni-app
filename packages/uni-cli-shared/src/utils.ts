import fs from 'fs'
import os from 'os'
import path from 'path'
import { camelize, capitalize } from '@vue/shared'
import { once } from '@dcloudio/uni-shared'
export { default as hash } from 'hash-sum'

import { PAGE_EXTNAME, PAGE_EXTNAME_APP } from './constants'
export const isWindows = os.platform() === 'win32'
export function normalizePath(id: string): string {
  return isWindows ? id.replace(/\\/g, '/') : id
}

export const resolveMainPathOnce = once((inputDir: string) => {
  const mainTsPath = path.resolve(inputDir, 'main.ts')
  if (fs.existsSync(mainTsPath)) {
    return normalizePath(mainTsPath)
  }
  return normalizePath(path.resolve(inputDir, 'main.js'))
})

export function resolveBuiltIn(path: string) {
  return require.resolve(path, { paths: [process.env.UNI_CLI_CONTEXT] })
}

export function normalizeIdentifier(str: string) {
  return capitalize(camelize(str.replace(/\//g, '-')))
}

export function normalizePagePath(pagePath: string, platform: UniApp.PLATFORM) {
  const absoltePagePath = path.resolve(process.env.UNI_INPUT_DIR, pagePath)
  let extnames = PAGE_EXTNAME
  if (platform === 'app') {
    extnames = PAGE_EXTNAME_APP
  }
  for (let i = 0; i < extnames.length; i++) {
    const extname = extnames[i]
    if (fs.existsSync(absoltePagePath + extname)) {
      return pagePath + extname
    }
  }
  console.error(`${pagePath} not found`)
}

export function removeExt(str: string, ext?: string) {
  if (ext) {
    const reg = new RegExp(ext.replace(/\./, '\\.') + '$')
    return normalizePath(str.replace(reg, ''))
  }
  return normalizePath(str.replace(/\.\w+$/g, ''))
}