import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface State<TClaims extends object = object> {
  user: User | undefined
  claims: TClaims
  loaded: boolean
}

const storeId = 'vue-bare-firebase-auth-store'

export const useAuthStore = <TClaims extends object = object>() =>
  defineStore(storeId, () => {
    const unsubscribe = ref<() => void>()

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

    window.addEventListener('beforeunload', () => {
      unsubscribe.value?.()
    })

    const waitUntilLoaded = async (milliseconds: number = 60000) => {
      for (let i = 0; i < milliseconds / 10; i++) {
        if (state.value.loaded) {
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      throw new Error('Auth store not loaded')
    }

    const refreshToken = async () => {
      if (state.value.user) {
        await state.value.user.getIdToken(true)
      }
    }

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
