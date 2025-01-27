import { readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum CreateUserResult {
  Success = 'success',
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  WeakPassword = 'auth/weak-password',
}

interface UseCreateUserWithEmailAndPasswordParam {
  onError: (error: unknown) => void
}

/**
 * Create a new user with email and password, handling common error cases.
 * Returns submitting state and result of creation attempt.
 *
 * @param param0 - Object containing error handler
 * @param param0.onError - Handler for unhandled errors during user creation
 */
export const useCreateUserWithEmailAndPassword = ({
  onError,
}: UseCreateUserWithEmailAndPasswordParam) => {
  const submitting = ref(false)
  const result = ref<CreateUserResult>()

  const createUserWithEmailAndPassword = async (
    email: string,
    password: string,
  ): Promise<void> => {
    submitting.value = true
    result.value = undefined

    try {
      const {
        getAuth,
        createUserWithEmailAndPassword: _createUserWithEmailAndPassword,
      } = await import('firebase/auth')

      await _createUserWithEmailAndPassword(getAuth(), email, password)

      result.value = CreateUserResult.Success
      submitting.value = false
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      switch (code) {
        case CreateUserResult.EmailAlreadyInUse:
        case CreateUserResult.InvalidEmail:
        case CreateUserResult.WeakPassword:
          result.value = code as CreateUserResult
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
    createUserWithEmailAndPassword,
  }
}
