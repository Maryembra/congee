import { CheckCircleOutline, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { resetPassword, validateResetPasswordToken } from '@/services/authApi'

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  disabled?: boolean
}) {
  return (
    <TextField
      fullWidth
      type={show ? 'text' : 'password'}
      label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton edge="end" onClick={onToggleShow} disabled={disabled} aria-label="Afficher le mot de passe">
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(Boolean(token))
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const checkToken = async () => {
      setValidating(true)
      try {
        await validateResetPasswordToken(token)
        if (!cancelled) setTokenError(null)
      } catch {
        if (!cancelled) {
          setTokenError('Ce lien est invalide, deja utilise ou expire. Demandez un nouveau lien depuis la page de connexion.')
        }
      } finally {
        if (!cancelled) setValidating(false)
      }
    }
    void checkToken()
    return () => {
      cancelled = true
    }
  }, [token])

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password),
      match: password.length > 0 && password === confirmPassword,
    }),
    [password, confirmPassword],
  )

  const passwordReady =
    passwordChecks.length && passwordChecks.upper && passwordChecks.lower && passwordChecks.digit
  const canSubmit = token && !tokenError && passwordReady && passwordChecks.match && !submitting && !validating

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Reinitialisation impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, bgcolor: '#f8fafc' }}>
        <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Lien de reinitialisation invalide
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ce lien est incomplet. Demandez un nouveau lien depuis la page de connexion.
            </Typography>
            <Button component={RouterLink} to="/mot-de-passe-oublie" variant="contained">
              Demander un nouveau lien
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (validating) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Verification du lien...</Typography>
        </Stack>
      </Box>
    )
  }

  if (tokenError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, bgcolor: '#f8fafc' }}>
        <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {tokenError}
            </Alert>
            <Stack spacing={1}>
              <Button component={RouterLink} to="/mot-de-passe-oublie" variant="contained" fullWidth>
                Demander un nouveau lien
              </Button>
              <Button component={RouterLink} to="/login" fullWidth>
                Retour a la connexion
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4, bgcolor: '#f8fafc' }}>
      <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 3, boxShadow: '0 16px 48px rgba(15,23,42,0.1)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <BrandMark />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800}>
                Nouveau mot de passe
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Choisissez un mot de passe securise pour votre compte
              </Typography>
            </Box>
          </Stack>

          {success ? (
            <Alert severity="success" icon={<CheckCircleOutline />}>
              Mot de passe reinitialise avec succes. Redirection vers la connexion...
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                <PasswordField
                  label="Nouveau mot de passe"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                />
                <PasswordField
                  label="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggleShow={() => setShowConfirm((v) => !v)}
                />

                <Stack spacing={0.5}>
                  <Typography variant="caption" color={passwordChecks.length ? 'success.main' : 'text.secondary'}>
                    • Au moins 8 caracteres
                  </Typography>
                  <Typography variant="caption" color={passwordChecks.upper ? 'success.main' : 'text.secondary'}>
                    • Au moins une majuscule
                  </Typography>
                  <Typography variant="caption" color={passwordChecks.lower ? 'success.main' : 'text.secondary'}>
                    • Au moins une minuscule
                  </Typography>
                  <Typography variant="caption" color={passwordChecks.digit ? 'success.main' : 'text.secondary'}>
                    • Au moins un chiffre
                  </Typography>
                  <Typography variant="caption" color={passwordChecks.match ? 'success.main' : 'text.secondary'}>
                    • Les mots de passe correspondent
                  </Typography>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!canSubmit}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockOutlined />}
                  sx={{ py: 1.25, fontWeight: 700 }}
                >
                  {submitting ? 'Enregistrement...' : 'Reinitialiser le mot de passe'}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
