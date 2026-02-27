# Vue Bare Firebase Auth

**Simple Vue 3 composables for Firebase Authentication**

[![github license](https://img.shields.io/github/license/ericvera/vue-bare-firebase-auth.svg?style=flat-square)](https://github.com/ericvera/vue-bare-firebase-auth/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/vue-bare-firebase-auth.svg?style=flat-square)](https://npmjs.org/package/vue-bare-firebase-auth)

Vue Bare Firebase Auth provides a collection of lightweight, typed Vue 3 composables that handle common Firebase Authentication operations with excellent developer experience.

## Features

- 🔑 **Complete Auth Coverage**: Handles all standard Firebase auth operations
- 📊 **Reactive State**: Full integration with Vue's reactivity system
- 🔄 **Atomic Updates**: Ensures multiple state properties update together
- 📝 **Hybrid API**: Use state objects or individual computed properties
- 🔒 **Type-Safe**: Written in TypeScript with full type definitions
- 📦 **Tree-Shakeable**: Only import what you need
- 🪶 **Lightweight**: No unnecessary dependencies

## Requirements

- Vue >=3.5.0
- Firebase >=12.2.0
- TypeScript >=5.9.2

## Initialization

Use `initFirebase` to initialize your Firebase app with optional emulator connections, App Check, and Analytics:

```ts
import { initFirebase } from 'vue-bare-firebase-auth'

const app = await initFirebase({
  config: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    // ...other config
  },
  databaseId: 'my-database', // optional, for Firestore Enterprise named databases
  emulators: {
    host: '127.0.0.1',
    auth: true,
    firestore: true,
  },
})

// Use getFirestore(app, 'my-database') when accessing Firestore with a named database
```

## Error Handling

This library follows a streamlined approach to error handling:

- **Expected errors** (like invalid credentials or already-used emails) are captured in the `result` state
- **Unexpected errors** (like network issues) are thrown to be handled by your app's error boundaries or try/catch blocks
- **Auth store errors** are available via the `error` property in the auth store and can be identified using `AuthStoreError` and `AuthStoreErrorCode`

```ts
try {
  // Attempt a sign-in
  await signInWithEmailAndPassword('user@example.com', 'password')

  // Check for expected errors
  if (result.value === SignInResult.InvalidCredential) {
    // Show user-friendly error message
  } else {
    // Success, proceed with navigation
  }
} catch (error) {
  // Handle unexpected errors (network issues, etc.)
  router.push('/error')
}
```

For handling auth store errors:

```ts
import {
  useAuthStore,
  AuthStoreError,
  AuthStoreErrorCode,
} from 'vue-bare-firebase-auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { error } = storeToRefs(authStore)

watch(error, (currentError) => {
  if (currentError instanceof AuthStoreError) {
    switch (currentError.code) {
      case AuthStoreErrorCode.LoadingTimedOut:
        console.log('Auth store loading timed out')
        break
      case AuthStoreErrorCode.Unknown:
        console.log('Unknown auth store error')
        break
      default:
        // Handle other error codes including Firebase errors
        console.error(
          `Auth error: ${currentError.message} (${currentError.code})`,
        )
    }
  }
})
```

## Composables

### `useAuthStore`

Central store for managing authentication state including user info and claims.

```ts
import {
  useAuthStore,
  AuthStoreError,
  AuthStoreErrorCode,
} from 'vue-bare-firebase-auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()

// Access via individual refs
const { user, claims, loaded, isLoggedIn, error } = storeToRefs(authStore)

// Or access all state at once
const { state } = storeToRefs(authStore)

// Watch for any changes to the entire auth state
watch(state, (newState) => {
  console.log('Auth state changed:', newState)
})

// Watch for specific auth errors
watch(error, (currentError) => {
  if (currentError instanceof AuthStoreError) {
    if (currentError.code === AuthStoreErrorCode.LoadingTimedOut) {
      console.log('Auth store loading timed out')
    }
  }
})

// Initialize auth tracking
await authStore.init()

// Wait for auth to load
await authStore.waitUntilLoaded()

// Sign out
await authStore.signOut()

// Clear any errors
authStore.clearError()
```

### `useCreateUserWithEmailAndPassword`

Create a new user with email and password, handling common error cases.

```ts
import { useCreateUserWithEmailAndPassword } from 'vue-bare-firebase-auth'

const {
  state, // Combined state object
  submitting, // Individual computed property
  result, // Individual computed property
  createUserWithEmailAndPassword,
} = useCreateUserWithEmailAndPassword()

try {
  await createUserWithEmailAndPassword('user@example.com', 'password123')

  if (result.value === CreateUserResult.Success) {
    // User created successfully
  } else if (result.value === CreateUserResult.EmailAlreadyInUse) {
    // Handle email already in use
  }
} catch (error) {
  // Handle unexpected errors
}
```

### `useSignInWithEmailAndPassword`

Sign in with email and password, with built-in error handling.

```ts
import { useSignInWithEmailAndPassword } from 'vue-bare-firebase-auth'

const { state, submitting, result, signInWithEmailAndPassword } =
  useSignInWithEmailAndPassword()

try {
  await signInWithEmailAndPassword('user@example.com', 'password123')

  if (result.value === SignInResult.InvalidCredential) {
    // Handle invalid credentials
  }
} catch (error) {
  // Handle unexpected errors
}
```

### `useSendEmailVerification`

Send and track email verification requests.

```ts
import { useSendEmailVerification } from 'vue-bare-firebase-auth'

const { state, loaded, submitting, email, result, sendEmailVerification } =
  useSendEmailVerification()

try {
  await sendEmailVerification()
} catch (error) {
  // Handle unexpected errors
}
```

### `useVerifyEmail`

Handle email verification from verification links.

```ts
import { useVerifyEmail } from 'vue-bare-firebase-auth'

const { state, loaded, result, handleVerifyEmail } = useVerifyEmail()

try {
  // Use with verification code from URL
  await handleVerifyEmail(oobCode)

  if (result.value === VerifyEmailError.ExpiredActionCode) {
    // Handle expired code
  }
} catch (error) {
  // Handle unexpected errors
}
```

### `useSendPasswordResetEmail`

Send password reset emails to users.

```ts
import { useSendPasswordResetEmail } from 'vue-bare-firebase-auth'

const { state, submitting, result, sendPasswordResetEmail } =
  useSendPasswordResetEmail()

try {
  await sendPasswordResetEmail('user@example.com')
} catch (error) {
  // Handle unexpected errors
}
```

### `useResetPassword`

Handle password reset from reset links.

```ts
import { useResetPassword } from 'vue-bare-firebase-auth'

const {
  state,
  loaded,
  submitting,
  result,
  email,
  handleResetPassword,
  resetPassword,
} = useResetPassword()

try {
  // First verify the code
  await handleResetPassword(oobCode)

  // Then reset the password if verification succeeded
  if (result.value === 'enter-password') {
    await resetPassword(oobCode, 'new-password')
  } else if (result.value === ResetPasswordError.ExpiredActionCode) {
    // Handle expired code
  }
} catch (error) {
  // Handle unexpected errors
}
```

### `useRecoverEmail`

Handle email recovery when a user's email was changed without permission.

```ts
import { useRecoverEmail } from 'vue-bare-firebase-auth'

const { state, result, email, loaded, handleRecoverEmail } = useRecoverEmail()

try {
  await handleRecoverEmail(oobCode)

  if (result.value === RecoverEmailError.InvalidActionCode) {
    // Handle invalid code
  }
} catch (error) {
  // Handle unexpected errors
}
```

## State Management

All composables provide two ways to access reactive state:

1. **State object**: Access all state properties in one reactive object

   ```ts
   const { state } = useSignInWithEmailAndPassword()

   // Watch for any state changes with a single watcher
   watch(state, (newState) => {
     console.log(newState.submitting, newState.result)
   })
   ```

2. **Individual computed properties**: Access properties separately

   ```ts
   const { submitting, result } = useSignInWithEmailAndPassword()

   // Use in templates
   <button :disabled="submitting">Sign In</button>
   ```

This hybrid approach ensures atomic updates while providing a convenient developer experience.
