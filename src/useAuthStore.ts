import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, readonly, ref, watch } from 'vue'
import { AuthStoreError, AuthStoreErrorCode } from './errors/index.js'

interface AuthState {
  user: User | null
  claims: Record<string, unknown>
  loaded: boolean
  error: Error | null
}

/**
 * Authentication store with state management
 */
export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState>({
    user: null,
    claims: {},
    loaded: false,
    error: null,
  })

  const unsubscribe = ref<(() => void) | undefined>()

  // Promise that resolves when loaded becomes true
  let loadedPromise: Promise<void> | null = null
  let loadedResolver: (() => void) | null = null
  let loadedTimeout: number | null = null

  const init = async () => {
    const { getAuth, onIdTokenChanged } = await import('firebase/auth')

    const updateAuthState = async (updatedUser: User | null) => {
      try {
        if (updatedUser) {
          const idTokenResult = await updatedUser.getIdTokenResult()

          state.value = {
            ...state.value,
            user: updatedUser,
            claims: idTokenResult.claims,
            loaded: true,
            error: null,
          }
        } else {
          state.value = {
            ...state.value,
            user: null,
            claims: {},
            loaded: true,
            error: null,
          }
        }
      } catch (err) {
        let error: Error

        if (err instanceof Error) {
          // Convert Firebase auth errors to our custom AuthStoreError
          if ('code' in err && typeof err.code === 'string') {
            // Preserve Firebase error codes
            error = new AuthStoreError(err.message, err.code)
          } else {
            error = new AuthStoreError(err.message, AuthStoreErrorCode.Unknown)
          }
        } else {
          error = new AuthStoreError(String(err), AuthStoreErrorCode.Unknown)
        }

        state.value = {
          ...state.value,
          error,
        }
      }
    }

    const auth = getAuth()

    unsubscribe.value = onIdTokenChanged(auth, (updatedUser) => {
      void updateAuthState(updatedUser)
    })
  }

  /**
   * Waits for the auth store to be loaded
   * @param milliseconds - Maximum time to wait in milliseconds
   * @throws Error if store is not loaded within the timeout period
   */
  const waitUntilLoaded = async (milliseconds: number = 8000) => {
    if (state.value.loaded) {
      return
    }

    if (!loadedPromise) {
      loadedPromise = new Promise<void>((resolve, reject) => {
        if (state.value.loaded) {
          resolve()
          return
        }

        loadedResolver = resolve

        loadedTimeout = window.setTimeout(() => {
          loadedTimeout = null
          loadedResolver = null
          loadedPromise = null
          reject(
            new AuthStoreError(
              'Auth store not loaded within the timeout period',
              AuthStoreErrorCode.LoadingTimedOut,
            ),
          )
        }, milliseconds)
      })
    }

    return loadedPromise
  }

  /**
   * Forces a refresh of the user's ID token
   */
  const refreshToken = async () => {
    if (!state.value.user) {
      return
    }

    await state.value.user.getIdToken(true)
  }

  /**
   * Signs out the current user
   */
  const signOut = async () => {
    const { getAuth, signOut } = await import('firebase/auth')

    await signOut(getAuth())

    state.value = {
      ...state.value,
      error: null,
    }
  }

  /**
   * Clears the current error
   */
  const clearError = () => {
    state.value = {
      ...state.value,
      error: null,
    }
  }

  const unload = () => {
    unsubscribe.value?.()

    state.value = {
      user: null,
      claims: {},
      loaded: false,
      error: null,
    }

    // Reset the loading promise state
    if (loadedTimeout !== null) {
      window.clearTimeout(loadedTimeout)
      loadedTimeout = null
    }
    loadedResolver = null
    loadedPromise = null
  }

  // Computed property for login state
  const isLoggedIn = computed(() => state.value.user !== null)

  // Top-level watcher for loaded state
  watch(
    () => state.value.loaded,
    (isLoaded) => {
      if (isLoaded && loadedResolver) {
        loadedResolver()
        loadedResolver = null

        if (loadedTimeout !== null) {
          window.clearTimeout(loadedTimeout)
          loadedTimeout = null
        }
      }
    },
  )

  return {
    // State object for atomic updates
    state: readonly(state),

    // Computed properties for convenience
    user: computed(() => state.value.user),
    claims: computed(() => state.value.claims),
    loaded: computed(() => state.value.loaded),
    error: computed(() => state.value.error),
    isLoggedIn,

    // Methods
    init,
    waitUntilLoaded,
    refreshToken,
    signOut,
    unload,
    clearError,
  }
})
