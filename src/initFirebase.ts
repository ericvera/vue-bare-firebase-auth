import { initializeAnalytics } from './internal/analytics.js'
import { initializeAppCheck } from './internal/appCheck.js'
import type { FirebaseInitOptions } from './types.js'

/**
 * Initializes a Firebase application with optional features and emulator connections.
 * @param options - Configuration options for Firebase initialization
 * @param options.config - Firebase configuration object
 * @param options.emulators - Optional emulator configuration for local development
 * @param options.emulators.host - Host address for emulators (defaults to '127.0.0.1')
 * @param options.emulators.auth - Authentication emulator configuration
 * @param options.emulators.functions - Cloud Functions emulator configuration
 * @param options.emulators.firestore - Firestore emulator configuration
 * @param options.appCheck - Optional App Check configuration
 * @param options.analytics - Optional Analytics configuration
 * @returns A Promise that resolves to the initialized Firebase app instance
 */
export const initFirebase = async (options: FirebaseInitOptions) => {
  // TODO: Remove
  console.log('initFirebase')

  const app = (await import('firebase/app')).initializeApp(options.config)

  // TODO: Remove
  console.log('app initialized:', app)

  const initPromises: Promise<void>[] = []

  if (options.emulators) {
    // TODO: Remove
    console.log('initializing emulators')

    const {
      connectToAuthEmulator,
      connectToFunctionsEmulator,
      connectToFirestoreEmulator,
      connectToFirestoreLiteEmulator,
    } = await import('./internal/emulators.js')

    const host = options.emulators.host ?? '127.0.0.1'

    if (options.emulators.auth) {
      // TODO: Remove
      const { getAuth } = await import('firebase/auth')

      // TODO: Remove
      console.log('getAuth (test)', getAuth(app))

      // TODO: Remove
      console.log('initializing auth emulator')

      initPromises.push(
        connectToAuthEmulator(app, options.emulators.auth, host).catch(
          (error: unknown) => {
            // TODO: Remove
            console.error('error initializing auth emulator:', error)

            throw error
          },
        ),
      )
    }

    if (options.emulators.functions) {
      // TODO: Remove
      console.log('initializing functions emulator')

      initPromises.push(
        connectToFunctionsEmulator(
          app,
          options.emulators.functions,
          host,
        ).catch((error: unknown) => {
          // TODO: Remove
          console.error('error initializing functions emulator:', error)

          throw error
        }),
      )
    }

    if (options.emulators.firestore) {
      // TODO: Remove
      console.log('initializing firestore emulator')

      initPromises.push(
        connectToFirestoreEmulator(
          app,
          options.emulators.firestore,
          host,
        ).catch((error: unknown) => {
          // TODO: Remove
          console.error('error initializing firestore emulator:', error)

          throw error
        }),
      )

      // TODO: Remove
      console.log('initializing firestore lite emulator')

      initPromises.push(
        connectToFirestoreLiteEmulator(
          app,
          options.emulators.firestore,
          host,
        ).catch((error: unknown) => {
          // TODO: Remove
          console.error('error initializing firestore lite emulator:', error)

          throw error
        }),
      )
    }
  }

  if (options.appCheck) {
    // TODO: Remove
    console.log('initializing app check')

    initPromises.push(
      initializeAppCheck(app, options.appCheck).catch((error: unknown) => {
        // TODO: Remove
        console.error('error initializing app check:', error)

        throw error
      }),
    )
  }

  if (options.analytics) {
    // TODO: Remove
    console.log('initializing analytics')

    initPromises.push(
      initializeAnalytics(app, options.analytics).catch((error: unknown) => {
        // TODO: Remove
        console.error('error initializing analytics:', error)

        throw error
      }),
    )
  }

  // TODO: Remove
  console.log('waiting for emulators to be initialized')

  await Promise.all(initPromises)

  // TODO: Remove
  console.log('emulators initialized')

  // TODO: Remove
  console.log('app:', app)

  return app
}
