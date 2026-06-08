import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { orgFormSectionSx } from '@/components/admin/orgAdminStyles'

type Props = {
  icon: ReactNode
  title: string
  description?: string
  children: ReactNode
}

export default function OrgFormSection({ icon, title, description, children }: Props) {
  return (
    <Box sx={orgFormSectionSx}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 20 },
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  )
}
