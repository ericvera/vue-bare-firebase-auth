/**
 * Custom authentication store error class with error codes
 */
export class AuthStoreError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = 'AuthStoreError'
    this.code = code
  }
}
