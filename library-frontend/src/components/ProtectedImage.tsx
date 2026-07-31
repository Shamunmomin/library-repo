import type { ReactNode } from 'react'
import { useImage } from '../hooks/useImage'

interface ProtectedImageProps {
  src?: string | null
  alt?: string
  className?: string
  fallback?: ReactNode
}

export default function ProtectedImage({ src, alt = '', className, fallback = null }: ProtectedImageProps) {
  const { url } = useImage(src)
  if (!url) return <>{fallback}</>
  return <img src={url} alt={alt} className={className} />
}
