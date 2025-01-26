/**
 * Extracts the Firebase error code from an error object.
 * @param error - The error object to extract the code from
 * @returns The Firebase error code if present, undefined otherwise
 */
export const getFirebaseErrorCode = (error: unknown): string | undefined => {
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
