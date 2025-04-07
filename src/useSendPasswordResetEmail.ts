import { computed, readonly, ref } from 'vue'

export enum SendPasswordResetEmailResult {
  Success = 'success',
}

interface SendPasswordResetEmailState {
  submitting: boolean
  result: SendPasswordResetEmailResult | undefined
}

/**
 * Send password reset email, handling common error cases.
 * Returns submitting state and result of send attempt.
 */
export const useSendPasswordResetEmail = () => {
  const state = ref<SendPasswordResetEmailState>({
    submitting: false,
    result: undefined,
  })

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    state.value = {
      submitting: true,
      result: undefined,
    }

    const { getAuth, sendPasswordResetEmail: firebaseSendPasswordResetEmail } =
      await import('firebase/auth')

    await firebaseSendPasswordResetEmail(getAuth(), email)

    state.value = {
      submitting: false,
      result: SendPasswordResetEmailResult.Success,
    }
  }

  return {
    // State object for atomic updates
    state: readonly(state),

    // Computed properties for convenience
    submitting: computed(() => state.value.submitting),
    result: computed(() => state.value.result),

    // Methods
    sendPasswordResetEmail,
  }
}
