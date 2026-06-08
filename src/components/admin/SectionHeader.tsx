import { Box, Stack, Typography } from '@mui/material'

type Props = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function SectionHeader({ title, subtitle, actions }: Props) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Stack>
  )
}
