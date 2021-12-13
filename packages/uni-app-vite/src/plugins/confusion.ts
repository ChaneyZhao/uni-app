import path from 'path'
import { Plugin } from 'vite'
import {
  APP_CONFUSION_FILENAME,
  APP_SERVICE_FILENAME,
  hasConfusionFile,
  isConfusionFile,
  removeExt,
} from '@dcloudio/uni-cli-shared'
import { OutputChunk } from 'rollup'

export function uniConfusionPlugin(): Plugin {
  const inputDir = process.env.UNI_INPUT_DIR
  const hasConfusion =
    process.env.NODE_ENV === 'production' && hasConfusionFile(inputDir)
  return {
    name: 'vite:uni-app-confusion',
    enforce: 'post',
    apply: 'build',
    config() {
      if (!hasConfusion) {
        return
      }
      return {
        build: {
          rollupOptions: {
            output: {
              format: process.env.UNI_APP_CODE_SPLITING ? 'amd' : 'cjs',
              manualChunks(id) {
                if (isConfusionFile(path.relative(inputDir, id))) {
                  return removeExt(APP_CONFUSION_FILENAME)
                }
              },
            },
          },
        },
      }
    },
    generateBundle(_, bundle) {
      if (!hasConfusion) {
        return
      }
      const appConfusionChunk = bundle[APP_CONFUSION_FILENAME] as OutputChunk
      if (!appConfusionChunk) {
        return
      }
      appConfusionChunk.code = wrapperAppConfusionCode(appConfusionChunk.code)
      const appServiceChunk = bundle[APP_SERVICE_FILENAME] as OutputChunk
      if (!appServiceChunk) {
        return
      }
      appServiceChunk.code = wrapperAppServiceCode(appServiceChunk.code)
    },
  }
}

function replaceRequireVueCode(code: string) {
  return code.replace(/require\(['"]vue['"]\)/gi, `$cjs_require$('vue')`)
}
function replaceRequireAppConfusionCode(code: string) {
  return code.replace(
    new RegExp(`require\\(['"].\\/${APP_CONFUSION_FILENAME}['"]\\)`, 'gi'),
    `$cjs_require$('./${APP_CONFUSION_FILENAME}')`
  )
}

function wrapperAppServiceCode(code: string) {
  return replaceRequireAppConfusionCode(replaceRequireVueCode(code))
}

function wrapperAppConfusionCode(code: string) {
  return `function $cjs_require$(name){if(name==='vue'){return Vue;}if(name==='./${APP_CONFUSION_FILENAME}'){return $appConfusion$;}};const $appConfusion$ = {};(function(exports){${replaceRequireVueCode(
    code
  )}})($appConfusion$);
`
}