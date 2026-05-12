export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState {
  status: LoadingState
  error: string | null
}
