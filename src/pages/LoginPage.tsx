import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import {
  AutoAwesome,
  ErrorOutline,
  Fingerprint,
  LockOutlined,
  PersonOutline,
  VerifiedUserOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { login, setCurrentUser } from '@/features/auth/authSlice'
import BrandMark from '@/components/brand/BrandMark'
import { fetchProfile } from '@/features/users/usersSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const error = useAppSelector((state) => state.auth.error)
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await dispatch(login({ login: loginValue, password }))
    if (login.fulfilled.match(result)) {
      const profileResult = await dispatch(fetchProfile())
      if (fetchProfile.fulfilled.match(profileResult)) {
        dispatch(setCurrentUser(profileResult.payload))
      }
      navigate('/')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Background Aura Glow Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '35vw',
          height: '35vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Card
        className="slide-up"
        sx={{
          width: 'min(1000px, 100%)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
          overflow: 'hidden',
          borderRadius: 6,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Box
          sx={{
            p: { xs: 4, sm: 6 },
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: { xs: '320px', md: '500px' },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15), transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box>
            <BrandMark size="large" invert />
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                mb: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gérez vos congés en toute simplicité
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
              Suivez vos demandes, planifiez vos absences et signez vos documents officiels dans un espace unique et sécurisé.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {[
              {
                icon: <AutoAwesome sx={{ color: '#ec4899', fontSize: 20 }} />,
                text: 'Workflow automatisé et validation rapide'
              },
              {
                icon: <VerifiedUserOutlined sx={{ color: '#6366f1', fontSize: 20 }} />,
                text: 'Signature de document'
              },
              {
                icon: <Fingerprint sx={{ color: '#10b981', fontSize: 20 }} />,
                text: 'Traçabilité et sécurité des documents'
              }
            ].map((item, idx) => (
              <Stack key={idx} direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" fontWeight={500} sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  {item.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <CardContent
          sx={{
            p: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                letterSpacing: '-0.01em',
                color: 'text.primary',
                mb: 1
              }}
            >
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Renseignez vos identifiants pour accéder à la plateforme.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
            <TextField
              label="Email ou identifiant"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              autoComplete="username"
              required
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: 'text.secondary', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary', opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button component={RouterLink} to="/mot-de-passe-oublie" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Mot de passe oublie ?
              </Button>
            </Box>

            {error && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: 'error.dark',
                }}
              >
                <ErrorOutline sx={{ flexShrink: 0, color: 'error.main' }} />
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === 'loading'}
              sx={{
                py: 1.6,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                boxShadow: '0 4px 14px rgba(67, 56, 202, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
                  boxShadow: '0 6px 20px rgba(67, 56, 202, 0.35)',
                },
                mt: 1,
              }}
            >
              {status === 'loading' ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Se connecter'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Digital Factory. Tous droits réservés.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

