import { readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum SignInResult {
  Success = 'success',
  InvalidCredential = 'auth/invalid-credential',
}

interface UseSignInWithEmailAndPasswordParam {
  onError: (error: unknown) => void
}

/**
 * Sign in with email and password, handling common error cases.
 * Returns submitting state and result of sign in attempt.
 *
 * @param param0 - Object containing error handler
 * @param param0.onError - Handler for unhandled errors during sign in
 *
 * @remarks Ensure emulator config includes
 *  `"emailPrivacyConfig": { "enableImprovedEmailPrivacy": true }`. Otherwise
 *  `auth/wrong-password` will be thrown instead of `auth/invalid-credential`.
 */
export const useSignInWithEmailAndPassword = ({
  onError,
}: UseSignInWithEmailAndPasswordParam) => {
  const submitting = ref(false)
  const result = ref<SignInResult>()

  const signInWithEmailAndPassword = async (
    email: string,
    password: string,
  ): Promise<void> => {
    submitting.value = true
    result.value = undefined

    try {
      const {
        getAuth,
        signInWithEmailAndPassword: _signInWithEmailAndPassword,
      } = await import('firebase/auth')

      await _signInWithEmailAndPassword(getAuth(), email, password)

      result.value = SignInResult.Success
      submitting.value = false
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      switch (code) {
        case SignInResult.InvalidCredential:
          result.value = SignInResult.InvalidCredential
          submitting.value = false
          break
        default:
          onError(e)
      }
    }
  }

  return {
    submitting: readonly(submitting),
    result: readonly(result),
    signInWithEmailAndPassword,
  }
}
