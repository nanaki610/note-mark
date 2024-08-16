import { MDXEditorMethods } from '@mdxeditor/editor'
import { saveNoteAtom, selectedNoteAtom } from '@renderer/store'
import { autoSaveInterval } from '@shared/constants'
import { NoteContent } from '@shared/models'
import { useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash'
import { useRef } from 'react'

export const useMarkdownEditor = () => {
  const selectedNote = useAtomValue(selectedNoteAtom) // 選択されたノートを取得
  const saveNote = useSetAtom(saveNoteAtom) // ノートを保存する関数を取得
  const editorRef = useRef<MDXEditorMethods>(null) // エディターの参照を作成

  // オートセーブを行う
  const handleAutoSaving = throttle(
    // throttle: 一定時間内に複数回呼び出された場合、最後の呼び出しから一定時間経過後に処理を実行する
    async (content: NoteContent) => {
      if (!selectedNote) return // 選択されたノートがない場合は何もしない

      console.info('Auto saving:', selectedNote.title)
      await saveNote(content)
    },
    autoSaveInterval, // 3秒間の間に一度しか処理を実行しない
    {
      leading: false, // 最初の呼び出しで処理を実行しない
      trailing: true // 最後の呼び出しで処理を実行する
    }
  )

  const handleBlur = async () => {
    if (!selectedNote) return

    // throttle.cancel: throttleで設定した処理をキャンセルする
    handleAutoSaving.cancel()

    const content = editorRef.current?.getMarkdown() // エディターの内容を取得

    if (content != null) {
      await saveNote(content)
    }
  }

  return {
    editorRef,
    selectedNote,
    handleAutoSaving,
    handleBlur
  }
}
