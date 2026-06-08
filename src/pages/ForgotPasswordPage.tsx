import { EmailOutlined } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { requestPasswordReset } from '@/services/authApi'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await requestPasswordReset(trimmedEmail)
      setSent(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Demande impossible pour le moment. Reessayez plus tard.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4, bgcolor: '#f8fafc' }}>
      <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 3, boxShadow: '0 16px 48px rgba(15,23,42,0.1)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <BrandMark />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800}>
                Mot de passe oublie
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Saisissez l&apos;adresse email de votre compte pour recevoir un lien de reinitialisation.
              </Typography>
            </Box>
          </Stack>

          {sent ? (
            <Stack spacing={2}>
              <Alert severity="success" icon={<EmailOutlined />}>
                Si un compte est associe a cette adresse email, vous recevrez un lien de reinitialisation.
                Consultez votre boite mail (et vos spams).
              </Alert>
              <Button component={RouterLink} to="/login" variant="contained" fullWidth>
                Retour a la connexion
              </Button>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  fullWidth
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: 'text.secondary', opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !email.trim()}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <EmailOutlined />}
                  sx={{ py: 1.25, fontWeight: 700 }}
                >
                  {submitting ? 'Envoi...' : 'Envoyer le lien de reinitialisation'}
                </Button>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  <Button component={RouterLink} to="/login" size="small">
                    Retour a la connexion
                  </Button>
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
