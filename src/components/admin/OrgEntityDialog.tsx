import { Close } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { orgDialogPaperSx } from '@/components/admin/orgAdminStyles'

export type OrgEntityMode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: OrgEntityMode
  title: string
  subtitle?: string
  icon: ReactNode
  onClose: () => void
  onSubmit: () => void
  submitLabel: string
  children: ReactNode
  error?: string | null
  loading?: boolean
}

export default function OrgEntityDialog({
  open,
  mode,
  title,
  subtitle,
  icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
  error,
  loading = false,
}: Props) {
  const theme = useTheme()

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: orgDialogPaperSx }}
    >
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'primary.contrastText',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha('#fff', 0.18),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& svg': { fontSize: 26 },
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                  {title}
                </Typography>
                <Chip
                  size="small"
                  label={mode === 'create' ? 'Création' : 'Modification'}
                  sx={{
                    height: 22,
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    bgcolor: alpha('#fff', 0.2),
                    color: 'inherit',
                    border: '1px solid',
                    borderColor: alpha('#fff', 0.35),
                  }}
                />
              </Stack>
              {subtitle ? (
                <Typography variant="body2" sx={{ opacity: 0.92, lineHeight: 1.5 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{
              color: 'inherit',
              bgcolor: alpha('#fff', 0.12),
              '&:hover': { bgcolor: alpha('#fff', 0.22) },
            }}
            aria-label="Fermer"
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 3, bgcolor: 'background.default' }}>
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : null}
          {children}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2,
          gap: 1.5,
          bgcolor: 'background.paper',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="caption" color="text.secondary">
            Les champs marqués * sont obligatoires
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2, minWidth: { sm: 120 } }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{ borderRadius: 2, minWidth: { sm: 160 }, px: 3 }}
        >
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} color="inherit" />
              <span>Enregistrement…</span>
            </Stack>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
