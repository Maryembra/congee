import {
  AccountTree,
  BadgeOutlined,
  BusinessCenter,
  ChevronRight,
  EmailOutlined,
  EventNote,
  Logout,
  PersonOutline,
  ShieldOutlined,
  VerifiedUser,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useMemo } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/organisms/PageHeader'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import type { RoleCode } from '@/features/auth/authTypes'

const cardSx = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 4px 24px rgba(15, 23, 42, 0.05)',
  height: '100%',
}

const roleLabels: Record<RoleCode, string> = {
  ADMIN: 'Administrateur',
  FONCTIONNAIRE: 'Fonctionnaire',
  CHEF_HIERARCHIE: 'Chef de hiérarchie',
  SIGNATAIRE: 'Signataire',
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function computeSeniority(dateDebut?: string | null) {
  if (!dateDebut) return null
  const start = new Date(dateDebut)
  if (Number.isNaN(start.getTime())) return null
  const years = (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return Math.max(0, years)
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.4}>
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const f = user?.fonctionnaire

  const initials = useMemo(() => {
    const firstName = f?.firstName?.[0] ?? user?.username?.[0] ?? '?'
    const lastName = f?.lastName?.[0] ?? ''
    return `${firstName}${lastName}`.toUpperCase()
  }, [f, user?.username])

  const seniority = useMemo(() => computeSeniority(f?.employmentStartDate), [f?.employmentStartDate])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <Box>
      <PageHeader
        title="Mon profil"
        subtitle="Vos informations professionnelles et le rattachement à votre organisation."
      />

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                fontWeight: 800,
                fontSize: '1.35rem',
                boxShadow: '0 8px 24px rgba(67, 56, 202, 0.25)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800}>
                {f?.firstName} {f?.lastName}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                {f?.grade || 'Grade non renseigné'} · PPR {f?.ppr ?? '—'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                <Chip
                  size="small"
                  icon={<VerifiedUser sx={{ fontSize: '16px !important' }} />}
                  label={user?.enabled ? 'Compte actif' : 'Compte inactif'}
                  color={user?.enabled ? 'success' : 'default'}
                  variant={user?.enabled ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600 }}
                />
                {user?.roles.map((role) => (
                  <Chip
                    key={role}
                    size="small"
                    label={roleLabels[role]}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button component={RouterLink} to="/demandes" variant="contained" startIcon={<EventNote />} fullWidth>
                Mes demandes
              </Button>
              <Button component={RouterLink} to="/quotas" variant="outlined" startIcon={<BadgeOutlined />} fullWidth>
                Mes quotas
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <PersonOutline color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Identité professionnelle
                </Typography>
              </Stack>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="PRÉNOM" value={f?.firstName ?? '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="NOM" value={f?.lastName ?? '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="PPR" value={f?.ppr ?? '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="GRADE" value={f?.grade || '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="DATE DE RECRUTEMENT" value={formatDate(f?.employmentStartDate)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    label="ANCIENNETÉ"
                    value={seniority != null ? `${seniority.toFixed(1)} ans` : '—'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <AccountTree color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Rattachement organisationnel
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { label: 'Direction', value: f?.directionName },
                  { label: 'Division', value: f?.divisionName },
                  { label: 'Service', value: f?.serviceName },
                ].map((item, index, items) => (
                  <Box key={item.label}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BusinessCenter sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {item.label.toUpperCase()}
                        </Typography>
                        <Typography fontWeight={700}>{item.value || '—'}</Typography>
                      </Box>
                      {index < items.length - 1 ? (
                        <ChevronRight sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'block' } }} />
                      ) : null}
                    </Stack>
                    {index < items.length - 1 ? <Divider sx={{ mt: 1.5 }} /> : null}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <ShieldOutlined color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Compte et sécurité
                </Typography>
              </Stack>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={4}>
                  <InfoItem label="IDENTIFIANT DE CONNEXION" value={user?.username ?? '—'} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <EmailOutlined sx={{ mt: 0.5, color: 'text.secondary' }} />
                    <InfoItem label="EMAIL PROFESSIONNEL" value={user?.email ?? '—'} />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoItem
                    label="ACTIVATION DU COMPTE"
                    value={user?.accountActivated ? 'Activé' : 'En attente d\'activation'}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
              >
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, lineHeight: 1.6 }}>
                  La réinitialisation du mot de passe se fait depuis la page de connexion, après déconnexion,
                  via <strong>Mot de passe oublié</strong>. Un lien sécurisé vous sera envoyé par email.
                </Typography>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Logout />}
                  onClick={() => void handleLogout()}
                  sx={{ flexShrink: 0 }}
                >
                  Se déconnecter
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
