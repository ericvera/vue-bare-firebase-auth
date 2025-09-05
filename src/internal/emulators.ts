import type { FirebaseApp } from 'firebase/app'
import type { PortOptions } from '../types.js'

export const getPort = (options: PortOptions | true, defaultPort: number) => {
  if (options === true) {
    return defaultPort
  }
  return options.port
}

export const connectToAuthEmulator = async (
  app: FirebaseApp,
  options: PortOptions | true,
  host: string,
) => {
  const { getAuth, connectAuthEmulator } = await import('firebase/auth')

  const auth = getAuth(app)

  connectAuthEmulator(
    auth,
    `http://${host}:${getPort(options, 9099).toString()}`,
    {
      disableWarnings: true,
    },
  )
}

export const connectToFunctionsEmulator = async (
  app: FirebaseApp,
  options: PortOptions | true,
  host: string,
) => {
  const { getFunctions, connectFunctionsEmulator } = await import(
    'firebase/functions'
  )

  const functions = getFunctions(app)

  connectFunctionsEmulator(functions, host, getPort(options, 5001))
}

export const connectToFirestoreEmulator = async (
  app: FirebaseApp,
  options: PortOptions | true,
  host: string,
) => {
  const { getFirestore, connectFirestoreEmulator } = await import(
    'firebase/firestore'
  )
  const firestore = getFirestore(app)
  connectFirestoreEmulator(firestore, host, getPort(options, 8080))
}

export const connectToFirestoreLiteEmulator = async (
  app: FirebaseApp,
  options: PortOptions | true,
  host: string,
) => {
  const { getFirestore, connectFirestoreEmulator } = await import(
    'firebase/firestore/lite'
  )

  const firestore = getFirestore(app)

  connectFirestoreEmulator(firestore, host, getPort(options, 8080))
}
