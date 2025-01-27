import { storeToRefs } from 'pinia'
import { readonly, ref } from 'vue'
import { useAuthStore } from 'vue-bare-firebase-auth'

export enum SendEmailVerificationResult {
  Success = 'success',
}

interface UseSendEmailVerificationParam {
  onError: (error: unknown) => void
}

/**
 * Send email verification, handling common error cases.
 * Returns submitting state and result of send attempt.
 *
 * @param param0 - Object containing error handler
 * @param param0.onError - Handler for unhandled errors during send
 */
export const useSendEmailVerification = ({
  onError,
}: UseSendEmailVerificationParam) => {
  const submitting = ref(false)
  const result = ref<SendEmailVerificationResult>()

  const authStore = useAuthStore()
  const { state: authState } = storeToRefs(authStore)

  const sendEmailVerification = async (): Promise<void> => {
    if (!authState.value.user) {
      throw new Error('User unexpectedly not authenticated.')
    }

    submitting.value = true
    result.value = undefined

    try {
      const { sendEmailVerification: _sendEmailVerification } = await import(
        'firebase/auth'
      )

      await _sendEmailVerification(authState.value.user)

      result.value = SendEmailVerificationResult.Success
      submitting.value = false
    } catch (e) {
      onError(e)
    }
  }

  return {
    submitting: readonly(submitting),
    result: readonly(result),
    sendEmailVerification,
  }
}
