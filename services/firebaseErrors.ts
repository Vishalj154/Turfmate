import { FirebaseError } from 'firebase/app';

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred.';
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'unavailable':
        return 'Network connection unavailable. Operating in offline mode.';
      case 'failed-precondition':
        return 'Operation failed due to network condition or conflict. Please try again.';
      case 'deadline-exceeded':
        return 'The request timed out due to slow network connection. Please try again.';
      case 'permission-denied':
        return 'Permission denied to access this resource.';
      case 'unauthenticated':
        return 'Session expired. Please log in again.';
      case 'resource-exhausted':
        return 'Server limit reached. Please try again in a few moments.';
      case 'cancelled':
        return 'Operation was cancelled.';
      default:
        return 'Database connection error. Please check your internet connection.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('offline') || error.message.includes('fetch')) {
      return 'Network connection error. Operating in offline mode.';
    }
    return error.message;
  }

  return 'Unable to complete database request. Please check your connection.';
}

