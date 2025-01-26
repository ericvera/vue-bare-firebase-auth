import type { ActionCodeInfo } from 'firebase/auth'
import { readonly, ref } from 'vue'
import { getFirebaseErrorCode } from './internal/getFirebaseErrorCode.js'

export enum RecoverEmailError {
  /**
   * Thrown if the recover email code has expired.
   */
  ExpiredActionCode = 'auth/expired-action-code',
  /**
   * Thrown if the recover email code is invalid. This can happen if the code is
   * malformed or has already been used.
   */
  InvalidActionCode = 'auth/invalid-action-code',
  /**
   * Throw if the email is already in use.
   */
  EmailAlreadyInUse = 'auth/email-already-in-use',
}

interface UseRecoverEmailParam {
  onError: (error: unknown) => void
}

type RecoverEmailResult = RecoverEmailError | 'success' | undefined

interface RecoverEmailState {
  result: RecoverEmailResult
  email: string | undefined
  loaded: boolean
}

export const useRecoverEmail = ({ onError }: UseRecoverEmailParam) => {
  const state = ref<RecoverEmailState>({
    result: undefined,
    email: undefined,
    loaded: false,
  })

  const handleRecoverEmail = async (oobCode: string) => {
    if (state.value.loaded) {
      return
    }

    try {
      const {
        getAuth,
        applyActionCode,
        checkActionCode,
        sendPasswordResetEmail,
      } = await import('firebase/auth')

      const auth = getAuth()
      const info: ActionCodeInfo = await checkActionCode(auth, oobCode)

      const recoveredEmail = info.data.email

      if (!recoveredEmail) {
        throw new Error(
          'info.data.email unexpectedly null or undefined during email recovery action.',
        )
      }

      await applyActionCode(auth, oobCode)
      await sendPasswordResetEmail(auth, recoveredEmail)

      state.value = {
        result: 'success',
        email: recoveredEmail,
        loaded: true,
      }
    } catch (e) {
      const code = getFirebaseErrorCode(e)

      if (
        code &&
        Object.values(RecoverEmailError).includes(code as RecoverEmailError)
      ) {
        state.value = {
          result: code as RecoverEmailError,
          email: undefined,
          loaded: true,
        }
      } else {
        onError(e)
      }
    }
  }

  return {
    state: readonly(state),
    handleRecoverEmail,
  }
}
