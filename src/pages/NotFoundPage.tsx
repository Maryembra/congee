import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Page introuvable
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Revenez au tableau de bord pour continuer.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Retour au dashboard
        </Button>
      </Box>
    </Box>
  )
}
