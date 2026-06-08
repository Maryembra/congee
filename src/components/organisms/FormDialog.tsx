import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { DialogProps } from '@mui/material'
import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  onSave?: () => void
  saveLabel?: string
  cancelLabel?: string
  loading?: boolean
  saveDisabled?: boolean
  saveColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  hideActions?: boolean
  maxWidth?: DialogProps['maxWidth']
  titleSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

export default function FormDialog({
  open,
  title,
  children,
  onClose,
  onSave,
  saveLabel = 'Sauvegarder',
  cancelLabel = 'Annuler',
  loading = false,
  saveDisabled = false,
  saveColor = 'primary',
  hideActions = false,
  maxWidth = 'sm',
  titleSx,
  contentSx,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle fontWeight={700} sx={titleSx}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: 2, ...contentSx }}>
        {children}
      </DialogContent>
      {!hideActions && (
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            {cancelLabel}
          </Button>
          {onSave && (
            <Button variant="contained" color={saveColor} onClick={onSave} disabled={loading || saveDisabled}>
              {loading ? 'Chargement...' : saveLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}
