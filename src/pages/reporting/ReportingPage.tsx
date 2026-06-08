import { Assessment } from '@mui/icons-material'
import { Box, Card, CardContent, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import SectionHeader from '@/components/admin/SectionHeader'
import StatCard from '@/components/admin/StatCard'
import AsyncContent from '@/components/molecules/AsyncContent'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchDashboard } from '@/features/dashboard/dashboardSlice'
export default function ReportingPage() {
  const dispatch = useAppDispatch()
  const roles = useAppSelector((state) => state.auth.roles)
  const data = useAppSelector((state) => state.dashboard.data)
  const status = useAppSelector((state) => state.dashboard.status)
  const error = useAppSelector((state) => state.dashboard.error)
  const [annee, setAnnee] = useState(new Date().getFullYear())

  useEffect(() => {
    if (roles.includes('ADMIN') || roles.includes('CHEF_HIERARCHIE') || roles.includes('SIGNATAIRE')) {
      dispatch(fetchDashboard({ annee }))
    }
  }, [annee, dispatch, roles])

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Reporting"
        subtitle="Statistiques par etat, direction, type de conge et mois."
        actions={
          <TextField select size="small" label="Annee" value={annee} onChange={(e) => setAnnee(Number(e.target.value))} sx={{ minWidth: 140 }}>
            {[annee - 1, annee, annee + 1].map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
        }
      />

      <AsyncContent
        status={roles.includes('ADMIN') || roles.includes('CHEF_HIERARCHIE') || roles.includes('SIGNATAIRE') ? status : 'succeeded'}
        error={error}
        onRetry={() => dispatch(fetchDashboard({ annee }))}
      >
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard label="En cours" value={`${data?.demandesEnCours.total ?? 0}`} icon={<Assessment />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Total validees" value={`${data?.tauxValidationRejet.totalValidees ?? 0}`} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Total rejetees" value={`${data?.tauxValidationRejet.totalRejetees ?? 0}`} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {[
          { title: 'Par direction', items: data?.demandesParDirection ?? [] },
          { title: 'Par type', items: data?.demandesParType ?? [] },
          { title: 'Par mois', items: (data?.demandesParMois ?? []).map((item) => ({ key: `Mois ${item.month}`, total: item.total })) },
        ].map((section) => (
          <Grid key={section.title} item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {section.title}
                </Typography>
                <Stack spacing={1.4}>
                  {section.items.map((item) => (
                    <Box key={item.key}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{item.key}</Typography>
                        <Typography variant="body2" fontWeight={700}>{item.total}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(Number(item.total) * 10, 100)} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </AsyncContent>
    </Box>
  )
}
