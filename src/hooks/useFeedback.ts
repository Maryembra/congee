import { useCallback, useState } from 'react'

export type FeedbackSeverity = 'success' | 'error' | 'info' | 'warning'

export type FeedbackState = {
  severity: FeedbackSeverity
  message: string
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const clearFeedback = useCallback(() => setFeedback(null), [])

  const showSuccess = useCallback((message: string) => {
    setFeedback({ severity: 'success', message })
  }, [])

  const showError = useCallback((message: string) => {
    setFeedback({ severity: 'error', message })
  }, [])

  const showInfo = useCallback((message: string) => {
    setFeedback({ severity: 'info', message })
  }, [])

  return {
    feedback,
    clearFeedback,
    showSuccess,
    showError,
    showInfo,
  }
}
