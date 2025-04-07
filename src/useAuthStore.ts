import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

/**
 * Authentication store with state management
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const claims = ref<Record<string, unknown>>({})
  const loaded = ref(false)
  const error = ref<Error | null>(null)
  const unsubscribe = ref<(() => void) | undefined>()

  const isLoggedIn = computed(() => user.value !== null)

  // Promise that resolves when loaded becomes true
  let loadedPromise: Promise<void> | null = null
  let loadedResolver: (() => void) | null = null
  let loadedTimeout: number | null = null

  const init = async () => {
    const { getAuth, onIdTokenChanged } = await import('firebase/auth')

    const updateAuthState = async (updatedUser: User | null) => {
      try {
        user.value = updatedUser

        if (updatedUser) {
          const idTokenResult = await updatedUser.getIdTokenResult()
          claims.value = idTokenResult.claims
        } else {
          claims.value = {}
        }

        loaded.value = true
        error.value = null
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }

    unsubscribe.value = onIdTokenChanged(getAuth(), (updatedUser) => {
      void updateAuthState(updatedUser)
    })
  }

  /**
   * Waits for the auth store to be loaded
   * @param milliseconds - Maximum time to wait in milliseconds
   * @throws Error if store is not loaded within the timeout period
   */
  const waitUntilLoaded = async (milliseconds: number = 8000) => {
    if (loaded.value) {
      return
    }

    if (!loadedPromise) {
      loadedPromise = new Promise<void>((resolve, reject) => {
        if (loaded.value) {
          resolve()
          return
        }

        loadedResolver = resolve

        loadedTimeout = window.setTimeout(() => {
          loadedTimeout = null
          loadedResolver = null
          loadedPromise = null
          reject(new Error('Auth store not loaded within the timeout period'))
        }, milliseconds)
      })
    }

    return loadedPromise
  }

  /**
   * Forces a refresh of the user's ID token
   */
  const refreshToken = async () => {
    if (!user.value) {
      return
    }

    await user.value.getIdToken(true)
  }

  /**
   * Signs out the current user
   */
  const signOut = async () => {
    const { getAuth, signOut } = await import('firebase/auth')

    await signOut(getAuth())
    error.value = null
  }

  /**
   * Clears the current error
   */
  const clearError = () => {
    error.value = null
  }

  const unload = () => {
    unsubscribe.value?.()
    user.value = null
    claims.value = {}
    loaded.value = false
    error.value = null

    // Reset the loading promise state
    if (loadedTimeout !== null) {
      window.clearTimeout(loadedTimeout)
      loadedTimeout = null
    }
    loadedResolver = null
    loadedPromise = null
  }

  // Top-level watcher for loaded state
  watch(loaded, (isLoaded) => {
    if (isLoaded && loadedResolver) {
      loadedResolver()
      loadedResolver = null

      if (loadedTimeout !== null) {
        window.clearTimeout(loadedTimeout)
        loadedTimeout = null
      }
    }
  })

  return {
    user,
    claims,
    loaded,
    error,
    isLoggedIn,
    init,
    waitUntilLoaded,
    refreshToken,
    signOut,
    unload,
    clearError,
  }
})
