import { cn, formatDateFromMs } from '@renderer/utils'
import { NoteInfo } from '@shared/models'
import { ComponentProps } from 'react'

export type NotePreviewProps = NoteInfo & {
  isActive?: boolean
} & ComponentProps<'div'>

export const NotePreview = ({
  title,
  content,
  lastEditTime,
  isActive = false,
  className,
  ...props
}: NotePreviewProps) => {
  const date = formatDateFromMs(lastEditTime)
  return (
    <div
      className={cn('cursor-pointer px-2.5 py-3 rounded-md transition-colors duration-75', {
        //この行では、cn関数を使って、複数のクラス名を結合しています。cn関数は、classnamesパッケージからインポートされています。この関数は、複数のクラス名を結合して返すため、クラス名を結合する際に便利です。この関数は、第1引数にクラス名を指定し、第2引数に条件を指定します。条件がtrueの場合、クラス名が追加されます。この関数を使うことで、条件に応じてクラス名を追加することができます。
        'bg-zinc-400/75': isActive, //この行では、isActiveがtrueの場合、bg-zinc-400/75クラスが追加されます。
        'hover:bg-zinc-500/75': !isActive //この行では、isActiveがfalseの場合、hover:bg-zinc-500/75クラスが追加されます。
      })}
      {...props}
    >
      <h3 className="mb-1 font-bold truncate">{title}</h3>
      <span className="inline-block w-full mb-2 text-xs font-light text-left">{date}</span>
    </div>
  )
}
