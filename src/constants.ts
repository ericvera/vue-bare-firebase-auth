/**
 * Represents the different types of authentication actions that can be performed.
 */
export enum AuthAction {
  /** Action for resetting a user's password */
  ResetPassword = 'resetPassword',
  /** Action for recovering a user's email */
  RecoverEmail = 'recoverEmail',
  /** Action for verifying a user's email */
  VerifyEmail = 'verifyEmail',
  /** Action for verifying and changing a user's email */
  VerifyAndChangeEmail = 'verifyAndChangeEmail',
}
