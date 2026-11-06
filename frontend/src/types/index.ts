export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string;
  _count?: {
    books: number;
    receivedRequests?: number;
    sentRequests?: number;
  };
  receivedRequests?: Array<{
    id: number;
    status: string;
    createdAt: string;
    book: {
      id: number;
      name: string;
      author: string;
    };
    sender: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

export interface Book {
  id: number;
  name: string;
  author: string;
  photo?: string | null;
  description?: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface BooksPaginatedResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ExchangeResponse {
  message: string;
  emailPreviewUrl?: string | null;
}

