import { AppBar, Avatar, Box, IconButton, Toolbar, Typography, Menu, MenuItem, ListItemIcon } from '@mui/material'
import { Logout, Menu as MenuIcon, Person } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'

type Props = {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: Props) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await dispatch(logout())
    navigate('/login')
  }

  const handleProfile = () => {
    handleMenuClose()
    navigate('/profile')
  }

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ minHeight: 76, gap: 2, px: { xs: 2, md: 4 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          onClick={handleMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 0.5,
            pr: 2,
            borderRadius: 999,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(99, 102, 241, 0.04)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            {(user?.fonctionnaire?.firstName ?? user?.username ?? '?').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.fonctionnaire ? `${user.fonctionnaire.firstName} ${user.fonctionnaire.lastName}` : user?.username}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 10px 24px rgba(0,0,0,0.1))',
              mt: 1.5,
              borderRadius: 3,
              minWidth: 200,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 24,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            Mon Profil
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><Logout fontSize="small" /></ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
