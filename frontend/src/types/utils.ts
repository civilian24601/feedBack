// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export type WithLoading<T> = T & {
  loading: boolean
  error?: string
}

export type WithTimestamps = {
  created_at: string
  updated_at: string
} 