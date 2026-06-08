import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

export type OrgLevel = 'direction' | 'division' | 'service'

export function levelColor(theme: Theme, level: OrgLevel) {
  if (level === 'direction') return theme.palette.primary
  if (level === 'division') return theme.palette.info
  return theme.palette.success
}

export function levelGradient(theme: Theme, level: OrgLevel) {
  const c = levelColor(theme, level)
  return `linear-gradient(135deg, ${c.main} 0%, ${c.dark} 100%)`
}

export function levelTint(theme: Theme, level: OrgLevel) {
  const c = levelColor(theme, level)
  return alpha(c.main, 0.08)
}

export const orgTreeContainerSx = {
  p: { xs: 1.5, sm: 2 },
  borderRadius: 3,
  bgcolor: 'grey.50',
  border: '1px solid',
  borderColor: 'divider',
}

export const orgTreeBranchSx = (theme: Theme, level: OrgLevel) => ({
  ml: { xs: 1.5, sm: 2.5 },
  pl: { xs: 2, sm: 3 },
  borderLeft: '3px solid',
  borderColor: alpha(levelColor(theme, level).main, 0.35),
  py: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
})
