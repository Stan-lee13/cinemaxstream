import { toast } from 'sonner';
import * as Sentry from "@sentry/react";

interface ErrorWithMessage {
  message: string;
}

// Type guard to check if an error object has a 'message' property
function hasMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string';
}

export const handleError = (error: unknown, customMessage?: string) => {
  // Log the full error object to the console for debugging
  console.error("Error:", error);

  // Report error to Sentry
  Sentry.captureException(error);

  let displayMessage: string;

  if (customMessage) {
    displayMessage = customMessage;
    // Optionally append the specific error message if it exists and is different
    if (hasMessage(error) && error.message && error.message !== customMessage) {
      // displayMessage += `: ${error.message}`; // Decided against this to keep messages cleaner if custom one is primary
    }
  } else if (hasMessage(error) && error.message) {
    displayMessage = error.message;
  } else {
    displayMessage = "An unexpected error occurred. Please try again.";
  }

  toast.error(displayMessage);
};

export default handleError;
