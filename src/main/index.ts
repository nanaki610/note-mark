/* eslint-disable prettier/prettier */
import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // ブラウザウィンドウを作成
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true, // メニューバーを非表示
    ...(process.platform === 'linux' ? { icon } : {}), // Linuxの場合はアイコンを設定
    center: true, // ウィンドウを中央に配置
    title: 'NoteMark', // ウィンドウのタイトル
    frame: false, // ウィンドウのフレームを非表示
    vibrancy: 'under-window', // ウィンドウの背景を透明にする
    visualEffectState: 'active', // ウィンドウのビジュアルエフェクトを有効にする
    titleBarStyle: 'hidden', // ウィンドウのタイトルバーを非表示
    trafficLightPosition: { x: 15, y: 10 }, // ウィンドウの閉じる、最小化、最大化ボタンの位置を設定
    // メインプロセスのコードで使用するエイリアスを設定
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // プリロードスクリプトを設定。これにより、レンダラープロセスでNode.jsのAPIを使用できる
      sandbox: true, // サンドボックスモードを有効にする。これにより、レンダラープロセスがファイルシステムにアクセスできなくなる
      contextIsolation: true // コンテキスト分離を有効にする。これにより、レンダラープロセスからメインプロセスのAPIに直接アクセスできなくなる
    }
  })

  // レンダラープロセスに渡すデータを設定
  mainWindow.on('ready-to-show', () => { // ウィンドウが表示される準備ができたときに発生
    mainWindow.show() // ウィンドウを表示
  })

  // レンダラープロセスからのメッセージを受信
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url) // レンダラープロセスからのリンクをブラウザで開く
    return { action: 'deny' } // リンクを開かない
  })

  // electron-vite cliをベースにしたレンダラーのHMR
  // 開発時はリモートURLを読み込み、本番時はローカルのHTMLファイルを読み込む
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) { // 開発時かつELECTRON_RENDERER_URLが設定されている場合
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']) // レンダラープロセスのURLを設定
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')) // レンダラープロセスのファイルを設定
  }
}

// このメソッドはElectronが初期化を終え、ブラウザウィンドウを作成する準備ができたときに呼び出されます。
// ブラウザウィンドウを作成する準備ができたときに呼び出されます。
// このイベントが発生した後にのみ、一部のAPIを使用できます。
app.whenReady().then(() => { // WindowsのアプリケーションユーザーモデルIDを設定
  electronApp.setAppUserModelId('com.electron') // アプリケーションのユーザーモデルIDを設定

  // 開発時にF12でDevToolsを開いたり閉じたりする
  // 本番環境ではCommandOrControl + Rを無視する
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => { // ブラウザウィンドウが作成されたときに発生
    optimizer.watchWindowShortcuts(window) // ウィンドウのショートカットを監視
  })

  // .on()はIPC通信を行うメソッド。第一引数にはメッセージ名、第二引数にはメッセージを受信したときに実行する関数を指定します。
  // .handle()との違いは、.on()はレンダラープロセスからのメッセージを受信するたびに実行されるのに対して、.handle()は一度だけ実行される点です。
  ipcMain.on('ping', () => console.log('pong')) // pingを受信したらpongを出力

  //.handle()はIPC通信を行うメソッド。第一引数にはメッセージ名、第二引数にはメッセージを受信したときに実行する関数を指定します。
  //第二引数の関数は、第一引数にはイベントオブジェクト、第二引数以降にはレンダラープロセスからのメッセージを受け取ります。
  //第二引数の関数で、第一引数が_(アンダースコア)にしているのは、第一引数はイベントオブジェクトであり、関数の中で使用しないためです。
  ipcMain.handle('getNotes', (_, ...args: Parameters<GetNotes>) => getNotes(...args)) // getNotesを受信したらgetNotesを実行
  ipcMain.handle('readNote', (_, ...args: Parameters<ReadNote>) => readNote(...args)) // readNoteを受信したらreadNoteを実行
  ipcMain.handle('writeNote', (_, ...args: Parameters<WriteNote>) => writeNote(...args)) // writeNoteを受信したらwriteNoteを実行
  ipcMain.handle('createNote', (_, ...args: Parameters<CreateNote>) => createNote(...args)) // createNoteを受信したらcreateNoteを実行
  ipcMain.handle('deleteNote', (_, ...args: Parameters<DeleteNote>) => deleteNote(...args)) // deleteNoteを受信したらdeleteNoteを実行
  createWindow() // ウィンドウを作成

  app.on('activate', function () {
    // macOSでは、アプリケーション内にウィンドウがないときにdockアイコンがクリックされると、ウィンドウを再作成するのが一般的です。
    if (BrowserWindow.getAllWindows().length === 0) createWindow() // ウィンドウがない場合はウィンドウを作成
  })
})

// すべてのウィンドウが閉じられたときに終了しますが、macOSでは一般的に、
// ユーザーがCmd + Qを押すまでアクティブなままにするため、アプリケーションとメニューバーがアクティブなままになります。
app.on('window-all-closed', () => { // すべてのウィンドウが閉じられたときに発生
  // eslint-disable-next-line prettier/prettier
  if (process.platform !== 'darwin') { // macOS以外の場合
    app.quit() // アプリケーションを終了
  }
})

// このファイルには、アプリケーションの残りのメインプロセス固有のコードを含めることができます。
// それらを別々のファイルに配置し、ここでrequireすることもできます。
