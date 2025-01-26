enum HandleAuthActionMode {
  ResetPassword = 'resetPassword',
  RecoverEmail = 'recoverEmail',
  VerifyEmail = 'verifyEmail',
  VerifyAndChangeEmail = 'verifyAndChangeEmail',
}

interface HandleAuthActionCallbacks {
  onResetPassword: (params: {
    oobCode: string
    continueUrl: string | undefined
  }) => void
  onRecoverEmail: (params: {
    oobCode: string
    continueUrl: string | undefined
  }) => void
  onVerifyEmail: (params: {
    oobCode: string
    continueUrl: string | undefined
  }) => void
  onVerifyAndChangeEmail: (params: {
    oobCode: string
    continueUrl: string | undefined
  }) => void
  onInvalidMode: (mode: string) => void
}

interface HandleAuthActionParams {
  mode: string
  oobCode: string
  continueUrl?: string
}

export const useHandleAuthAction = ({
  onResetPassword,
  onRecoverEmail,
  onVerifyEmail,
  onVerifyAndChangeEmail,
  onInvalidMode,
}: HandleAuthActionCallbacks) => {
  const handleAction = ({
    mode,
    oobCode,
    continueUrl,
  }: HandleAuthActionParams) => {
    switch (mode as HandleAuthActionMode) {
      case HandleAuthActionMode.ResetPassword:
        onResetPassword({
          oobCode,
          continueUrl,
        })
        break
      case HandleAuthActionMode.RecoverEmail:
        onRecoverEmail({
          oobCode,
          continueUrl,
        })
        break
      case HandleAuthActionMode.VerifyEmail:
        onVerifyEmail({
          oobCode,
          continueUrl,
        })
        break
      case HandleAuthActionMode.VerifyAndChangeEmail:
        onVerifyAndChangeEmail({
          oobCode,
          continueUrl,
        })
        break
      default:
        onInvalidMode(mode)
    }
  }

  return {
    handleAction,
  }
}
