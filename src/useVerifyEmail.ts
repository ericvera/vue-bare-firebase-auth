import { computed, readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum VerifyEmailError {
  /**
   * Thrown if the verify email code has expired.
   */
  ExpiredActionCode = 'auth/expired-action-code',
  /**
   * Thrown if the verify email code is invalid. This can happen if the code is
   * malformed or has already been used.
   */
  InvalidActionCode = 'auth/invalid-action-code',
}

type VerifyEmailResult = 'success' | VerifyEmailError | undefined

interface VerifyEmailState {
  loaded: boolean
  result: VerifyEmailResult
}

export const useVerifyEmail = () => {
  const state = ref<VerifyEmailState>({
    loaded: false,
    result: undefined,
  })

  const handleVerifyEmail = async (oobCode: string) => {
    if (state.value.loaded) {
      return
    }

    try {
      const { getAuth, applyActionCode, getIdTokenResult } = await import(
        'firebase/auth'
      )

      const auth = getAuth()

      await applyActionCode(auth, oobCode)

      // If there is an authenticated user, refresh the ID token to reflect the
      // updated email verification. It is possible to just go to the URL on a
      // different device and verify the email without logging in.
      if (auth.currentUser) {
        await getIdTokenResult(auth.currentUser, true)
      }

      state.value = {
        loaded: true,
        result: 'success',
      }
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      if (
        code &&
        Object.values(VerifyEmailError).includes(code as VerifyEmailError)
      ) {
        state.value = {
          loaded: true,
          result: code as VerifyEmailError,
        }
      } else {
        // Simply throw unexpected errors for global handling
        throw e
      }
    }
  }

  return {
    // State object for atomic updates
    state: readonly(state),

    // Computed properties for convenience
    loaded: computed(() => state.value.loaded),
    result: computed(() => state.value.result),

    // Methods
    handleVerifyEmail,
  }
}
