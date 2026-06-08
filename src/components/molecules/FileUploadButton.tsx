import { CloudUpload } from '@mui/icons-material'
import { Button, Typography, Box } from '@mui/material'

type Props = {
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
  label?: string
  fullWidth?: boolean
  helperText?: string
}

export default function FileUploadButton({
  file,
  onChange,
  accept = '.pdf,image/*',
  label = 'Choisir un fichier',
  fullWidth = false,
  helperText,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        component="label"
        variant="outlined"
        fullWidth={fullWidth}
        startIcon={<CloudUpload />}
        sx={{
          justifyContent: fullWidth ? 'center' : 'flex-start',
          borderStyle: 'dashed',
          borderWidth: 2,
          py: fullWidth ? 3 : 1.5,
          borderRadius: 3,
          flexDirection: fullWidth ? 'column' : 'row',
          gap: fullWidth ? 0.5 : 0,
        }}
      >
        {file ? file.name : label}
        <input
          hidden
          type="file"
          accept={accept}
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null)
          }}
        />
      </Button>
      {helperText ? (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      ) : null}
      {file && !helperText ? (
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ ml: 1 }}>
          Fichier selectionne : {file.name}
        </Typography>
      ) : null}
    </Box>
  )
}
