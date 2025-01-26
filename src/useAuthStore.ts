import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'

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
    })

    const isLoggedIn = computed(() => state.value.user !== undefined)

    const init = async () => {
      const { getAuth, onIdTokenChanged } = await import('firebase/auth')

      const updateAuthState = async (updatedUser: User | null) => {
        const claims = ((await updatedUser?.getIdTokenResult())?.claims ??
          {}) as TClaims

        state.value = {
          user: updatedUser ?? undefined,
          claims,
          loaded: true,
        }
      }

      unsubscribe.value = onIdTokenChanged(getAuth(), (updatedUser) => {
        void updateAuthState(updatedUser)
      })
    }

    void init()

    // Clean up subscription on component unmount
    onUnmounted(() => {
      unsubscribe.value?.()
    })

    /**
     * Waits for the auth store to be loaded
     * @param milliseconds - Maximum time to wait in milliseconds
     * @throws Error if store is not loaded within the timeout period
     */
    const waitUntilLoaded = async (milliseconds: number = 60000) => {
      for (let i = 0; i < milliseconds / 10; i++) {
        if (state.value.loaded) {
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      throw new Error('Auth store not loaded within the timeout period')
    }

    /**
     * Forces a refresh of the user's ID token
     */
    const refreshToken = async () => {
      if (state.value.user) {
        await state.value.user.getIdToken(true)
      }
    }

    /**
     * Signs out the current user
     */
    const signOut = async () => {
      const { getAuth, signOut } = await import('firebase/auth')

      await signOut(getAuth())
    }

    return {
      state,
      isLoggedIn,
      waitUntilLoaded,
      refreshToken,
      signOut,
    }
  })()
