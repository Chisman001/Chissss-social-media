export interface ActionSuccess<T> {
  ok: true
  data: T
}

export interface ActionFailure {
  ok: false
  error: string
  fieldErrors?: Record<string, string[] | undefined>
}

export type ActionResponse<T = void> = ActionSuccess<T> | ActionFailure

export function success<T>(data: T): ActionSuccess<T> {
  return { ok: true, data }
}

export function failure(error: string, fieldErrors?: Record<string, string[] | undefined>): ActionFailure {
  return { ok: false, error, fieldErrors }
}
