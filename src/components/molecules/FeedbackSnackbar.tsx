import { Alert, Snackbar } from '@mui/material'
import type { FeedbackState } from '@/hooks/useFeedback'

type Props = {
  feedback: FeedbackState | null
  onClose: () => void
}

export default function FeedbackSnackbar({ feedback, onClose }: Props) {
  return (
    <Snackbar
      open={Boolean(feedback)}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={feedback?.severity ?? 'info'}
        variant="filled"
        sx={{ width: '100%', fontWeight: 600 }}
      >
        {feedback?.message}
      </Alert>
    </Snackbar>
  )
}
