import { computed, readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum CreateUserResult {
  Success = 'success',
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  WeakPassword = 'auth/weak-password',
}

interface CreateUserState {
  submitting: boolean
  result: CreateUserResult | undefined
}

/**
 * Create a new user with email and password, handling common error cases.
 * Returns submitting state and result of creation attempt.
 */
export const useCreateUserWithEmailAndPassword = () => {
  const state = ref<CreateUserState>({
    submitting: false,
    result: undefined,
  })

  const createUserWithEmailAndPassword = async (
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
        createUserWithEmailAndPassword: firebaseCreateUserWithEmailAndPassword,
      } = await import('firebase/auth')

      await firebaseCreateUserWithEmailAndPassword(getAuth(), email, password)

      state.value = {
        submitting: false,
        result: CreateUserResult.Success,
      }
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      // Only handle expected errors
      if (
        code === CreateUserResult.EmailAlreadyInUse ||
        code === CreateUserResult.InvalidEmail ||
        code === CreateUserResult.WeakPassword
      ) {
        state.value = {
          submitting: false,
          result: code as CreateUserResult,
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
    createUserWithEmailAndPassword,
  }
}
