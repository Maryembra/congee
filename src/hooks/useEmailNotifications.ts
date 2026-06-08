import { useCallback, useEffect, useState } from 'react'
import {
  fetchEmailNotifications,
  type EmailNotificationLog,
} from '@/features/notifications/notificationsApi'

export function useEmailNotifications(limit = 15) {
  const [logs, setLogs] = useState<EmailNotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEmailNotifications(limit)
      setLogs(data)
    } catch {
      setLogs([])
      setError('Impossible de charger les notifications e-mail.')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    load()
  }, [load])

  const clear = useCallback(() => setLogs([]), [])

  return { logs, loading, error, reload: load, clear }
}

export function formatEmailLogTime(timestamp: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}
