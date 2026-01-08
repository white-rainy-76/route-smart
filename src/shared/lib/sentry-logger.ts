// Sentry logger configuration
// TODO: Configure Sentry when needed

export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, context)
  // Sentry.captureException(error, { extra: context })
}

export const logInfo = (message: string, context?: Record<string, any>) => {
  console.log('Info:', message, context)
  // Sentry.captureMessage(message, { level: 'info', extra: context })
}
