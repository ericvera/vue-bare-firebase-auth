import { storeToRefs } from 'pinia'
import { readonly, ref, watch } from 'vue'
import { useAuthStore } from 'vue-bare-firebase-auth'

type SendEmailVerificationResult = 'link-sent' | 'already-verified' | undefined

interface SendEmailVerificationState {
  loaded: boolean
  submitting: boolean
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

  watch(
    [authState, state],
    () => {
      if (state.value.loaded || !authState.value.loaded) {
        return
      }

      state.value = {
        ...state.value,
        loaded: true,
        result: authState.value.user?.emailVerified
          ? 'already-verified'
          : undefined,
      }
    },
    { immediate: true },
  )

  return {
    state: readonly(state),
    sendEmailVerification,
  }
}
