import api from './axios'
import { resolveImagePath } from '../hooks/useImage'

export async function openImageInNewTab(src: string) {
  const response = await api.get(resolveImagePath(src), { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  window.open(url, '_blank', 'noopener,noreferrer')
}
