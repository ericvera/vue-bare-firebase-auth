/**
 * Enum for custom authentication store error codes
 * Uses 'auth-store/' prefix to distinguish from Firebase error codes
 */
export enum AuthStoreErrorCode {
  LoadingTimedOut = 'auth-store/loading-timed-out',
  Unknown = 'auth-store/unknown-error',
}
