import { NoteContent, NoteInfo } from '@shared/models'
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

// loadNotesは、メインプロセスのgetNotesを呼び出してノートを取得する
const loadNotes = async () => {
  const notes = await window.context.getNotes() // メインプロセスのgetNotesを呼び出す

  // 更新順にソート
  return notes.sort((a, b) => b.lastEditTime - a.lastEditTime)
}

// notesAtomAsyncは、ノートの情報を非同期で取得する
const notesAtomAsync = atom<NoteInfo[] | Promise<NoteInfo[]>>(loadNotes()) // 初期値を関数で設定

// notesAtomは、notesAtomAsyncの値を展開して取得。unwrap関数は、非同期の値を同期の値に変換する。第一引数に非同期の値、第二引数に初期値を取る。
export const notesAtom = unwrap(notesAtomAsync, (prev) => prev) // 初期値を取得

export const selectedNoteIndexAtom = atom<number | null>(null)

// selectedNoteAtomは、notesAtomとselectedNoteIndexAtomの値を使って、選択されたノートを取得する
const selectedNoteAtomAsync = atom(async (get) => {
  const notes = get(notesAtom) // notesAtomの値を取得
  const selectedNoteIndex = get(selectedNoteIndexAtom) // selectedNoteIndexAtomの値を取得

  // selectedNoteIndexがnullの場合か、notesがnullの場合はnullを返す
  if (selectedNoteIndex == null || !notes) return null

  const selectedNote = notes[selectedNoteIndex] // 選択されたノートを取得

  const noteContent = await window.context.readNote(selectedNote.title) // メインプロセスのreadNotesを呼び出す

  return {
    ...selectedNote,
    content: noteContent // ノートの内容を追加
  }
})

// selectedNoteAtomは、selectedNoteAtomAsyncの値を展開して取得。unwrap関数は、非同期の値を同期の値に変換する。第一引数に非同期の値、第二引数に初期値を取る。
export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  // 初期値を取得。初期値がnullの場合は、titleとcontentを空文字、lastEditTimeを現在時刻に設定
  (prev) =>
    prev ?? {
      title: '',
      content: '',
      lastEditTime: Date.now()
    }
)

export const saveNoteAtom = atom(null, async (get, set, newContent: NoteContent) => {
  const notes = get(notesAtom) // notesAtomの値を取得
  const selectedNote = get(selectedNoteAtom) // selectedNoteAtomの値を取得

  if (!selectedNote || !notes) return // 選択されたノートがない場合か、notesがnullの場合は何もしない

  await window.context.writeNote(selectedNote.title, newContent) // メインプロセスのwriteNoteを呼び出す

  set(
    notesAtom, // notesAtomの値を更新
    notes.map((note) => {
      if (note.title === selectedNote.title) {
        // 選択されたノートの場合
        return {
          ...note,
          lastEditTime: Date.now() // 最終更新日時を更新
        }
      }
      return note
    })
  )
})

// createEmptyNoteAtomは、新しいノートを作成する
export const createEmptyNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom) // notesAtomの値を取得
  if (!notes) return // notesがnullの場合は何もしない

  const title = await window.context.createNote() // メインプロセスのcreateNoteを呼び出す
  if (!title) return // titleがnullの場合は何もしない

  const newNote: NoteInfo = {
    title,
    lastEditTime: Date.now()
  }

  // 新しいノートを追加。ただし、同じタイトルのノートがある場合は、そのノートを上書き
  set(notesAtom, [newNote, ...notes.filter((note) => note.title !== newNote.title)])

  // 新しいノートを選択。selectedNoteIndexAtomの値を更新
  set(selectedNoteIndexAtom, 0)
})

// deleteNoteAtomは、選択されたノートを削除する
export const deleteNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom) // notesAtomの値を取得
  const selectedNote = get(selectedNoteAtom) // selectedNoteAtomの値を取得

  if (!selectedNote || !notes) return // 選択されたノートがない場合か、notesがnullの場合は何もしない
  // 選択されたノートを削除。ただし、選択されたノートがない場合は何もしない

  const isDeleted = await window.context.deleteNote(selectedNote.title) // メインプロセスのdeleteNoteを呼び出す
  if (!isDeleted) return // 削除に失敗した場合は何もしない

  const newNotes = notes.filter((note) => note.title !== selectedNote.title)
  set(notesAtom, newNotes) // notesAtomの値を更新

  set(selectedNoteIndexAtom, null) // selectedNoteIndexAtomの値をnullに更新
})
