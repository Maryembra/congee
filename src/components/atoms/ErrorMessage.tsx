import { Alert, AlertTitle, Button } from '@mui/material'

type Props = {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ title = 'Une erreur est survenue', message, onRetry }: Props) {
  return (
    <Alert
      severity="error"
      sx={{ borderRadius: 3, mb: 2 }}
      className="slide-up"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Réessayer
          </Button>
        ) : null
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
      {message}
    </Alert>
  )
}
