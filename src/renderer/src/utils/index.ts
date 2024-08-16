import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const dateFormatter = new Intl.DateTimeFormat(
  (window as Window & typeof globalThis & { context: { locale: string } }).context.locale,
  {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo'
  }
)

export const formatDateFromMs = (ms: number) => dateFormatter.format(ms)

export const cn = (...args: ClassValue[]) => {
  return twMerge(clsx(...args))
}
