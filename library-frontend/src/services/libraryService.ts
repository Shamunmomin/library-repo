import api from '../lib/axios';
import type { Library, CreateLibraryRequest, UpdateLibraryRequest } from '../types/library';
import type { ApiResponse } from '../types/api';

export const libraryApi = {
  getMyLibrary: async (): Promise<ApiResponse<Library>> => {
    const response = await api.get<ApiResponse<Library>>('/owner/library');
    return response.data;
  },

  createLibrary: async (data: CreateLibraryRequest): Promise<ApiResponse<Library>> => {
    const response = await api.post<ApiResponse<Library>>('/owner/library', data);
    return response.data;
  },

  updateLibrary: async (data: UpdateLibraryRequest): Promise<ApiResponse<Library>> => {
    const response = await api.put<ApiResponse<Library>>('/owner/library', data);
    return response.data;
  },

  getAllLibraries: async (): Promise<ApiResponse<Library[]>> => {
    const response = await api.get<ApiResponse<Library[]>>('/admin/libraries');
    return response.data;
  },

  getLibraryById: async (id: string): Promise<ApiResponse<Library>> => {
    const response = await api.get<ApiResponse<Library>>(`/admin/libraries/${id}`);
    return response.data;
  },

  toggleLibraryActive: async (id: string): Promise<ApiResponse<Library>> => {
    const response = await api.put<ApiResponse<Library>>(`/admin/libraries/${id}/toggle-active`);
    return response.data;
  },
};
