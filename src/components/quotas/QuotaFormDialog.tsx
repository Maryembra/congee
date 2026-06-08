import { Public } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchFonctionnaireOptions } from '@/features/admin/adminApi'
import type { FonctionnaireOption } from '@/features/admin/adminTypes'
import { typeCongeLabel, typeCongeOptions } from '@/features/demandes/demandeLabels'
import type { TypeConge } from '@/features/demandes/demandeTypes'
import { emptyQuotaForm, type QuotaFormValues } from '@/features/quotas/quotaFormTypes'
import { applyQuotaToAll, fetchQuotas, saveQuota } from '@/features/quotas/quotasSlice'
import type { ConfirmDialogRequest } from '@/hooks/useConfirmDialog'

type Feedback = { type: 'success' | 'error'; message: string }

type Props = {
  open: boolean
  fonctionnaireTotal: number
  onClose: () => void
  onFeedback: (feedback: Feedback) => void
  onRequestConfirm: (request: ConfirmDialogRequest) => void
}

export default function QuotaFormDialog({
  open,
  fonctionnaireTotal,
  onClose,
  onFeedback,
  onRequestConfirm,
}: Props) {
  const dispatch = useAppDispatch()
  const isAdmin = useAppSelector((state) => state.auth.roles.includes('ADMIN'))
  const [fonctionnaireSearch, setFonctionnaireSearch] = useState('')
  const [fonctionnaireOptions, setFonctionnaireOptions] = useState<FonctionnaireOption[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<QuotaFormValues>({
    defaultValues: emptyQuotaForm,
  })

  const fonctionnaireId = watch('fonctionnaireId')

  useEffect(() => {
    if (!open) return
    reset(emptyQuotaForm)
    setFonctionnaireSearch('')
  }, [open, reset])

  useEffect(() => {
    if (!open || !isAdmin) return
    setOptionsLoading(true)
    fetchFonctionnaireOptions({ search: fonctionnaireSearch, page: 0, size: 50 })
      .then((page) => setFonctionnaireOptions(page.content))
      .catch(() => setFonctionnaireOptions([]))
      .finally(() => setOptionsLoading(false))
  }, [open, isAdmin, fonctionnaireSearch])

  const buildPayload = (values: QuotaFormValues) => ({
    leaveType: values.leaveType as TypeConge,
    year: Number(values.year),
    initialQuota: Number(values.initialQuota),
  })

  const handleSaveOne = handleSubmit(async (values) => {
    if (!values.fonctionnaireId) {
      onFeedback({ type: 'error', message: 'Selectionnez un fonctionnaire pour un enregistrement individuel.' })
      return
    }
    if (values.initialQuota <= 0) {
      onFeedback({ type: 'error', message: 'Le quota initial doit etre superieur a 0.' })
      return
    }

    setSubmitting(true)
    const result = await dispatch(
      saveQuota({
        ...buildPayload(values),
        fonctionnaireId: Number(values.fonctionnaireId),
      }),
    )
    setSubmitting(false)

    if (saveQuota.fulfilled.match(result)) {
      onFeedback({ type: 'success', message: 'Quota enregistre avec succes.' })
      onClose()
      dispatch(fetchQuotas({ admin: isAdmin, annee: values.year }))
      return
    }

    onFeedback({
      type: 'error',
      message: (result.payload as string) ?? 'Enregistrement impossible.',
    })
  })

  const handleApplyToAll = handleSubmit(async (values) => {
    if (values.initialQuota <= 0) {
      onFeedback({ type: 'error', message: 'Le quota initial doit etre superieur a 0.' })
      return
    }
    if (fonctionnaireTotal === 0) {
      onFeedback({
        type: 'error',
        message: 'Aucun fonctionnaire en base. Importez des fonctionnaires avant d appliquer un quota.',
      })
      return
    }

    onRequestConfirm({
      title: 'Confirmer l application globale',
      content: `Appliquer ${values.initialQuota} jour(s) de conge ${typeCongeLabel[values.leaveType as TypeConge]} pour l annee ${values.year} a tous les ${fonctionnaireTotal} fonctionnaires ? Les quotas existants seront mis a jour en conservant les jours deja consommes.`,
      confirmLabel: 'Appliquer a tous',
      severity: 'warning',
      onConfirm: async () => {
        setSubmitting(true)
        const result = await dispatch(applyQuotaToAll(buildPayload(values)))
        setSubmitting(false)

        if (applyQuotaToAll.fulfilled.match(result)) {
          onFeedback({
            type: 'success',
            message: `Quota applique a tous les fonctionnaires (${fonctionnaireTotal}).`,
          })
          onClose()
          return
        }

        onFeedback({
          type: 'error',
          message: (result.payload as string) ?? 'Application impossible.',
        })
      },
    })
  })

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurer un quota</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
        <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
          Utilisez <strong>Appliquer a tous</strong> pour creer ou mettre a jour le meme quota (type, annee, nombre de jours)
          pour chaque fonctionnaire. Les jours deja consommes sont preserves.
        </Alert>

        <Controller
          name="leaveType"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Type de conge">
              {typeCongeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {typeCongeLabel[type]}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="year"
          control={control}
          rules={{ required: 'Annee requise', min: { value: 2000, message: 'Annee invalide' } }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="Annee"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              onChange={(event) => field.onChange(Number(event.target.value))}
            />
          )}
        />

        <Controller
          name="initialQuota"
          control={control}
          rules={{
            required: 'Quota requis',
            min: { value: 1, message: 'Le quota doit etre superieur a 0' },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="Quota initial (jours)"
              inputProps={{ min: 1 }}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              onChange={(event) => field.onChange(Number(event.target.value))}
            />
          )}
        />

        <TextField
          label="Rechercher un fonctionnaire"
          value={fonctionnaireSearch}
          onChange={(event) => setFonctionnaireSearch(event.target.value)}
          placeholder="Nom, prenom ou PPR"
          InputProps={{
            endAdornment: optionsLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={18} />
              </InputAdornment>
            ) : undefined,
          }}
        />

        <Controller
          name="fonctionnaireId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Fonctionnaire (enregistrement individuel)"
              helperText="Optionnel si vous appliquez le quota a tous les fonctionnaires."
              disabled={optionsLoading}
            >
              <MenuItem value="">— Aucun —</MenuItem>
              {fonctionnaireOptions.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.firstName} {item.lastName} - {item.ppr}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" startIcon={<Public />} disabled={submitting} onClick={() => void handleApplyToAll()}>
          Appliquer a tous ({fonctionnaireTotal})
        </Button>
        <Button variant="contained" disabled={submitting || !fonctionnaireId} onClick={() => void handleSaveOne()}>
          Enregistrer pour un fonctionnaire
        </Button>
      </DialogActions>
    </Dialog>
  )
}
