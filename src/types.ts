import { FirebaseOptions } from 'firebase/app'

export interface PortOptions {
  port: number
}

export interface EmulatorOptions {
  host?: string
  auth?: PortOptions | true
  functions?: PortOptions | true
  firestore?: PortOptions | true
}

export interface AnalyticsOptions {
  version: string
}

export interface AppCheckOptions {
  recaptchaSiteKey: string
  isTokenAutoRefreshEnabled?: boolean
}

export interface FirebaseInitOptions {
  config: FirebaseOptions
  emulators?: EmulatorOptions
  analytics?: AnalyticsOptions
  appCheck?: AppCheckOptions
}
