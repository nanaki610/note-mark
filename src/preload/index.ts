import { deleteNote } from '@/lib'
import { CreateNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

// contextIsolationが有効であることを確認
if (!process.contextIsolated) {
  throw new Error('contextIsolationを有効にしてください')
}

try {
  // メインプロセスのAPIをレンダラープロセスに公開
  // contextBridgeはレンダラープロセスとメインプロセスの間でAPIを安全にやり取りするための機能
  // .exposeInMainWorldメソッドはレンダラープロセスのwindowオブジェクトにAPIを公開する。第一引数は公開する名前、第二引数は公開するAPI
  contextBridge.exposeInMainWorld('context', {
    // ここに公開したいAPIを追加
    locale: navigator.language, // ブラウザの言語設定を取得
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args), // メインプロセスのgetNotesを呼び出す
    //ipcRenderer.invoke()はメインプロセスにメッセージを送信し、メインプロセスからの応答を待つ。第一引数はメッセージ名、第二引数はメッセージに渡す引数

    readNote: (...args: Parameters<ReadNote>) => ipcRenderer.invoke('readNote', ...args), // メインプロセスのreadNoteを呼び出す
    writeNote: (...args: Parameters<WriteNote>) => ipcRenderer.invoke('writeNote', ...args), // メインプロセスのwriteNoteを呼び出す
    createNote: (...args: Parameters<CreateNote>) => ipcRenderer.invoke('createNote', ...args), // メインプロセスのcreateNoteを呼び出す
    // eslint-disable-next-line prettier/prettier
    deleteNote: (...args: Parameters<typeof deleteNote>) => ipcRenderer.invoke('deleteNote', ...args) // メインプロセスのdeleteNoteを呼び出す
  })
} catch (error) {
  // エラーが発生した場合にログを出力
  console.error(error)
}
