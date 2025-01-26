import type { FirebaseApp } from 'firebase/app'
import type { AppCheckOptions } from '../types.js'

export const initializeAppCheck = async (
  app: FirebaseApp,
  options: AppCheckOptions,
) => {
  const { initializeAppCheck, ReCaptchaV3Provider } = await import(
    'firebase/app-check'
  )

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(options.recaptchaSiteKey),
    isTokenAutoRefreshEnabled: options.isTokenAutoRefreshEnabled ?? true,
  })
}
