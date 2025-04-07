import { computed, readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum SignInResult {
  Success = 'success',
  InvalidCredential = 'auth/invalid-credential',
}

interface SignInState {
  submitting: boolean
  result: SignInResult | undefined
}

/**
 * Sign in with email and password, handling common error cases.
 * Returns submitting state and result of sign in attempt.
 *
 * @remarks Ensure emulator config includes
 *  `"emailPrivacyConfig": { "enableImprovedEmailPrivacy": true }`. Otherwise
 *  `auth/wrong-password` will be thrown instead of `auth/invalid-credential`.
 */
export const useSignInWithEmailAndPassword = () => {
  const state = ref<SignInState>({
    submitting: false,
    result: undefined,
  })

  const signInWithEmailAndPassword = async (
    email: string,
    password: string,
  ): Promise<void> => {
    state.value = {
      submitting: true,
      result: undefined,
    }

    try {
      const {
        getAuth,
        signInWithEmailAndPassword: firebaseSignInWithEmailAndPassword,
      } = await import('firebase/auth')

      await firebaseSignInWithEmailAndPassword(getAuth(), email, password)

      state.value = {
        submitting: false,
        result: SignInResult.Success,
      }
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      // Only handle expected errors
      if (code === SignInResult.InvalidCredential) {
        state.value = {
          submitting: false,
          result: SignInResult.InvalidCredential,
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
    submitting: computed(() => state.value.submitting),
    result: computed(() => state.value.result),

    // Methods
    signInWithEmailAndPassword,
  }
}
