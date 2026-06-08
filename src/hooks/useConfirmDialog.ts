import { useCallback, useState } from 'react'

export type ConfirmDialogRequest = {
  title: string
  content: string
  confirmLabel?: string
  cancelLabel?: string
  severity?: 'primary' | 'error' | 'warning'
  onConfirm: () => void | Promise<void>
}

type ConfirmDialogState = ConfirmDialogRequest & {
  open: boolean
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState | null>(null)
  const [loading, setLoading] = useState(false)

  const requestConfirm = useCallback((request: ConfirmDialogRequest) => {
    setState({ ...request, open: true })
  }, [])

  const handleCancel = useCallback(() => {
    if (!loading) {
      setState(null)
    }
  }, [loading])

  const handleConfirm = useCallback(async () => {
    if (!state) return

    setLoading(true)
    try {
      await state.onConfirm()
      setState(null)
    } finally {
      setLoading(false)
    }
  }, [state])

  return {
    confirmState: state,
    confirmLoading: loading,
    requestConfirm,
    handleConfirm,
    handleCancel,
  }
}
