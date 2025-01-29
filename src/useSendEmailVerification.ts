import { storeToRefs } from 'pinia'
import { readonly, ref, watch } from 'vue'
import { useAuthStore } from './useAuthStore.js'

type SendEmailVerificationResult = 'link-sent' | 'email-verified' | undefined

interface SendEmailVerificationState {
  loaded: boolean
  submitting: boolean
  email: string | undefined
  result: SendEmailVerificationResult
}

interface UseSendEmailVerificationParam {
  onError: (error: unknown) => void
}

/**
 * Send email verification, handling common error cases.
 *
 * @param param0 - Object containing error handler
 * @param param0.onError - Handler for unhandled errors during send
 */
export const useSendEmailVerification = ({
  onError,
}: UseSendEmailVerificationParam) => {
  const state = ref<SendEmailVerificationState>({
    loaded: false,
    submitting: false,
    email: undefined,
    result: undefined,
  })

  const authStore = useAuthStore()
  const { state: authState } = storeToRefs(authStore)

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

    if (!authState.value.user) {
      throw new Error('User unexpectedly not authenticated.')
    }

    try {
      const { sendEmailVerification: _sendEmailVerification } = await import(
        'firebase/auth'
      )

      await _sendEmailVerification(authState.value.user)

      state.value = {
        ...state.value,
        submitting: false,
        result: 'link-sent',
      }
    } catch (e) {
      onError(e)
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
    [authState, state],
    async () => {
      if (state.value.loaded || !authState.value.loaded) {
        return
      }

      // Ensure user is reloaded to get latest email verification status.
      await authState.value.user?.reload()

      state.value = {
        ...state.value,
        loaded: true,
        email: authState.value.user?.email ?? undefined,
        result: authState.value.user?.emailVerified
          ? 'email-verified'
          : undefined,
      }
    },
    { immediate: true },
  )

  return {
    state: readonly(state),
    sendEmailVerification,
    reset,
  }
}
