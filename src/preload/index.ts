import { contextBridge } from 'electron'

// contextIsolationが有効であることを確認
if (!process.contextIsolated) {
  throw new Error('contextIsolationを有効にしてください')
}

try {
  // メインプロセスのAPIをレンダラープロセスに公開
  contextBridge.exposeInMainWorld('context', {
    // ここに公開したいAPIを追加
    // 例:
    // ipcRenderer: ipcRenderer
  })
} catch (error) {
  // エラーが発生した場合にログを出力
  console.error(error)
}
