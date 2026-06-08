import { 
  AssignmentTurnedIn, 
  EventAvailable, 
  FactCheck, 
  TrendingUp, 
  CheckCircle, 
  Cancel, 
  Email,
  DeleteOutline
} from '@mui/icons-material'
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  LinearProgress, 
  Stack, 
  Typography,
  Button
} from '@mui/material'
import PageHeader from '@/components/organisms/PageHeader'
import StatsRow from '@/components/organisms/StatsRow'
import StatCard from '@/components/molecules/StatCard'
import StatusBadge from '@/components/atoms/StatusBadge'
import { statusMap } from '@/components/atoms/statusBadge.config'
import AsyncContent from '@/components/molecules/AsyncContent'
import { useDashboard } from '@/hooks/useDashboard'
import { formatEmailLogTime, useEmailNotifications } from '@/hooks/useEmailNotifications'
import type { StatutDemande } from '@/features/demandes/demandeTypes'
import { useMemo } from 'react'

// Custom circular progress ring SVG component
const CircularProgressRing = ({ value, max }: { value: number; max: number }) => {
  const radius = 70
  const stroke = 12
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(value, max) / (max || 1)) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
      {/* Background track */}
      <circle
        stroke="#f1f5f9"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Active progress */}
      <circle
        stroke="#10b981"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

// Sub-component: Custom CSS/SVG Monthly Bar Chart
const MonthlyChart = ({ data }: { data: { month: number; total: number }[] }) => {
  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const maxVal = Math.max(...data.map(d => d.total), 1)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, px: 1, pt: 2, pb: 1 }}>
        {data.map((item, idx) => {
          const pct = (item.total / maxVal) * 100
          const hasData = item.total > 0
          return (
            <Box 
              key={idx} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flexGrow: 1, 
                height: '100%', 
                justifyContent: 'flex-end',
                gap: 1 
              }}
            >
              <Box 
                sx={{ 
                  width: 'min(28px, 80%)', 
                  height: '140px', 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2, 
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  border: '1px solid rgba(241, 245, 249, 0.8)'
                }}
              >
                {hasData ? (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: `${pct}%`, 
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', 
                      borderRadius: 'inherit',
                      transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)',
                    }}
                  />
                ) : null}
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary' }}>
                {monthLabels[idx]}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default function DashboardPage() {
  const { state } = useDashboard()
  const { user, dashboard, demandes, quotas, status, dashboardScope, currentYear } = state
  const { logs: emailLogs, loading: emailLogsLoading, error: emailLogsError, clear: clearEmailLogs } = useEmailNotifications(15)

  const annualQuota = quotas.find(q => q.leaveType === 'ANNUEL' && q.year === currentYear)
  const joursRestants = annualQuota?.remainingDays ?? null
  const quotaInitial = annualQuota?.initialQuota ?? null

  const latestDemandes = demandes.slice(0, 4)

  // 1. Calculate KPI Metrics dynamically for both standard and manager scopes
  const stats = useMemo(() => {
    if (dashboardScope && dashboard) {
      const totalDemandes = dashboard.demandesParEtat.reduce((acc, curr) => acc + curr.total, 0)
      const enCours = dashboard.demandesEnCours.total
      const validees = dashboard.tauxValidationRejet.totalValidees
      const rejetees = dashboard.tauxValidationRejet.totalRejetees
      const totalClosed = validees + rejetees
      const tauxApprobation = totalClosed > 0 ? (validees / totalClosed) * 100 : 100
      return { totalDemandes, enCours, validees, rejetees, tauxApprobation }
    } else {
      const totalDemandes = demandes.length
      const enCours = demandes.filter((d) => ['SOUMISE', 'VISE_CHEF'].includes(d.status)).length
      const validees = demandes.filter((d) => d.status === 'SIGNEE_DIRECTEUR').length
      const rejetees = demandes.filter((d) => ['REJETEE_CHEF', 'REJETEE_DIRECTEUR'].includes(d.status)).length
      const totalClosed = validees + rejetees
      const tauxApprobation = totalClosed > 0 ? (validees / totalClosed) * 100 : 100
      return { totalDemandes, enCours, validees, rejetees, tauxApprobation }
    }
  }, [dashboardScope, dashboard, demandes])

  // 2. Prepare Monthly chart dataset
  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }))
    if (dashboardScope && dashboard?.demandesParMois) {
      dashboard.demandesParMois.forEach(m => {
        if (m.month >= 1 && m.month <= 12) {
          data[m.month - 1].total = m.total
        }
      })
    } else if (demandes.length > 0) {
      demandes.forEach(d => {
        if (d.leaveStartDate) {
          const m = new Date(d.leaveStartDate).getMonth()
          if (m >= 0 && m < 12) {
            data[m].total += 1
          }
        }
      })
    }
    return data
  }, [dashboardScope, dashboard, demandes])

  // 3. Prepare Leave by Type progress lines
  const typeCounts = useMemo(() => {
    const list = [
      { key: 'ANNUEL', label: 'Annuel', color: '#10b981', total: 0 },
      { key: 'MALADIE', label: 'Maladie', color: '#ef4444', total: 0 },
      { key: 'EXCEPTIONNEL', label: 'Exceptionnel', color: '#f59e0b', total: 0 },
      { key: 'MATERNITE', label: 'Maternité', color: '#a855f7', total: 0 },
      { key: 'SANS_SOLDE', label: 'Sans solde', color: '#3b82f6', total: 0 }
    ]

    if (dashboardScope && dashboard?.demandesParType) {
      dashboard.demandesParType.forEach(item => {
        const found = list.find(l => l.key === item.key)
        if (found) found.total = item.total
      })
    } else {
      demandes.forEach(d => {
        const found = list.find(l => l.key === d.leaveType)
        if (found) found.total += 1
      })
    }
    return list
  }, [dashboardScope, dashboard, demandes])

  // 4. Prepare Direction attachment progress lines
  const directionsData = useMemo(() => {
    if (dashboardScope && dashboard?.demandesParDirection) {
      return dashboard.demandesParDirection
    }
    return []
  }, [dashboardScope, dashboard])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title={`Bonjour ${user?.fonctionnaire?.firstName ?? user?.username ?? ''}`}
        subtitle="Pilotez et suivez vos demandes de congés et validations."
      />

      <AsyncContent status={status}>
        <Grid container spacing={3}>
          
          {/* ================= COLUMN 1: LEFT WIDGETS ================= */}
          <Grid item xs={12} md={4} lg={3.3}>
            <Stack spacing={3}>
              
              {/* Widget: Portefeuille de Congés */}
              <Card sx={{ borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)', bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2, display: 'block' }}>
                    PORTEFEUILLE INDIVIDUEL DE CONGÉS
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 3 }}>
                    {user?.fonctionnaire ? `${user.fonctionnaire.firstName} ${user.fonctionnaire.lastName}` : user?.username}
                  </Typography>

                  <Box sx={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                    <CircularProgressRing value={joursRestants ?? 0} max={quotaInitial ?? 1} />
                    <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                        {joursRestants ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', fontWeight: 800, mt: 0.5, letterSpacing: '0.05em' }}>
                        JOURS RESTANTS
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1, bgcolor: '#f8fafc', p: 1.5, borderRadius: 3, width: '100%', justifyContent: 'center', border: '1px dashed #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Dispo: <strong>{joursRestants != null ? `${joursRestants} jours` : 'Non défini'}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">|</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Max annuel: <strong>{quotaInitial ?? '—'}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Widget: notifications e-mail réelles */}
              <Card sx={{ borderRadius: 4, bgcolor: '#0b1329', color: '#f8fafc', boxShadow: '0 12px 24px rgba(11, 19, 41, 0.25)', overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ position: 'relative', display: 'flex' }}>
                        <Email sx={{ color: '#10b981' }} />
                        {emailLogs.length > 0 && (
                          <Box sx={{ position: 'absolute', top: -5, right: -5, width: 14, height: 14, bgcolor: 'error.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white' }}>
                            {emailLogs.length}
                          </Box>
                        )}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '0.03em', fontSize: '0.82rem' }}>
                        NOTIFICATIONS E-MAIL
                      </Typography>
                    </Stack>
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={clearEmailLogs} 
                      startIcon={<DeleteOutline sx={{ fontSize: 14 }} />}
                      sx={{ color: 'rgba(255, 255, 255, 0.45)', '&:hover': { color: 'white' }, fontSize: '0.7rem', fontWeight: 600 }}
                    >
                      Masquer
                    </Button>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 2, fontSize: '0.72rem', lineHeight: 1.3 }}>
                    Historique réel des e-mails envoyés{user?.email ? ` — votre adresse : ${user.email}` : ''}
                  </Typography>

                  {emailLogsError && (
                    <Typography variant="caption" sx={{ color: '#f87171', display: 'block', mb: 2 }}>
                      {emailLogsError}
                    </Typography>
                  )}

                  <Stack spacing={2} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5, '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    {emailLogsLoading && (
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.35)', textAlign: 'center', py: 4, display: 'block' }}>
                        Chargement des notifications…
                      </Typography>
                    )}
                    {!emailLogsLoading && emailLogs.map((log) => (
                      <Box 
                        key={log.id} 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: 'rgba(255, 255, 255, 0.04)', 
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          fontSize: '0.78rem' 
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Box sx={{ px: 1, py: 0.2, bgcolor: log.type === 'SIGNATURE' ? 'success.dark' : log.type === 'REJET' ? 'error.dark' : 'primary.dark', borderRadius: 1, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {log.type}
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>{formatEmailLogTime(log.timestamp)}</Typography>
                        </Stack>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          À : {log.to}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Objet : {log.subject}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', whiteSpace: 'pre-wrap', lineHeight: 1.4, mb: 1, fontSize: '0.72rem' }}>
                          {log.details}
                        </Typography>
                        <Typography variant="caption" sx={{ color: log.success ? '#10b981' : '#f87171', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem', fontWeight: 600 }}>
                          {log.success ? '✓' : '✗'} {log.status}
                        </Typography>
                      </Box>
                    ))}
                    {!emailLogsLoading && emailLogs.length === 0 && (
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.35)', textAlign: 'center', py: 4, display: 'block' }}>
                        Aucun e-mail envoyé pour le moment. Les notifications apparaîtront ici après soumission, validation ou signature d&apos;une demande.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

          {/* ================= COLUMN 2: RIGHT MAIN PANELS ================= */}
          <Grid item xs={12} md={8} lg={8.7} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <StatsRow>
              <Grid item xs={6} sm={4} md={2.4}>
                <StatCard label="Total Demandes" value={stats.totalDemandes} icon={<AssignmentTurnedIn />} colorType="primary" />
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <StatCard label="En cours de visa" value={stats.enCours} icon={<EventAvailable />} colorType="warning" />
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <StatCard label="Signées / Approuvées" value={stats.validees} icon={<CheckCircle />} colorType="success" />
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <StatCard label="Rejetées" value={stats.rejetees} icon={<Cancel />} colorType="error" />
              </Grid>
              <Grid item xs={12} sm={8} md={2.4}>
                <StatCard
                  label="Taux approbation"
                  value={`${stats.tauxApprobation.toFixed(0)}%`}
                  icon={<TrendingUp />}
                  colorType="secondary"
                />
              </Grid>
            </StatsRow>

            {/* Middle Row: Monthly Volume Chart & Types Progress */}
            <Grid container spacing={3}>
              
              {/* Monthly Volume Bar Chart */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      VOLUME MENSUEL DES CONGÉS (ANNÉE {currentYear})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                      Indicateur saisonnier d'absence globale pour la planification des intérims
                    </Typography>
                    
                    <MonthlyChart data={monthlyData} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Types of Leaves Progress bars */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      CONGÉS PAR TYPE RÉGLEMENTAIRE
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                      Répartition du volume global selon le motif légal
                    </Typography>

                    <Stack spacing={2.5}>
                      {typeCounts.map((type) => {
                        const totalClosed = stats.totalDemandes || 1
                        const pct = (type.total / totalClosed) * 100
                        return (
                          <Box key={type.key}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: type.color }} />
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {type.label}
                                </Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={700}>
                                {type.total} ({pct.toFixed(0)}%)
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={pct} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: 'rgba(226, 232, 240, 0.5)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: type.color
                                }
                              }} 
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>

            {/* Bottom Row: Directions & Regulatory lifecycle */}
            <Grid container spacing={3}>
              
              {/* Demandes par Direction */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        DEMANDES PAR DIRECTION D'ATTACHEMENT
                      </Typography>
                      {dashboardScope && (
                        <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#f1f5f9', borderRadius: 2, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
                          {directionsData.length} Directions
                        </Box>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                      Volume de demandes formulées selon le département de rattachement
                    </Typography>

                    <Stack spacing={2.5} sx={{ mt: 2 }}>
                      {directionsData.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                          Aucune demande par direction pour le moment.
                        </Typography>
                      )}
                      {directionsData.map((dir, idx) => {
                        const totalDirections = directionsData.reduce((acc, curr) => acc + curr.total, 0) || 1
                        const pct = (dir.total / totalDirections) * 100
                        return (
                          <Box key={idx}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: '75%' }}>
                                {dir.key}
                              </Typography>
                              <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                                {dir.total} dms ({pct.toFixed(0)}%)
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={pct} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: 'rgba(226, 232, 240, 0.5)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: 'linear-gradient(90deg, #4338ca 0%, #6366f1 100%)'
                                }
                              }} 
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Réglementation et Cycle de vie */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FactCheck sx={{ color: 'primary.main', fontSize: 20 }} /> RÉGLEMENTATION ET CYCLE DE VIE
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                      Les étapes du flux d'approbation et signature réglementaire des congés
                    </Typography>

                    <Grid container spacing={2}>
                      {[
                        {
                          status: 'BROUILLON',
                          desc: "Document éditable par le titulaire. Détermination de l'intérimaire obligatoire."
                        },
                        {
                          status: 'SOUMISE',
                          desc: "Verrouillé aux modifications. Envoyé sur la table du Chef Hiérarchique."
                        },
                        {
                          status: 'VISE_CHEF',
                          desc: "Visa chef accordé. Transmis au Directeur pour signature officielle."
                        },
                        {
                          status: 'SIGNEE_DIRECTEUR',
                          desc: "Signature certifiée apposée. Décision finale générée et téléchargeable."
                        }
                      ].map((item) => {
                        const config = statusMap[item.status as StatutDemande] ?? {
                          bg: '#f1f5f9',
                          color: '#64748b',
                          label: item.status,
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          icon: null,
                        }
                        return (
                          <Grid item xs={12} sm={6} key={item.status}>
                            <Box
                              sx={{
                                p: 1.8,
                                height: '100%',
                                borderRadius: 3,
                                bgcolor: config.bg,
                                border: config.border,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                              }}
                            >
                              <Box>
                                <StatusBadge statut={item.status as StatutDemande} />
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.4, fontSize: '0.72rem' }}>
                                {item.desc}
                              </Typography>
                            </Box>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
            
            {/* Recent Requests Card list */}
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Mes demandes récentes
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {latestDemandes.map((demande) => {
                    const statusConfig = statusMap[demande.status] || { color: '#64748b' }
                    return (
                      <Box
                        key={demande.id}
                        sx={{
                          p: 2.5,
                          bgcolor: 'background.paper',
                          borderRadius: 3,
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          borderLeft: `5px solid ${statusConfig.color}`,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { sm: 'center' },
                          gap: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
                            borderColor: 'primary.light',
                          }
                        }}
                      >
                        <Box>
                          <Typography fontWeight={700} variant="subtitle1" sx={{ color: 'text.primary', mb: 0.5 }}>
                            {demande.reference}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Période : du <strong>{demande.leaveStartDate}</strong> au <strong>{demande.leaveEndDate}</strong>
                          </Typography>
                        </Box>
                        <StatusBadge statut={demande.status} />
                      </Box>
                    )
                  })}
                  {latestDemandes.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                      Aucune demande récente.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

          </Grid>
          
        </Grid>
      </AsyncContent>
    </Box>
  )
}
