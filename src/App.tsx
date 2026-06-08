import { CssBaseline, ThemeProvider } from '@mui/material'
import AppRoutes from '@/routes/AppRoutes'
import theme from '@/theme/theme'
import GlobalStyles from '@/theme/GlobalStyles'
import AuthBootstrap from '@/features/auth/AuthBootstrap'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </ThemeProvider>
  )
}
