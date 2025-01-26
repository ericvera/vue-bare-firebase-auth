export const getFirebaseErrorCode = (error: unknown) => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error) ||
    typeof error.code !== 'string'
  ) {
    return
  }

  return error.code
}
