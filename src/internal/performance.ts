import type { FirebaseApp } from 'firebase/app'
import type { PerformanceOptions } from '../types.js'

export const initializePerformanceMonitoring = async (
  app: FirebaseApp,
  options: PerformanceOptions,
) => {
  if (typeof window === 'undefined') {
    return
  }

  const { initializePerformance } = await import('firebase/performance')

  initializePerformance(app, options)
}
