import {
  AccountTree,
  Business,
  ChevronRight,
  ExpandMore,
  Groups,
  Hub,
  Person,
  RoomService,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { OrgLevel } from '@/components/admin/orgTree/orgTreeStyles'
import { levelColor, levelGradient, levelTint, orgTreeBranchSx, orgTreeContainerSx } from '@/components/admin/orgTree/orgTreeStyles'

export function OrgTreeLegend() {
  const theme = useTheme()
  const items: { level: OrgLevel; label: string; icon: ReactNode }[] = [
    { level: 'direction', label: 'Direction', icon: <Hub fontSize="inherit" /> },
    { level: 'division', label: 'Division', icon: <Business fontSize="inherit" /> },
    { level: 'service', label: 'Service', icon: <RoomService fontSize="inherit" /> },
  ]

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      gap={1.5}
      sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
    >
      <AccountTree fontSize="small" color="action" />
      <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.5}>
        ORGANIGRAMME
      </Typography>
      {items.map((item, i) => (
        <Stack key={item.level} direction="row" alignItems="center" spacing={0.5}>
          {i > 0 ? <ChevronRight sx={{ fontSize: 16, color: 'text.disabled' }} /> : null}
          <Chip
            size="small"
            icon={item.icon as React.ReactElement}
            label={item.label}
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: levelTint(theme, item.level),
              color: levelColor(theme, item.level).dark,
              border: '1px solid',
              borderColor: alpha(levelColor(theme, item.level).main, 0.25),
              '& .MuiChip-icon': { color: levelColor(theme, item.level).main },
            }}
          />
        </Stack>
      ))}
    </Stack>
  )
}

export function OrgTreeEmpty({ message }: { message: string }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <AccountTree sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
      <Typography color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  )
}

type DirectionBlockProps = {
  code: string
  name: string
  divisionCount: number
  serviceCount: number
  signataireLabel?: string | null
  defaultExpanded?: boolean
  actions?: ReactNode
  children: ReactNode
}

export function OrgTreeDirectionBlock({
  code,
  name,
  divisionCount,
  serviceCount,
  signataireLabel,
  defaultExpanded = true,
  actions,
  children,
}: DirectionBlockProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(defaultExpanded)

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box
        sx={{
          background: levelGradient(theme, 'direction'),
          color: 'primary.contrastText',
          px: { xs: 2, sm: 2.5 },
          py: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha('#fff', 0.2),
              border: '2px solid',
              borderColor: alpha('#fff', 0.35),
            }}
          >
            <Hub />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.85, lineHeight: 1.2, fontSize: '0.65rem' }}>
              Direction
            </Typography>
            <Typography variant="h6" fontWeight={800} noWrap title={name}>
              {name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {code}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Chip
              size="small"
              label={`${divisionCount} div.`}
              sx={{ bgcolor: alpha('#fff', 0.15), color: 'inherit', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Chip
              size="small"
              label={`${serviceCount} svc.`}
              sx={{ bgcolor: alpha('#fff', 0.15), color: 'inherit', fontWeight: 700, fontSize: '0.7rem' }}
            />
            {signataireLabel ? (
              <Tooltip title="Signataire">
                <Chip
                  size="small"
                  icon={<Person sx={{ color: 'inherit !important' }} />}
                  label={signataireLabel}
                  sx={{
                    maxWidth: 160,
                    bgcolor: alpha('#fff', 0.2),
                    color: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    display: { xs: 'none', md: 'flex' },
                  }}
                />
              </Tooltip>
            ) : null}
            {actions}
            <IconButton
              size="small"
              onClick={() => setOpen((v) => !v)}
              sx={{ color: 'inherit', bgcolor: alpha('#fff', 0.12) }}
              aria-label={open ? 'Replier' : 'Déplier'}
            >
              <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 2, bgcolor: 'background.paper' }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  )
}

type DivisionBlockProps = {
  code: string
  name: string
  serviceCount: number
  defaultExpanded?: boolean
  actions?: ReactNode
  children?: ReactNode
  showServices?: boolean
}

export function OrgTreeDivisionBlock({
  code,
  name,
  serviceCount,
  defaultExpanded = true,
  actions,
  children,
  showServices = false,
}: DivisionBlockProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(defaultExpanded)
  const hasChildren = showServices && Boolean(children)

  return (
    <Box sx={orgTreeBranchSx(theme, 'direction')}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.25),
          bgcolor: levelTint(theme, 'division'),
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ px: 2, py: 1.5 }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.info.main, 0.15),
              color: 'info.dark',
            }}
          >
            <Business fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={700} color="info.dark" letterSpacing={0.4}>
              DIVISION
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} noWrap title={name}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {code}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${serviceCount} service${serviceCount !== 1 ? 's' : ''}`}
            color={serviceCount > 0 ? 'info' : 'default'}
            variant={serviceCount > 0 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
          {actions}
          {hasChildren ? (
            <IconButton size="small" onClick={() => setOpen((v) => !v)} aria-label="Déplier les services">
              <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </IconButton>
          ) : null}
        </Stack>
        {hasChildren ? (
          <Collapse in={open}>
            <Box sx={orgTreeBranchSx(theme, 'division')}>{children}</Box>
          </Collapse>
        ) : null}
      </Paper>
    </Box>
  )
}

type ServiceRowProps = {
  code: string
  name: string
  managerLabel: string
  agentCount: number
  actions?: ReactNode
}

export function OrgTreeServiceRow({ code, name, managerLabel, agentCount, actions }: ServiceRowProps) {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': {
          borderColor: alpha(theme.palette.success.main, 0.4),
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
        },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: alpha(theme.palette.success.main, 0.12),
          color: 'success.dark',
        }}
      >
        <RoomService sx={{ fontSize: 18 }} />
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700} color="success.dark" letterSpacing={0.3}>
          SERVICE
        </Typography>
        <Typography variant="body2" fontWeight={700} noWrap title={name}>
          {name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label={code} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {managerLabel}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Chip
        size="small"
        icon={<Groups sx={{ fontSize: '14px !important' }} />}
        label={`${agentCount} agent${agentCount !== 1 ? 's' : ''}`}
        color={agentCount > 0 ? 'success' : 'default'}
        variant={agentCount > 0 ? 'filled' : 'outlined'}
        sx={{ fontWeight: 700, display: { xs: 'none', sm: 'flex' } }}
      />
      {actions}
    </Paper>
  )
}

export function OrgTreeRoot({ children }: { children: ReactNode }) {
  return (
    <Box sx={orgTreeContainerSx}>
      <OrgTreeLegend />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  )
}
