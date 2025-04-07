import { computed, readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum ResetPasswordError {
  /**
   * Thrown if the reset password code has expired.
   */
  ExpiredActionCode = 'auth/expired-action-code',
  /**
   * Thrown if the reset password code is invalid. This can happen if the code is
   * malformed or has already been used.
   */
  InvalidActionCode = 'auth/invalid-action-code',
}

type ResetPasswordResult =
  | 'enter-password'
  | 'password-updated'
  | ResetPasswordError
  | undefined

interface ResetPasswordState {
  loaded: boolean
  submitting: boolean
  result: ResetPasswordResult
  email: string | undefined
}

export const useResetPassword = () => {
  const state = ref<ResetPasswordState>({
    loaded: false,
    submitting: false,
    result: undefined,
    email: undefined,
  })

  const handleResetPassword = async (oobCode: string) => {
    if (!state.value.loaded && !state.value.submitting) {
      try {
        const { getAuth, verifyPasswordResetCode } = await import(
          'firebase/auth'
        )

        const auth = getAuth()
        const email = await verifyPasswordResetCode(auth, oobCode)

        if (!email) {
          throw new Error(
            'email unexpectedly null or undefined during reset password action.',
          )
        }

        state.value = {
          email,
          loaded: true,
          submitting: false,
          result: 'enter-password',
        }
      } catch (e) {
        const code = getFirebaseErrorCode(e)

        if (
          code &&
          Object.values(ResetPasswordError).includes(code as ResetPasswordError)
        ) {
          state.value = {
            result: code as ResetPasswordError,
            loaded: true,
            submitting: false,
            email: undefined,
          }
        } else {
          // Simply throw unexpected errors for global handling
          throw e
        }
      }
    }
  }

  const resetPassword = async (oobCode: string, newPassword: string) => {
    if (state.value.submitting) {
      return
    }

    state.value.submitting = true

    const { getAuth, confirmPasswordReset } = await import('firebase/auth')

    await confirmPasswordReset(getAuth(), oobCode, newPassword)

    state.value = {
      ...state.value,
      result: 'password-updated',
      submitting: false,
    }
  }

  return {
    // State object for atomic updates
    state: readonly(state),

    // Computed properties for convenience
    loaded: computed(() => state.value.loaded),
    submitting: computed(() => state.value.submitting),
    result: computed(() => state.value.result),
    email: computed(() => state.value.email),

    // Methods
    handleResetPassword,
    resetPassword,
  }
}
