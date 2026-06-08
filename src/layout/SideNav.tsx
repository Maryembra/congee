import {
  AccountTree,
  Apartment,
  Dashboard,
  EventNote,
  EventAvailable,
  Groups,
  Insights,
  ManageAccounts,
  FactCheck,
  Person,
  Workspaces,
} from '@mui/icons-material'
import type { ReactNode } from 'react'
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import BrandMark from '@/components/brand/BrandMark'
import type { RoleCode } from '@/features/auth/authTypes'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
  roles?: RoleCode[]
}

const mainItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <Dashboard /> },
  { label: 'Mon profil', to: '/profile', icon: <Person /> },
  { label: 'Demandes', to: '/demandes', icon: <EventNote /> },
  { label: 'Quotas', to: '/quotas', icon: <Workspaces /> },
  { label: 'Reporting', to: '/reporting', icon: <Insights />, roles: ['ADMIN', 'CHEF_HIERARCHIE', 'SIGNATAIRE'] },
]

const adminItems: NavItem[] = [
  { label: 'Directions', to: '/admin/directions', icon: <Apartment />, roles: ['ADMIN'] },
  { label: 'Divisions', to: '/admin/divisions', icon: <AccountTree />, roles: ['ADMIN'] },
  { label: 'Services', to: '/admin/services', icon: <Groups />, roles: ['ADMIN'] },
  { label: 'Fonctionnaires', to: '/fonctionnaires', icon: <ManageAccounts />, roles: ['ADMIN'] },
  { label: 'Jours feries', to: '/admin/jours-feries', icon: <EventAvailable />, roles: ['ADMIN'] },
  { label: 'Journal d audit', to: '/admin/audit', icon: <FactCheck />, roles: ['ADMIN'] },
]

type Props = {
  onClose?: () => void
}

export default function SideNav({ onClose }: Props) {
  const roles = useAppSelector((state) => state.auth.roles)
  const user = useAppSelector((state) => state.auth.user)

  const canSee = (item: NavItem) => !item.roles || item.roles.some((role) => roles.includes(role))
  const visibleAdminItems = adminItems.filter(canSee)

  const renderItem = (item: NavItem) => (
    <ListItemButton
      key={item.to}
      component={NavLink}
      to={item.to}
      onClick={onClose}
      sx={{
        borderRadius: 3,
        color: 'rgba(255, 255, 255, 0.7)',
        mb: 0.5,
        minHeight: 48,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          color: 'white',
        },
        '&.active': {
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          '& .MuiListItemIcon-root': { color: 'white' },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
      <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
    </ListItemButton>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ p: 2, mb: 2 }}>
        <BrandMark size="large" invert />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ px: 0 }}>{mainItems.filter(canSee).map(renderItem)}</List>

        {visibleAdminItems.length ? (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Typography variant="overline" sx={{ px: 2, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: 1 }}>
              Administration
            </Typography>
            <List sx={{ px: 0 }}>{visibleAdminItems.map(renderItem)}</List>
          </>
        ) : null}
      </Box>
      
      <Box sx={{ p: 2, mt: 'auto', bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {(user?.fonctionnaire?.firstName ?? user?.username ?? '?').charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.fonctionnaire ? `${user.fonctionnaire.firstName} ${user.fonctionnaire.lastName}` : user?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} noWrap>
            {roles[0] || 'Utilisateur'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
