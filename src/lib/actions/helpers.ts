export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function actionWrapper<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, error }
  }
}
