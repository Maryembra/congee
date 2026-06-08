import { Grid, TextField } from '@mui/material'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { orgFieldSx } from '@/components/admin/orgAdminStyles'

type Props<T extends FieldValues> = {
  control: Control<T>
  disabled?: boolean
  codePlaceholder?: string
  nomPlaceholder?: string
  nomLabel?: string
}

export default function OrgCodeNameFields<T extends FieldValues>({
  control,
  disabled = false,
  codePlaceholder = 'CODE',
  nomPlaceholder = 'Libellé',
  nomLabel = 'Nom *',
}: Props<T>) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Controller
          name={'code' as Path<T>}
          control={control}
          rules={{ required: 'Code requis' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Code *"
              required
              fullWidth
              placeholder={codePlaceholder}
              sx={orgFieldSx}
              disabled={disabled}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <Controller
          name={'name' as Path<T>}
          control={control}
          rules={{ required: 'Nom requis' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label={nomLabel}
              required
              fullWidth
              placeholder={nomPlaceholder}
              sx={orgFieldSx}
              disabled={disabled}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}
