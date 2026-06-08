import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

type Props = {
  open: boolean
  title: string
  content: string
  confirmLabel?: string
  cancelLabel?: string
  severity?: 'primary' | 'error' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  content,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  severity = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onCancel} color="inherit" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={severity}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Chargement...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
