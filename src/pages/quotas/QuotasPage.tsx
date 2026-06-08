import { Add, DeleteOutline } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import SectionHeader from '@/components/admin/SectionHeader'
import StatCard from '@/components/admin/StatCard'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import QuotaFormDialog from '@/components/quotas/QuotaFormDialog'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import { fetchFonctionnaireCount } from '@/features/admin/adminApi'
import { typeCongeLabel } from '@/features/demandes/demandeLabels'
import { CURRENT_YEAR } from '@/features/quotas/quotaFormTypes'
import { deleteQuota, fetchQuotas } from '@/features/quotas/quotasSlice'

export default function QuotasPage() {
  const dispatch = useAppDispatch()
  const roles = useAppSelector((state) => state.auth.roles)
  const isAdmin = roles.includes('ADMIN')
  const quotas = useAppSelector((state) => state.quotas.items)
  const quotasStatus = useAppSelector((state) => state.quotas.status)
  const quotasError = useAppSelector((state) => state.quotas.error)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fonctionnaireTotal, setFonctionnaireTotal] = useState(0)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const handleFeedback = (next: { type: 'success' | 'error'; message: string }) => {
    if (next.type === 'success') {
      showSuccess(next.message)
      return
    }
    showError(next.message)
  }

  const handleDeleteQuota = (quotaId: number) => {
    requestConfirm({
      title: 'Confirmer la suppression',
      content: 'Voulez-vous vraiment supprimer ce quota ? Cette action est irreversible.',
      confirmLabel: 'Supprimer',
      severity: 'error',
      onConfirm: async () => {
        try {
          await dispatch(deleteQuota(quotaId)).unwrap()
          showSuccess('Quota supprime avec succes.')
        } catch (error) {
          showError(getApiErrorMessage(error, 'Suppression impossible.'))
        }
      },
    })
  }

  useEffect(() => {
    dispatch(fetchQuotas({ admin: isAdmin, annee: CURRENT_YEAR }))
    if (isAdmin) {
      fetchFonctionnaireCount().then(setFonctionnaireTotal).catch(() => setFonctionnaireTotal(0))
    }
  }, [dispatch, isAdmin])

  const totalRestants = quotas.reduce((sum, quota) => sum + Number(quota.remainingDays), 0)
  const totalConsommes = quotas.reduce((sum, quota) => sum + Number(quota.consumedDays), 0)

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Quotas annuels"
        subtitle={isAdmin ? 'Affectation et ajustement des soldes par fonctionnaire.' : 'Consultation de vos soldes disponibles.'}
        actions={
          isAdmin ? (
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
              Configurer un quota
            </Button>
          ) : null
        }
      />

      {quotasError ? <Alert severity="error">{quotasError}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard label="Lignes quota" value={`${quotas.length}`} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Jours consommes" value={`${totalConsommes}`} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Jours restants" value={`${totalRestants}`} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {quotasStatus === 'loading' && quotas.length === 0 ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {quotas.map((quota) => {
                const ratio = quota.initialQuota ? (Number(quota.consumedDays) / Number(quota.initialQuota)) * 100 : 0
                const fonctionnaireLabel =
                  quota.fonctionnaireFirstName && quota.fonctionnaireLastName
                    ? `${quota.fonctionnaireFirstName} ${quota.fonctionnaireLastName}`
                    : `Fonctionnaire #${quota.fonctionnaireId}`
                return (
                  <Box key={quota.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>
                          {typeCongeLabel[quota.leaveType]} - {quota.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fonctionnaireLabel}
                        </Typography>
                        <LinearProgress sx={{ mt: 1 }} variant="determinate" value={Math.min(ratio, 100)} />
                      </Box>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Initial</Typography>
                          <Typography fontWeight={700}>{quota.initialQuota}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Consomme</Typography>
                          <Typography fontWeight={700}>{quota.consumedDays}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Restant</Typography>
                          <Typography fontWeight={700}>{quota.remainingDays}</Typography>
                        </Box>
                        {isAdmin ? (
                          <Button color="error" startIcon={<DeleteOutline />} onClick={() => handleDeleteQuota(quota.id)}>
                            Supprimer
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                )
              })}
              {quotas.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  Aucun quota configure pour le moment.
                </Typography>
              ) : null}
            </Stack>
          )}
        </CardContent>
      </Card>

      <QuotaFormDialog
        open={dialogOpen}
        fonctionnaireTotal={fonctionnaireTotal}
        onClose={() => setDialogOpen(false)}
        onFeedback={handleFeedback}
        onRequestConfirm={requestConfirm}
      />

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
      {confirmState ? (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          content={confirmState.content}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          severity={confirmState.severity}
          loading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null}
    </Box>
  )
}
