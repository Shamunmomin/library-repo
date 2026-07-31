import { useEffect, useState } from 'react'
import api from '../services/axios'

export function resolveImagePath(src: string) {
  return src.startsWith('/api') ? src.slice(4) : src
}

export function useImage(src?: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    if (!src) {
      setUrl(null)
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get(resolveImagePath(src), { responseType: 'blob' })
      .then(response => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(response.data as Blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setUrl(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  return { url, loading }
}
