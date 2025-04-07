import { storeToRefs } from 'pinia'
import { computed, readonly, ref, watch } from 'vue'
import { useAuthStore } from './useAuthStore.js'

type SendEmailVerificationResult = 'link-sent' | 'email-verified' | undefined

interface SendEmailVerificationState {
  loaded: boolean
  submitting: boolean
  email: string | undefined
  result: SendEmailVerificationResult
}

/**
 * Send email verification, handling common error cases.
 */
export const useSendEmailVerification = () => {
  const state = ref<SendEmailVerificationState>({
    loaded: false,
    submitting: false,
    email: undefined,
    result: undefined,
  })

  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  const sendEmailVerification = async (): Promise<void> => {
    if (!state.value.loaded) {
      throw new Error('Not loaded yet')
    }

    if (state.value.submitting) {
      throw new Error('Already submitting')
    }

    state.value = {
      ...state.value,
      submitting: true,
      result: undefined,
    }

    if (!user.value) {
      throw new Error('User unexpectedly not authenticated.')
    }

    const { sendEmailVerification: firebaseSendEmailVerification } =
      await import('firebase/auth')

    await firebaseSendEmailVerification(user.value)

    state.value = {
      ...state.value,
      submitting: false,
      result: 'link-sent',
    }
  }

  const reset = () => {
    state.value = {
      loaded: false,
      submitting: false,
      result: undefined,
      email: undefined,
    }
  }

  watch(
    [user, state],
    async () => {
      if (state.value.loaded || !user.value) {
        return
      }

      // Ensure user is reloaded to get latest email verification status.
      await user.value.reload()

      state.value = {
        ...state.value,
        loaded: true,
        email: user.value.email ?? undefined,
        result: user.value.emailVerified ? 'email-verified' : undefined,
      }
    },
    { immediate: true },
  )

  return {
    // State object for atomic updates
    state: readonly(state),

    // Computed properties for convenience
    loaded: computed(() => state.value.loaded),
    submitting: computed(() => state.value.submitting),
    email: computed(() => state.value.email),
    result: computed(() => state.value.result),

    // Methods
    sendEmailVerification,
    reset,
  }
}
