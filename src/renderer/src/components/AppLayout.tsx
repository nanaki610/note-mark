import { ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const RootLayout = ({ children, className, ...props }: ComponentProps<'main'>) => {
  return (
    <main
      className={twMerge('flex flex-row h-screen', className)} //tailwindcssのクラスをマージ
      {...props} //propsを展開
    >
      {children}
    </main>
  )
}

//ComponentProps<'aside'>型を使ってaside要素のpropsを受け取る
export const Sidebar = ({ className, children, ...props }: ComponentProps<'aside'>) => {
  return (
    <aside
      className={twMerge('w-[250px] mt-10 h-[100vh + 10px] overflow-auto bg-zinc-700', className)} //tailwindcssのクラスをマージ
      {...props} //propsを展開
    >
      {children}
    </aside>
  )
}

export const Content = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref} //refを渡す
        className={twMerge('flex-1 h-[100vh] overflow-auto', className)} //tailwindcssのクラスをマージ
        {...props} //propsを展開
      >
        {children}
      </div>
    )
  }
)

Content.displayName = 'Content' //displayNameを設定
