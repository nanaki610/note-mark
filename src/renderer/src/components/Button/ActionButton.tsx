import { ComponentProps } from 'react'

export type ActionButtonProps = ComponentProps<'button'>

export const ActionButton = ({ className, children, ...props }: ActionButtonProps) => {
  return (
    <button
      className="px-2 py-1 rounded-md border border-zinc-400/50 hover:border-zinc-600/50 transition-colors duration-100"
      {...props}
    >
      {children}
    </button>
  )
}
