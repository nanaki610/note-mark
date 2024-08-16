import { appDirectoryName, fileEncoding, welcomeNoteFileName } from '@shared/constants'
import { NoteInfo } from '@shared/models'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { dialog } from 'electron'
import { ensureDir, readdir, readFile, remove, stat, writeFile } from 'fs-extra'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
import welcomeNoteFile from '../../../resources/welcomeNote.md?asset'; // welcomeNote.mdをインポートする。?assetを付けることで、ビルド時にアセットとして取り込む。

// ルートディレクトリを取得する
export const getRootDir = () => {
  return getOS() === 'macOS'
    ? `${homedir()}/${appDirectoryName}`
    : `${homedir()}\\${appDirectoryName}`
}

// ルートディレクトリにあるノートを取得する
export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir() // ルートディレクトリを取得する

  await ensureDir(rootDir) // ディレクトリが存在しない場合は作成する

  // ルートディレクトリ内のファイル名を取得する
  const notesFileNames = await readdir(rootDir, {
    // readdir: ディレクトリ内のファイル名を取得する
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md')) // .mdファイルのみを取得する

  if (isEmpty(notes)) {
    console.info('No notes found, creating a welcome note') // ログを出力する
    const content = await readFile(welcomeNoteFile, { encoding: fileEncoding }) // welcomeNote.mdの内容を取得する
    getOS() === 'macOS'
      ? await writeFile(`${rootDir}/${welcomeNoteFileName}`, content, { encoding: fileEncoding })
      : await writeFile(`${rootDir}\\${welcomeNoteFileName}`, content, { encoding: fileEncoding }) // Welcome.mdを作成する
    notes.push(welcomeNoteFileName) // Welcome.mdを追加する
  }

  return Promise.all(notes.map(getNoteInfoFromFilename)) // ファイル名からノート情報を取得する
}

// ファイル名からノート情報を取得する
export const getNoteInfoFromFilename = async (filename: string): Promise<NoteInfo> => {
  const fileStats =
    getOS() === 'macOS'
      ? await stat(`${getRootDir()}/${filename}`)
      : await stat(`${getRootDir()}\\${filename}`) // ファイルの情報を取得する
  return {
    title: filename.replace('.md', ''), // 拡張子を削除してタイトルを取得する
    lastEditTime: fileStats.mtimeMs // 最終更新日時を取得する
  }
}

export const readNote: ReadNote = async (filename) => {
  const rootDir = getRootDir() // ルートディレクトリを取得する

  return getOS() === 'macOS'
    ? readFile(`${rootDir}/${filename}.md`, { encoding: fileEncoding })
    : readFile(`${rootDir}\\${filename}.md`, { encoding: fileEncoding }) // ファイルを読み込む
}

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir() // ルートディレクトリを取得する

  console.info(`Writing note ${filename}`) // ログを出力する
  return getOS() === 'macOS'
    ? writeFile(`${rootDir}/${filename}.md`, content, { encoding: fileEncoding })
    : writeFile(`${rootDir}\\${filename}.md`, content, { encoding: fileEncoding }) // ファイルに書き込む
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir() // ルートディレクトリを取得する

  await ensureDir(rootDir) // ディレクトリが存在しない場合は作成する

  // ノートの保存先を選択するダイアログを表示する
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'New note', // タイトル
    defaultPath: getOS() === 'macOS' ? `${rootDir}/Untitled.md` : `${rootDir}\\Untitled.md`, // デフォルトのパス
    buttonLabel: 'Create', // ボタンのラベル
    properties: ['showOverwriteConfirmation'], // 上書き確認を表示する
    showsTagField: false, // タグフィールドを表示しない
    filters: [{ name: 'Markdown', extensions: ['md'] }] // フィルターを設定する。拡張子が.mdのファイルのみを表示する。
  })
  if (canceled || !filePath) {
    console.info('Note creation canceled') // ログを出力する
    return false
  }

  const { name: filename, dir: parentDir } = path.parse(filePath) // ファイルパスからファイル名と親ディレクトリを取得する

  if (parentDir !== rootDir) {
    console.error('Invalid parent directory') // エラーログを出力する
    // ダイアログを表示する
    await dialog.showMessageBox({
      title: '作成に失敗', // タイトル
      message: `ノートは${rootDir}に保存してください`, // メッセージ
      type: 'error' // エラータイプ
    })
    return false
  }
  console.info(`Creating note: ${filePath}`) // ログを出力する
  await writeFile(filePath, '') // ファイルを作成する
  return filename // ファイル名を返す
}

export const deleteNote: DeleteNote = async (filename) => {
  const rootDir = getRootDir() // ルートディレクトリを取得する

  const { response } = await dialog.showMessageBox({
    type: 'warning', // 警告タイプ
    title: 'Delete note', // タイトル
    message: `${filename}を削除しますか？`, // メッセージ
    buttons: ['Delete', 'Cancel'], // ボタン
    defaultId: 1, // デフォルトのボタン。1はCancelで0はDelete
    cancelId: 1 // キャンセルボタンのID
  })

  // eslint-disable-next-line prettier/prettier
  if (response === 1) { // キャンセルボタンが押された場合
    console.info(`Note deletion canceled: ${filename}`) // ログを出力する
    return false
  }

  console.info(`Deleting note: ${filename}`) // ログを出力する
  getOS() === 'macOS'
    ? await remove(`${rootDir}/${filename}.md`)
    : await remove(`${rootDir}\\${filename}.md`) // ファイルを削除する
  return true
}

const getOS = () => {
  switch (process.platform) {
    case 'win32':
      return 'Windows'
    case 'darwin':
      return 'macOS'
    case 'linux':
      return 'Linux'
    default:
      return 'Unknown'
  }
}
