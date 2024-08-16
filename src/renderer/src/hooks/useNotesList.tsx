import { notesAtom, selectedNoteIndexAtom } from '@renderer/store'
import { useAtom, useAtomValue } from 'jotai'

// このフックの概要: ノートリストの情報を取得するフックです。引数には、ノートが選択された際に実行する関数を受け取ります。
// このフックは、ノートリストの情報と選択されたノートのインデックスを返します。
// ノートが選択された際には、引数に渡された関数を実行します。
// このフックは、src/renderer/src/components/NotePreviewList.tsxで使用されます。
export const useNoteList = ({ onSelect }: { onSelect?: () => void }) => {
  const notes = useAtomValue(notesAtom) // notesAtomの値を取得

  const [selectedNoteIndex, setSelectedNoteIndex] = useAtom(selectedNoteIndexAtom) // selectedNoteIndexAtomの値と更新関数を取得。初期値はselectedNoteIndexAtomの初期値=null

  const handleNoteSelect = (index: number) => async () => {
    setSelectedNoteIndex(index) // selectedNoteIndexAtomの値を更新

    if (onSelect) {
      onSelect()
    }
  }

  return {
    notes,
    selectedNoteIndex,
    handleNoteSelect
  }
}
