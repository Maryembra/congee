import { apiClient } from '@/services/apiClient'

export type EmailNotificationLog = {
  id: number
  timestamp: string
  type: string
  to: string
  subject: string
  details: string
  status: string
  success: boolean
}

export const fetchEmailNotifications = async (limit = 15) => {
  const response = await apiClient.get<EmailNotificationLog[]>('/api/notifications/emails', {
    params: { limit },
  })
  return response.data
}
