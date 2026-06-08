import { Alert, Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import FormDialog from '@/components/organisms/FormDialog'
import FileUploadButton from '@/components/molecules/FileUploadButton'
import type { FonctionnaireOption } from '@/features/admin/adminTypes'
import type { CurrentUser } from '@/features/auth/authTypes'
import {
  calcCalendarSpan,
  initialDemandeFormValues,
  type DemandeFormValues,
} from '@/features/demandes/demandeFormTypes'
import {
  medicalJustificatifLabel,
  resolveApiTypeConge,
  requiresMedicalPdfJustificatif,
  toFormTypeConge,
  typeCongeFormOptions,
  validateGenuinePdfClient,
  type TypeCongeFormValue,
} from '@/features/demandes/demandeRules'
import type { DemandeConge } from '@/features/demandes/demandeTypes'

const dialogLabelSx = {
  '& .MuiInputLabel-root': {
    backgroundColor: 'background.paper',
    px: 0.5,
  },
}

const dateFieldSx = {
  ...dialogLabelSx,
  mt: 1,
}

type Props = {
  open: boolean
  editingDemande: DemandeConge | null
  user: CurrentUser | null
  annualSolde: number | null
  fonctionnaires: FonctionnaireOption[]
  currentFonctionnaireId?: number
  saving: boolean
  apiError: string
  onClose: () => void
  onSave: (values: DemandeFormValues, justificatifFile: File | null) => Promise<void>
}

export default function DemandeFormDialog({
  open,
  editingDemande,
  user,
  annualSolde,
  fonctionnaires,
  currentFonctionnaireId,
  saving,
  apiError,
  onClose,
  onSave,
}: Props) {
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState('')

  const { control, handleSubmit, reset, watch, setValue } = useForm<DemandeFormValues>({
    defaultValues: initialDemandeFormValues,
  })

  useEffect(() => {
    if (!open) return
    setJustificatifFile(null)
    setLocalError('')
    if (editingDemande) {
      reset({
        leaveStartDate: editingDemande.leaveStartDate,
        leaveEndDate: editingDemande.leaveEndDate,
        leaveType: toFormTypeConge(editingDemande.leaveType, editingDemande.reason),
        administrativeYear: editingDemande.administrativeYear,
        substituteId: String(editingDemande.substitute?.id ?? ''),
        reason: editingDemande.reason ?? '',
      })
      return
    }
    reset(initialDemandeFormValues)
  }, [open, editingDemande, reset])

  const leaveType = watch('leaveType')
  const leaveStartDate = watch('leaveStartDate')
  const leaveEndDate = watch('leaveEndDate')
  const apiTypeConge = resolveApiTypeConge(leaveType)
  const needsMedicalPdf = requiresMedicalPdfJustificatif(apiTypeConge)
  const { business: businessDays, weekends: weekendDays } = calcCalendarSpan(leaveStartDate, leaveEndDate)

  const handleJustificatifChange = async (file: File | null) => {
    if (!file) {
      setJustificatifFile(null)
      return
    }
    const pdfError = await validateGenuinePdfClient(file)
    if (pdfError) {
      setLocalError(pdfError)
      setJustificatifFile(null)
      return
    }
    setJustificatifFile(file)
    setLocalError('')
  }

  const submit = handleSubmit(async (values) => {
    setLocalError('')
    await onSave(values, justificatifFile)
  })

  const displayError = localError || apiError

  return (
    <FormDialog
      open={open}
      title={editingDemande ? 'Modifier la demande de congé' : 'Créer une demande de congé réglementé'}
      maxWidth="md"
      titleSx={{ fontWeight: 800, letterSpacing: '0.04em' }}
      contentSx={{ pt: 1 }}
      onClose={onClose}
      onSave={() => void submit()}
      cancelLabel="Fermer"
      saveLabel={saving ? 'Enregistrement…' : editingDemande ? 'Mettre à jour le brouillon' : 'Créer le brouillon'}
      loading={saving}
    >
      {user?.fonctionnaire ? (
        <Typography variant="body2" color="text.secondary">
          Titulaire : {user.fonctionnaire.firstName} {user.fonctionnaire.lastName} | PPR {user.fonctionnaire.ppr} | Solde
          annuel : {annualSolde != null ? `${annualSolde} jours` : 'Non defini'}
        </Typography>
      ) : null}

      <Controller
        name="leaveType"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Type de conge"
            sx={dialogLabelSx}
            onChange={(event) => {
              const value = event.target.value as TypeCongeFormValue
              field.onChange(value)
              if (value === 'PELERINAGE') {
                setValue('reason', 'Conge pelerinage (sans solde)')
              }
              setJustificatifFile(null)
              setLocalError('')
            }}
          >
            {typeCongeFormOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="substituteId"
        control={control}
        rules={{ required: 'Interimaire requis' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Representant interimaire"
            sx={dialogLabelSx}
            required
            error={Boolean(fieldState.error)}
            helperText={
              fieldState.error?.message ??
              "L'interimaire ne doit pas avoir de conge depose ou actif sur ces periodes."
            }
          >
            <MenuItem value="">— Rechercher l'interim d'attachement —</MenuItem>
            {fonctionnaires
              .filter((item) => item.id !== currentFonctionnaireId)
              .map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.firstName} {item.lastName} — PPR {item.ppr}
                </MenuItem>
              ))}
          </TextField>
        )}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="leaveStartDate"
            control={control}
            rules={{ required: 'Date de depart requise' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Date de depart"
                InputLabelProps={{ shrink: true }}
                sx={dateFieldSx}
                required
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="leaveEndDate"
            control={control}
            rules={{ required: 'Date de reprise requise' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Date de reprise"
                InputLabelProps={{ shrink: true }}
                sx={dateFieldSx}
                required
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Decomposition du calendrier reglementaire :
          </Typography>
          <Typography variant="body2">Samedi &amp; Dimanche exclus : {weekendDays} jour(s)</Typography>
        </Box>
        <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
          <Typography variant="caption" fontWeight={700}>
            DUREE NETTE
          </Typography>
          <Typography variant="h5" fontWeight={800} lineHeight={1}>
            {businessDays} jours
          </Typography>
        </Box>
      </Box>

      {leaveType === 'PELERINAGE' ? (
        <Alert severity="info">Le conge pelerinage est enregistre comme conge sans solde (non deduit du quota annuel).</Alert>
      ) : null}

      {needsMedicalPdf ? (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={700} color="error.main">
              * {medicalJustificatifLabel[apiTypeConge as 'MALADIE' | 'MATERNITE']}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taille max : 2 Mo (PDF uniquement, verification Tika)
            </Typography>
          </Stack>
          <FileUploadButton
            file={justificatifFile}
            onChange={(file) => void handleJustificatifChange(file)}
            accept="application/pdf,.pdf"
            label="Parcourir le justificatif signe du medecin…"
            fullWidth
          />
        </Box>
      ) : null}

      {leaveType !== 'PELERINAGE' && leaveType !== 'ANNUEL' ? (
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Motif (complement)"
              sx={dialogLabelSx}
              multiline
              minRows={2}
            />
          )}
        />
      ) : null}

      {displayError ? <Alert severity="error">{displayError}</Alert> : null}
    </FormDialog>
  )
}
