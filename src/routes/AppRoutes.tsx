import { Route, Routes } from 'react-router-dom'
import AuthGuard from '@/routes/AuthGuard'
import PublicOnly from '@/routes/PublicOnly'
import RoleGuard from '@/routes/RoleGuard'
import AppShell from '@/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import ActivateAccountPage from '@/pages/ActivateAccountPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminDirectionsPage from '@/pages/admin/AdminDirectionsPage'
import AdminDivisionsPage from '@/pages/admin/AdminDivisionsPage'
import AdminServicesPage from '@/pages/admin/AdminServicesPage'
import AdminFonctionnairesPage from '@/pages/admin/AdminFonctionnairesPage'
import AdminJoursFeriesPage from '@/pages/admin/AdminJoursFeriesPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'
import DemandesPage from '@/pages/demandes/DemandesPage'
import QuotasPage from '@/pages/quotas/QuotasPage'
import ReportingPage from '@/pages/reporting/ReportingPage'
import ProfilePage from '@/pages/profile/ProfilePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activer-compte" element={<ActivateAccountPage />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/demandes" element={<DemandesPage />} />
          <Route path="/quotas" element={<QuotasPage />} />
          <Route element={<RoleGuard roles={['ADMIN', 'CHEF_HIERARCHIE', 'SIGNATAIRE']} />}>
            <Route path="/reporting" element={<ReportingPage />} />
          </Route>
          <Route element={<RoleGuard roles={['ADMIN']} />}>
            <Route path="/fonctionnaires" element={<AdminFonctionnairesPage />} />
            <Route path="/admin/directions" element={<AdminDirectionsPage />} />
            <Route path="/admin/divisions" element={<AdminDivisionsPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/jours-feries" element={<AdminJoursFeriesPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
