import { initializeAnalytics } from './internal/analytics.js'
import { initializeAppCheck } from './internal/appCheck.js'
import type { FirebaseInitOptions } from './types.js'

/**
 * Initializes a Firebase application with optional features and emulator
 * connections.
 * @param options - Configuration options for Firebase initialization
 * @param options.config - Firebase configuration object
 * @param options.emulators - Optional emulator configuration for local
 *   development
 * @param options.emulators.host - Host address for emulators (defaults to
 *   '127.0.0.1')
 * @param options.emulators.auth - Authentication emulator configuration
 * @param options.emulators.functions - Cloud Functions emulator configuration
 * @param options.emulators.firestore - Firestore emulator configuration
 * @param options.appCheck - Optional App Check configuration
 * @param options.analytics - Optional Analytics configuration
 * @returns A Promise that resolves to the initialized Firebase app
 *   instance
 */
export const initFirebase = async (options: FirebaseInitOptions) => {
  const app = (await import('firebase/app')).initializeApp(options.config)

  const initPromises: Promise<void>[] = []

  if (options.emulators) {
    const {
      connectToAuthEmulator,
      connectToFunctionsEmulator,
      connectToFirestoreEmulator,
      connectToFirestoreLiteEmulator,
    } = await import('./internal/emulators.js')

    const host = options.emulators.host ?? '127.0.0.1'

    if (options.emulators.auth) {
      initPromises.push(
        connectToAuthEmulator(app, options.emulators.auth, host),
      )
    }

    if (options.emulators.functions) {
      initPromises.push(
        connectToFunctionsEmulator(app, options.emulators.functions, host),
      )
    }

    if (options.emulators.firestore) {
      initPromises.push(
        connectToFirestoreEmulator(app, options.emulators.firestore, host),
      )

      initPromises.push(
        connectToFirestoreLiteEmulator(app, options.emulators.firestore, host),
      )
    }
  }

  if (options.appCheck) {
    initPromises.push(initializeAppCheck(app, options.appCheck))
  }

  if (options.analytics) {
    initPromises.push(initializeAnalytics(app, options.analytics))
  }

  await Promise.all(initPromises)

  return app
}
