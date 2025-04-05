import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * State interface for the authentication store
 */
interface State<TClaims extends object = object> {
  /** The current Firebase user */
  user: User | undefined
  /** Custom claims associated with the user */
  claims: TClaims
  /** Whether the initial auth state has been loaded */
  loaded: boolean
  /** Last error that occurred in the store */
  error: Error | null
}

const storeId = 'vue-bare-firebase-auth-store'

/**
 * Creates and returns an authentication store with state management
 * @template TClaims - Type for custom claims
 */
export const useAuthStore = <TClaims extends object = object>() =>
  defineStore(storeId, () => {
    const unsubscribe = ref<(() => void) | undefined>()

    const state = ref<State<TClaims>>({
      user: undefined,
      claims: {} as TClaims,
      loaded: false,
      error: null,
    })

    const isLoggedIn = computed(() => state.value.user !== undefined)

    const init = async () => {
      try {
        const { getAuth, onIdTokenChanged } = await import('firebase/auth')

        const updateAuthState = async (updatedUser: User | null) => {
          try {
            const claims = ((await updatedUser?.getIdTokenResult())?.claims ??
              {}) as TClaims

            state.value = {
              user: updatedUser ?? undefined,
              claims,
              loaded: true,
              error: null,
            }
          } catch (error) {
            state.value.error =
              error instanceof Error ? error : new Error(String(error))
          }
        }

        unsubscribe.value = onIdTokenChanged(getAuth(), (updatedUser) => {
          void updateAuthState(updatedUser)
        })
      } catch (error) {
        state.value.error =
          error instanceof Error ? error : new Error(String(error))
      }
    }

    void init()

    /**
     * Waits for the auth store to be loaded
     * @param milliseconds - Maximum time to wait in milliseconds
     * @throws Error if store is not loaded within the timeout period
     */
    const waitUntilLoaded = async (milliseconds: number = 60000) => {
      try {
        for (let i = 0; i < milliseconds / 10; i++) {
          if (state.value.loaded) {
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 10))
        }

        const error = new Error(
          'Auth store not loaded within the timeout period',
        )
        state.value.error = error
        throw error
      } catch (error) {
        state.value.error =
          error instanceof Error ? error : new Error(String(error))
        throw error
      }
    }

    /**
     * Forces a refresh of the user's ID token
     */
    const refreshToken = async () => {
      try {
        if (state.value.user) {
          await state.value.user.getIdToken(true)
        }
      } catch (error) {
        state.value.error =
          error instanceof Error ? error : new Error(String(error))
        throw error
      }
    }

    /**
     * Signs out the current user
     */
    const signOut = async () => {
      try {
        const { getAuth, signOut } = await import('firebase/auth')
        await signOut(getAuth())
        state.value.error = null
      } catch (error) {
        state.value.error =
          error instanceof Error ? error : new Error(String(error))
        throw error
      }
    }

    /**
     * Clears the current error
     */
    const clearError = () => {
      state.value.error = null
    }

    const unload = () => {
      try {
        unsubscribe.value?.()

        state.value = {
          user: undefined,
          claims: {} as TClaims,
          loaded: false,
          error: null,
        }
      } catch (error) {
        state.value.error =
          error instanceof Error ? error : new Error(String(error))
      }
    }

    return {
      state,
      isLoggedIn,
      waitUntilLoaded,
      refreshToken,
      signOut,
      unload,
      clearError,
    }
  })()
