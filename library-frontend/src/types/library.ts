export interface Library {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  address: string | null;
  phone: string | null;
  active: boolean;
}

export interface CreateLibraryRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateLibraryRequest {
  name?: string;
  address?: string;
  phone?: string;
}
