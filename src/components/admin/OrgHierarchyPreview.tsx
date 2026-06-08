import { AccountTree, ChevronRight } from '@mui/icons-material'
import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material'

type Props = {
  items: { label: string; code?: string }[]
}

export default function OrgHierarchyPreview({ items }: Props) {
  const theme = useTheme()
  if (!items.length) return null

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: alpha(theme.palette.primary.main, 0.35),
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AccountTree fontSize="small" color="primary" />
        <Typography variant="caption" fontWeight={700} color="primary.main" letterSpacing={0.5}>
          RATTACHEMENT HIÉRARCHIQUE
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.5} useFlexGap>
        {items.map((item, index) => (
          <Stack key={`${item.label}-${index}`} direction="row" alignItems="center" spacing={0.5}>
            {index > 0 ? <ChevronRight sx={{ fontSize: 18, color: 'text.disabled' }} /> : null}
            <Chip
              size="small"
              label={item.code ? `${item.label} (${item.code})` : item.label}
              color={index === items.length - 1 ? 'primary' : 'default'}
              variant={index === items.length - 1 ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, maxWidth: '100%' }}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
