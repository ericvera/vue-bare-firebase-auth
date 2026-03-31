import { FirebaseOptions } from 'firebase/app'
import type { PerformanceSettings } from 'firebase/performance'

export type PerformanceOptions = PerformanceSettings

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
  /** Optional Firestore database ID for named databases (Enterprise) */
  databaseId?: string
  emulators?: EmulatorOptions
  analytics?: AnalyticsOptions
  appCheck?: AppCheckOptions
  performance?: PerformanceOptions
}
