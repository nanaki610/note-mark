import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  // mainフォルダはElectronのメインプロセスのコードが入っているフォルダ
  main: {
    plugins: [externalizeDepsPlugin()], // メインプロセスの依存関係を外部化するプラグイン
    resolve: {
      // メインプロセスのコードで使用するエイリアスを設定
      alias: {
        // エイリアスの設定
        '@/lib': resolve('src/main/lib'),
        '@shared': resolve('src/shared')
      }
    }
  },
  // preloadフォルダはElectronのプリロードスクリプトが入っているフォルダ
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  // rendererフォルダはElectronのレンダラープロセスのコードが入っているフォルダ
  renderer: {
    assetsInclude: 'src/renderer/assets/**',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
        '@/hooks': resolve('src/renderer/src/hooks'),
        '@/assets': resolve('src/renderer/src/assets'),
        '@/store': resolve('src/renderer/src/store'),
        '@/components': resolve('src/renderer/src/components'),
        '@/mocks': resolve('src/renderer/src/mocks')
      }
    },
    plugins: [react()]
  }
})
