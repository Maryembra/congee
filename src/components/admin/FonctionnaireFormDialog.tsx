import { Check, Close, MailOutline } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { orgDialogPaperSx, orgFieldSx } from '@/components/admin/orgAdminStyles'
import type { Direction, Service } from '@/features/admin/adminTypes'
import type { CurrentUser, RoleCode } from '@/features/auth/authTypes'
import {
  emptyFonctionnaireForm,
  gradeOptions,
  type FonctionnaireFormValues,
} from '@/features/users/fonctionnaireFormTypes'

const roleOptions: RoleCode[] = ['FONCTIONNAIRE', 'CHEF_HIERARCHIE', 'SIGNATAIRE']

const roleLabels: Record<RoleCode, string> = {
  ADMIN: 'Administrateur',
  FONCTIONNAIRE: 'Fonctionnaire',
  CHEF_HIERARCHIE: 'Chef de hiérarchie',
  SIGNATAIRE: 'Signataire',
}

type AssignableRole = (typeof roleOptions)[number]

function resolvePrimaryRole(roles: RoleCode[]): AssignableRole {
  if (roles.includes('SIGNATAIRE')) return 'SIGNATAIRE'
  if (roles.includes('CHEF_HIERARCHIE')) return 'CHEF_HIERARCHIE'
  return 'FONCTIONNAIRE'
}

type Props = {
  isOpen: boolean
  editing: CurrentUser | null
  services: Service[]
  directions: Direction[]
  submitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: FonctionnaireFormValues) => Promise<void>
}

export default function FonctionnaireFormDialog({
  isOpen,
  editing,
  services,
  directions,
  submitting,
  error,
  onClose,
  onSubmit,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FonctionnaireFormValues>({
    defaultValues: emptyFonctionnaireForm,
  })

  const primaryRole = watch('primaryRole')
  const serviceId = watch('serviceId')
  const signatoryDirectionId = watch('signatoryDirectionId')
  const hasSignatoryRole = primaryRole === 'SIGNATAIRE'
  const hasManagerRole = primaryRole === 'CHEF_HIERARCHIE'

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      const userService = services.find((service) => service.id === editing.fonctionnaire?.serviceId)
      reset({
        username: editing.username,
        email: editing.email,
        primaryRole: resolvePrimaryRole(editing.roles),
        lastName: editing.fonctionnaire?.lastName ?? '',
        firstName: editing.fonctionnaire?.firstName ?? '',
        ppr: editing.fonctionnaire?.ppr ?? '',
        grade: editing.fonctionnaire?.grade ?? '',
        employmentStartDate: editing.fonctionnaire?.employmentStartDate ?? '',
        serviceId: editing.fonctionnaire?.serviceId ? String(editing.fonctionnaire.serviceId) : '',
        signatoryDirectionId: userService?.directionId ? String(userService.directionId) : '',
      })
      return
    }
    reset(emptyFonctionnaireForm)
  }, [isOpen, editing, reset, services])

  const existingServiceManager = useMemo(() => {
    if (!serviceId) return null
    const service = services.find((item) => item.id === Number(serviceId))
    if (!service?.managerId || !service.managerLastName) return null
    const editingProfileId = editing?.fonctionnaire?.id
    if (editingProfileId && service.managerId === editingProfileId) return null
    return { firstName: service.managerFirstName, lastName: service.managerLastName }
  }, [editing, serviceId, services])

  const existingDirectionSignatory = useMemo(() => {
    if (!signatoryDirectionId) return null
    const direction = directions.find((item) => item.id === Number(signatoryDirectionId))
    if (!direction?.signataireId || !direction.signatoryLastName) return null
    const editingProfileId = editing?.fonctionnaire?.id
    if (editingProfileId && direction.signataireId === editingProfileId) return null
    return { firstName: direction.signatoryFirstName, lastName: direction.signatoryLastName }
  }, [signatoryDirectionId, directions, editing])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: orgDialogPaperSx }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 800,
          fontSize: '1rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          pr: 1,
          pb: 1,
        }}
      >
        {editing ? 'Modifier le profil fonctionnaire' : 'Créer un nouveau profil fonctionnaire'}
        <IconButton aria-label="Fermer" onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'grid', gap: 2.5, pt: 1, pb: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!editing ? (
          <Alert severity="info" icon={<MailOutline />} sx={{ borderRadius: 2 }}>
            Un email d&apos;activation sera envoyé au fonctionnaire. Il définira son mot de passe via le lien reçu.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Nom requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom"
                  placeholder="El Alami"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'Prénom requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Prénom"
                  placeholder="Mohamed"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ppr"
              control={control}
              rules={{ required: 'Matricule PPR requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Matricule PPR"
                  placeholder="128934"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.ppr)}
                  helperText={errors.ppr?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="employmentStartDate"
              control={control}
              rules={{ required: "Date de début d'ancienneté requise" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Date de Début d'Ancienneté"
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={orgFieldSx}
                  error={Boolean(errors.employmentStartDate)}
                  helperText={errors.employmentStartDate?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="grade"
              control={control}
              rules={{ required: 'Grade requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Grade"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.grade)}
                  helperText={errors.grade?.message}
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quota d'entrée (Jours)"
              value="22"
              disabled
              sx={orgFieldSx}
              helperText="Appliqué automatiquement selon la configuration des quotas"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="primaryRole"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Profil & Rôle Système"
                  required
                  sx={{
                    ...orgFieldSx,
                    '& .MuiSelect-select': {
                      fontWeight: 600,
                      color: field.value === 'FONCTIONNAIRE' ? 'success.dark' : 'text.primary',
                    },
                  }}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {roleLabels[role]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Email professionnel requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email professionnel"
                  type="email"
                  placeholder="mohamed.elalami@exemple.ma"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="username"
              control={control}
              rules={{ required: "Nom d'utilisateur requis" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom d'utilisateur"
                  placeholder="melalami"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.username)}
                  helperText={errors.username?.message ?? 'Identifiant de connexion au système'}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
            Structure organisationnelle
          </Typography>
          <Controller
            name="serviceId"
            control={control}
            rules={{ required: "Service d'affectation requis" }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Service d'affectation"
                required
                sx={orgFieldSx}
                error={Boolean(errors.serviceId)}
                helperText={errors.serviceId?.message}
                onChange={(event) => {
                  const value = event.target.value
                  field.onChange(value)
                  const service = services.find((item) => item.id === Number(value))
                  if (service?.directionId) {
                    setValue('signatoryDirectionId', String(service.directionId))
                  }
                }}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={String(service.id)}>
                    {service.name} — {service.divisionName} / {service.directionName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>

        {hasManagerRole ? (
          <Alert severity={existingServiceManager ? 'warning' : 'info'} sx={{ borderRadius: 2 }}>
            {existingServiceManager
              ? `Ce service a déjà un chef (${existingServiceManager.firstName ?? ''} ${existingServiceManager.lastName}). En enregistrant, l'ancien chef perdra le rôle Chef de hiérarchie.`
              : 'Ce fonctionnaire sera automatiquement désigné chef hiérarchique du service sélectionné.'}
          </Alert>
        ) : null}

        {hasSignatoryRole ? (
          <>
            <Controller
              name="signatoryDirectionId"
              control={control}
              rules={{ required: hasSignatoryRole ? 'Direction requise pour un signataire' : false }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Direction à signer"
                  required
                  sx={orgFieldSx}
                  error={Boolean(errors.signatoryDirectionId)}
                  helperText={
                    errors.signatoryDirectionId?.message ??
                    'Le fonctionnaire doit être affecté à un service de cette direction.'
                  }
                >
                  {directions.map((direction) => (
                    <MenuItem key={direction.id} value={String(direction.id)}>
                      {direction.name} ({direction.code})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Alert severity={existingDirectionSignatory ? 'warning' : 'info'} sx={{ borderRadius: 2 }}>
              {existingDirectionSignatory
                ? `Cette direction a déjà un signataire (${existingDirectionSignatory.firstName ?? ''} ${existingDirectionSignatory.lastName}). En enregistrant, l'ancien signataire perdra le rôle Signataire.`
                : 'Ce fonctionnaire sera automatiquement désigné signataire de la direction sélectionnée.'}
            </Alert>
          </>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => void submit()}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Check />}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          {editing ? 'Confirmer & Enregistrer' : 'Confirmer & Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
