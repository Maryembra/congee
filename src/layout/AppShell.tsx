import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import TopBar from '@/layout/TopBar'
import SideNav from '@/layout/SideNav'

const drawerWidth = 260

export default function AppShell() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            },
          }}
        >
          <SideNav onClose={!isDesktop ? handleDrawerToggle : undefined} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } }}>
        <TopBar onMenuClick={handleDrawerToggle} />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
