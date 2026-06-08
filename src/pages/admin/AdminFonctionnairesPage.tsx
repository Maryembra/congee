import { Download, Edit, MailOutline, PersonAddAlt1, Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import FonctionnaireFormDialog from '@/components/admin/FonctionnaireFormDialog'
import FonctionnaireUserStatusBadge from '@/components/admin/FonctionnaireUserStatusBadge'
import SectionHeader from '@/components/admin/SectionHeader'
import StatCard from '@/components/admin/StatCard'
import { orgCardSx, orgFieldSx, orgTableHeadSx } from '@/components/admin/orgAdminStyles'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { exportFonctionnaires } from '@/features/admin/adminApi'
import { fetchDirections } from '@/features/admin/directionsSlice'
import { fetchServices } from '@/features/admin/servicesSlice'
import type { CurrentUser } from '@/features/auth/authTypes'
import type { FonctionnaireFormValues } from '@/features/users/fonctionnaireFormTypes'
import {
  createUser,
  deactivateUser,
  fetchUsersPage,
  resendActivation,
  updateUser,
} from '@/features/users/usersSlice'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import {
  computeSeniority,
  getUserStatus,
  type StatusFilter,
} from '@/pages/admin/adminFonctionnaires.utils'

type ExportFormat = 'csv' | 'excel' | 'pdf'

export default function AdminFonctionnairesPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.users.items)
  const totalElements = useAppSelector((state) => state.users.totalElements)
  const activeCount = useAppSelector((state) => state.users.activeCount)
  const inactiveCount = useAppSelector((state) => state.users.inactiveCount)
  const pendingCount = useAppSelector((state) => state.users.pendingCount)
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const status = useAppSelector((state) => state.users.status)
  const error = useAppSelector((state) => state.users.error)
  const services = useAppSelector((state) => state.services.items)
  const directions = useAppSelector((state) => state.directions.items)
  const [query, setQuery] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<CurrentUser | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<CurrentUser | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [formApiError, setFormApiError] = useState<string | null>(null)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()

  const totalCount = activeCount + inactiveCount + pendingCount

  const loadUsers = useCallback(() => {
    dispatch(
      fetchUsersPage({
        page,
        size: rowsPerPage,
        search: query,
        status: statusFilter,
        excludeUserId: currentUserId,
        directionId: directionFilter ? Number(directionFilter) : undefined,
      }),
    )
  }, [dispatch, page, rowsPerPage, query, statusFilter, directionFilter, currentUserId])

  useEffect(() => {
    if (!directions.length) dispatch(fetchDirections())
  }, [dispatch, directions.length])

  useEffect(() => {
    if (!isFormOpen) return
    if (!services.length) dispatch(fetchServices())
  }, [dispatch, isFormOpen, services.length])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const openCreate = () => {
    setEditing(null)
    setFormApiError(null)
    setIsFormOpen(true)
  }

  const openEdit = (user: CurrentUser) => {
    setEditing(user)
    setFormApiError(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormApiError(null)
  }

  const handleFormSubmit = async (form: FonctionnaireFormValues) => {
    const hasSignatoryRole = form.primaryRole === 'SIGNATAIRE'
    setSubmitting(true)
    setFormApiError(null)

    const payload = {
      username: form.username,
      email: form.email,
      roleCodes: [form.primaryRole],
      lastName: form.lastName,
      firstName: form.firstName,
      ppr: form.ppr,
      grade: form.grade,
      employmentStartDate: form.employmentStartDate,
      serviceId: Number(form.serviceId),
      signatoryDirectionId: hasSignatoryRole ? Number(form.signatoryDirectionId) : undefined,
    }

    try {
      if (editing) {
        await dispatch(updateUser({ id: editing.id, payload })).unwrap()
        showSuccess('Fonctionnaire modifie avec succes.')
      } else {
        await dispatch(createUser(payload)).unwrap()
        showSuccess(`Invitation envoyee a ${form.email}. Le fonctionnaire doit activer son compte par email.`)
      }
      await dispatch(
        fetchUsersPage({
          page,
          size: rowsPerPage,
          search: query,
          status: statusFilter,
          excludeUserId: currentUserId,
          directionId: directionFilter ? Number(directionFilter) : undefined,
        }),
      ).unwrap()
      closeForm()
    } catch (err) {
      setFormApiError(getApiErrorMessage(err, 'Enregistrement impossible.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (user: CurrentUser, enabled: boolean) => {
    if (!user.accountActivated) return
    if (!enabled) {
      setConfirmDeactivate(user)
      return
    }

    setActionLoading(user.id)
    try {
      await dispatch(updateUser({ id: user.id, payload: { enabled: true } })).unwrap()
      showSuccess('Compte reactive avec succes.')
    } catch (err) {
      showError(getApiErrorMessage(err, 'Activation impossible.'))
    } finally {
      setActionLoading(null)
    }
  }

  const confirmDeactivation = async () => {
    if (!confirmDeactivate) return

    setActionLoading(confirmDeactivate.id)
    try {
      await dispatch(deactivateUser(confirmDeactivate.id)).unwrap()
      showSuccess('Compte desactive avec succes.')
      setConfirmDeactivate(null)
    } catch (err) {
      showError(getApiErrorMessage(err, 'Desactivation impossible.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendActivation = async (user: CurrentUser) => {
    setActionLoading(user.id)
    try {
      await dispatch(resendActivation(user.id)).unwrap()
      showSuccess(`Invitation renvoyee a ${user.email}.`)
    } catch (err) {
      showError(getApiErrorMessage(err, 'Renvoi impossible.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = async (format: ExportFormat) => {
    setExportAnchor(null)
    await exportFonctionnaires(query, format)
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="Fonctionnaires" />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total" value={`${totalCount}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Actifs" value={`${activeCount}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Desactives" value={`${inactiveCount}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="En attente" value={`${pendingCount}`} />
        </Grid>
      </Grid>

      <Card sx={orgCardSx}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.5}
            sx={{ mb: 2 }}
            alignItems={{ lg: 'center' }}
          >
            <TextField
              placeholder="Rechercher par Nom, PPR, ou Grade..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
              size="small"
              sx={{ ...orgFieldSx, flex: 1, minWidth: { lg: 280 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              value={directionFilter}
              onChange={(event) => {
                setDirectionFilter(event.target.value)
                setPage(0)
              }}
              sx={{ ...orgFieldSx, minWidth: { xs: '100%', lg: 240 } }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Toutes les Directions</MenuItem>
              {directions.map((direction) => (
                <MenuItem key={direction.id} value={String(direction.id)}>
                  {direction.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Download />}
              onClick={(event) => setExportAnchor(event.currentTarget)}
              sx={{
                borderRadius: 2,
                px: 2.5,
                whiteSpace: 'nowrap',
                bgcolor: 'background.paper',
                flexShrink: 0,
              }}
            >
              Exporter
            </Button>
            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
              <MenuItem onClick={() => handleExport('csv')}>
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Exporter CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExport('excel')}>
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Exporter Excel</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Exporter PDF</ListItemText>
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              color="success"
              startIcon={<PersonAddAlt1 />}
              onClick={openCreate}
              sx={{
                borderRadius: 2,
                px: 2.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Ajouter un fonctionnaire
            </Button>
          </Stack>

          <Tabs
            value={statusFilter}
            onChange={(_, value: StatusFilter) => {
              setStatusFilter(value)
              setPage(0)
            }}
            sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab label={`Tous (${totalCount})`} value="all" />
            <Tab label={`Actifs (${activeCount})`} value="active" />
            <Tab label={`Desactives (${inactiveCount})`} value="inactive" />
            <Tab label={`En attente (${pendingCount})`} value="pending" />
          </Tabs>

          {status === 'loading' ? (
            <Stack alignItems="center" py={6}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <TableContainer>
              <Table size="medium" sx={orgTableHeadSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>PPR</TableCell>
                    <TableCell>Nom &amp; Prenom</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Anciennete</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Aucun fonctionnaire trouve
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const profile = user.fonctionnaire
                      const seniority = computeSeniority(profile?.employmentStartDate)
                      const userStatus = getUserStatus(user)
                      const isLoading = actionLoading === user.id

                      return (
                        <TableRow key={user.id} hover sx={{ opacity: userStatus === 'inactive' ? 0.72 : 1 }}>
                          <TableCell>
                            <Typography fontWeight={700} color="text.primary">
                              {profile?.ppr ?? '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={700}>
                              {profile?.firstName} {profile?.lastName}
                            </Typography>
                            {profile?.employmentStartDate ? (
                              <Typography variant="caption" color="text.secondary">
                                Recrute le : {profile.employmentStartDate}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>{profile?.grade || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{profile?.serviceName ?? '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {seniority != null ? (
                              <Chip
                                size="small"
                                label={`${seniority.toFixed(2)} ans`}
                                sx={{
                                  bgcolor: seniority >= 5 ? '#ecfdf5' : '#f0fdf4',
                                  color: '#15803d',
                                  fontWeight: 600,
                                }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {user.roles.map((role) => (
                                <Chip key={role} label={role} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <FonctionnaireUserStatusBadge user={user} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                              {userStatus === 'pending' ? (
                                <Tooltip title="Renvoyer l'invitation">
                                  <span>
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      disabled={isLoading}
                                      onClick={() => handleResendActivation(user)}
                                    >
                                      {isLoading ? <CircularProgress size={18} /> : <MailOutline fontSize="small" />}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              ) : (
                                <Tooltip title={user.enabled ? 'Desactiver le compte' : 'Reactiver le compte'}>
                                  <span>
                                    <Switch
                                      size="small"
                                      checked={user.enabled}
                                      disabled={isLoading}
                                      onChange={(e) => handleToggleStatus(user, e.target.checked)}
                                      color="success"
                                    />
                                  </span>
                                </Tooltip>
                              )}
                              <Tooltip title="Modifier">
                                <IconButton color="primary" size="small" onClick={() => openEdit(user)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <ModernTablePagination
            count={totalElements}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>

      <FonctionnaireFormDialog
        isOpen={isFormOpen}
        editing={editing}
        services={services}
        directions={directions}
        submitting={submitting}
        error={formApiError}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDeactivate)}
        title="Desactiver le compte"
        content={
          confirmDeactivate
            ? `Voulez-vous desactiver le compte de ${confirmDeactivate.fonctionnaire?.firstName} ${confirmDeactivate.fonctionnaire?.lastName} ? Le fonctionnaire ne pourra plus se connecter.`
            : ''
        }
        confirmLabel="Desactiver"
        severity="warning"
        loading={actionLoading !== null}
        onConfirm={confirmDeactivation}
        onCancel={() => setConfirmDeactivate(null)}
      />

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
    </Box>
  )
}
