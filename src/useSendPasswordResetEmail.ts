import { readonly, ref } from 'vue'

interface UseSendPasswordResetEmailParam {
  onError: (error: unknown) => void
}

export enum SendPasswordResetEmailResult {
  Success = 'success',
}

/**
 * Send password reset email, handling common error cases.
 * Returns submitting state and result of send attempt.
 *
 * @param param0 - Object containing error handler
 * @param param0.onError - Handler for unhandled errors during send
 */
export const useSendPasswordResetEmail = ({
  onError,
}: UseSendPasswordResetEmailParam) => {
  const submitting = ref(false)
  const result = ref<SendPasswordResetEmailResult>()

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    submitting.value = true
    result.value = undefined

    try {
      const { getAuth, sendPasswordResetEmail: _sendPasswordResetEmail } =
        await import('firebase/auth')

      await _sendPasswordResetEmail(getAuth(), email)
      result.value = SendPasswordResetEmailResult.Success
      submitting.value = false
    } catch (e) {
      // sendPasswordResetEmail does not throw an error if the email is not found
      // so any error here is unexpected
      onError(e)
    }
  }

  return {
    submitting: readonly(submitting),
    result: readonly(result),
    sendPasswordResetEmail,
  }
}
