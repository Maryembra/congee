import type { ReactNode } from 'react'
import LoadingSpinner from '@/components/atoms/LoadingSpinner'
import ErrorMessage from '@/components/atoms/ErrorMessage'
import EmptyState from '@/components/atoms/EmptyState'

type Props = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: ReactNode
  emptyAction?: ReactNode
  onRetry?: () => void
  children: ReactNode
}

export default function AsyncContent({
  status,
  error,
  isEmpty,
  emptyTitle = 'Aucune donnée',
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRetry,
  children,
}: Props) {
  if (status === 'loading') {
    return <LoadingSpinner fullHeight />
  }

  if (status === 'failed' && error) {
    return <ErrorMessage message={error} onRetry={onRetry} />
  }

  if (status === 'succeeded' && isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    )
  }

  return <>{children}</>
}
