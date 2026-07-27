import api from './axios'
import type { Library } from '../types'

export const libraryService = {
  async create(name: string, address: string, phone: string, icon?: File) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('address', address)
    formData.append('phone', phone)
    if (icon) formData.append('icon', icon)
    const response = await api.post<Library>('/libraries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getMyLibrary() {
    const response = await api.get<Library>('/libraries/my')
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<Library>(`/libraries/${id}`)
    return response.data
  },
}
