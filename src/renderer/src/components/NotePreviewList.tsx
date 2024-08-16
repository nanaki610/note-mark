import { NotePreview } from '@/components/NotePreview'
import { useNoteList } from '@/hooks/useNotesList'
import { isEmpty } from 'lodash'
import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

// NotePreviewListProps型は、ul要素のプロパティと、onSelectプロパティを持つ
export type NotePreviewListProps = ComponentProps<'ul'> & {
  onSelect?: () => void
}

// NotePreviewListコンポーネントは、ノートのプレビューをリスト表示する
export const NotePreviewList = ({ onSelect, className, ...props }: NotePreviewListProps) => {
  const { notes, selectedNoteIndex, handleNoteSelect } = useNoteList({ onSelect }) // useNoteListフックを使って、ノートの情報を取得
  if (!notes) return null // notesがnullの場合は何も表示しない

  if (isEmpty(notes)) {
    return (
      <ul className={twMerge('text-center pt-4', className)} {...props}>
        <span>No Notes Yet!</span>
      </ul>
    )
  }
  return (
    <ul className={className} {...props}>
      {notes.map((note, index) => (
        // NotePreviewコンポーネントを使って、ノートのプレビューを表示
        <NotePreview
          key={note.title + note.lastEditTime} // keyはtitleとlastEditTimeの組み合わせ
          {...note} // NotePreviewコンポーネントには、NoteInfoの全てのプロパティを渡す
          isActive={selectedNoteIndex === index} // 選択されたノートかどうかを判定
          onClick={handleNoteSelect(index)} // ノートがクリックされた際の処理
        />
      ))}
    </ul>
  )
}
