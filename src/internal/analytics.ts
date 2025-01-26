import type { FirebaseApp } from 'firebase/app'
import type { AnalyticsOptions } from '../types.js'

export const initializeAnalytics = async (
  app: FirebaseApp,
  options: AnalyticsOptions,
) => {
  const { getAnalytics, setUserProperties } = await import('firebase/analytics')

  const analytics = getAnalytics(app)
  setUserProperties(analytics, {
    version: options.version,
  })
}
