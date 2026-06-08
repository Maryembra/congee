import {
  Add,
  AccountTree,
  BadgeOutlined,
  DeleteOutline,
  Edit,
  Groups,
  RoomService,
  Search,
  SupervisorAccount,
  ViewList,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
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
import { useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import OrgCodeNameFields from '@/components/admin/OrgCodeNameFields'
import OrgEntityDialog from '@/components/admin/OrgEntityDialog'
import OrgFormSection from '@/components/admin/OrgFormSection'
import OrgHierarchyPreview from '@/components/admin/OrgHierarchyPreview'
import OrgStatCard from '@/components/admin/OrgStatCard'
import ServiceHierarchyView from '@/components/admin/orgTree/ServiceHierarchyView'
import SectionHeader from '@/components/admin/SectionHeader'
import { orgCardSx, orgFieldSx, orgTableHeadSx } from '@/components/admin/orgAdminStyles'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import type { Service } from '@/features/admin/adminTypes'
import { emptyServiceForm, type ServiceFormValues } from '@/features/admin/orgFormTypes'
import { avgAgentsPerService } from '@/features/admin/orgStats'
import { useOrgEntityDialog } from '@/hooks/useOrgEntityDialog'
import { fetchDivisions } from '@/features/admin/divisionsSlice'
import { createService, deleteService, fetchServices, updateService } from '@/features/admin/servicesSlice'

type ViewMode = 'hierarchy' | 'table'

export default function AdminServicesPage() {
  const dispatch = useAppDispatch()
  const services = useAppSelector((state) => state.services.items)
  const status = useAppSelector((state) => state.services.status)
  const error = useAppSelector((state) => state.services.error)
  const divisions = useAppSelector((state) => state.divisions.items)
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const dialog = useOrgEntityDialog<ServiceFormValues, Service>({
    defaultValues: emptyServiceForm,
    toFormValues: (service) => ({
      code: service.code,
      name: service.name,
      divisionId: String(service.divisionId),
    }),
    onSave: async (values, editing) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        divisionId: Number(values.divisionId),
        managerId: editing?.managerId ?? null,
      }
      if (editing) {
        await dispatch(updateService({ id: editing.id, payload })).unwrap()
      } else {
        await dispatch(createService(payload)).unwrap()
      }
    },
    onSuccess: (isEdit) =>
      showSuccess(isEdit ? 'Service modifie avec succes.' : 'Service cree avec succes.'),
  })

  useEffect(() => {
    dispatch(fetchServices())
  }, [dispatch])

  useEffect(() => {
    if (!dialog.open) return
    if (!divisions.length) dispatch(fetchDivisions())
  }, [dispatch, dialog.open, divisions.length])

  const chargeMoyenne = useMemo(() => avgAgentsPerService(services), [services])

  const managerCount = useMemo(
    () => services.filter((service) => Boolean(service.managerId)).length,
    [services],
  )

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const manager = `${service.managerFirstName ?? ''} ${service.managerLastName ?? ''}`
        const haystack =
          `${service.code} ${service.name} ${service.divisionName} ${service.directionName} ${manager}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [query, services],
  )

  const pagedServices = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  const watchedDivisionId = dialog.form.watch('divisionId')
  const watchedCode = dialog.form.watch('code')
  const watchedName = dialog.form.watch('name')
  const selectedDivision = divisions.find((d) => d.id === Number(watchedDivisionId))

  const hierarchyPreview = useMemo(() => {
    if (!selectedDivision) return []
    const items: { label: string; code?: string }[] = [
      { label: selectedDivision.directionName, code: selectedDivision.directionCode },
      { label: selectedDivision.name, code: selectedDivision.code },
    ]
    if (watchedName.trim()) {
      items.push({ label: watchedName.trim(), code: watchedCode.trim() || undefined })
    }
    return items
  }, [selectedDivision, watchedCode, watchedName])

  const handleDelete = (service: Service) => {
    requestConfirm({
      title: 'Confirmer la suppression',
      content: `Voulez-vous vraiment supprimer le service « ${service.name} » ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      severity: 'error',
      onConfirm: async () => {
        try {
          await dispatch(deleteService(service.id)).unwrap()
          showSuccess('Service supprime avec succes.')
        } catch (error) {
          showError(getApiErrorMessage(error, 'Suppression impossible.'))
        }
      },
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Services"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={dialog.openCreate} sx={{ borderRadius: 2 }}>
            Nouveau service
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Services actifs"
            value={`${services.length}`}
            hint="Unités opérationnelles enregistrées"
            icon={<AccountTree fontSize="small" />}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Managers assignés"
            value={`${managerCount}`}
            hint={`${services.length ? Math.round((managerCount / services.length) * 100) : 0} % des services`}
            icon={<SupervisorAccount fontSize="small" />}
            accent="info"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Charge moyenne"
            value={chargeMoyenne}
            hint="Agents par service (moyenne)"
            icon={<Groups fontSize="small" />}
            accent="success"
          />
        </Grid>
      </Grid>

      <Card sx={orgCardSx}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'center' }}
            sx={{ mb: 2 }}
          >
            <TextField
              placeholder="Rechercher un service, une division ou une direction…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Tabs
              value={viewMode}
              onChange={(_, value: ViewMode) => setViewMode(value)}
              sx={{
                minHeight: 40,
                bgcolor: 'grey.100',
                borderRadius: 2,
                p: 0.5,
                '& .MuiTab-root': { minHeight: 36, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 },
              }}
            >
              <Tab icon={<AccountTree fontSize="small" />} iconPosition="start" label="Organigramme" value="hierarchy" />
              <Tab icon={<ViewList fontSize="small" />} iconPosition="start" label="Liste" value="table" />
            </Tabs>
          </Stack>

          {status === 'loading' && (
            <Typography color="text.secondary">Chargement des services…</Typography>
          )}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {viewMode === 'hierarchy' ? (
            <ServiceHierarchyView
              services={filtered}
              onEdit={dialog.openEdit}
              onDelete={handleDelete}
            />
          ) : (
            <>
              <TableContainer>
                <Table size="medium" sx={orgTableHeadSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Division</TableCell>
                      <TableCell>Direction</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell align="center">Agents</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedServices.map((service) => {
                      const agents = service.agentCount ?? 0
                      return (
                        <TableRow key={service.id} hover>
                          <TableCell>
                            <Typography fontWeight={700}>{service.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={service.code} variant="outlined" />
                          </TableCell>
                          <TableCell>{service.divisionName}</TableCell>
                          <TableCell>{service.directionName}</TableCell>
                          <TableCell>
                            {service.managerLastName
                              ? `${service.managerFirstName ?? ''} ${service.managerLastName}`.trim()
                              : 'Non assigné'}
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={agents} color={agents > 0 ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Modifier">
                              <IconButton color="primary" onClick={() => dialog.openEdit(service)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton color="error" onClick={() => handleDelete(service)}>
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {!pagedServices.length && status !== 'loading' ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            Aucun service trouvé.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
              <ModernTablePagination
                count={filtered.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <OrgEntityDialog
        open={dialog.open}
        mode={dialog.editing ? 'edit' : 'create'}
        icon={<RoomService />}
        onClose={dialog.close}
        title={dialog.editing ? 'Modifier le service' : 'Nouveau service'}
        subtitle="Code, nom et division parente."
        submitLabel={dialog.editing ? 'Enregistrer les modifications' : 'Créer le service'}
        onSubmit={dialog.submit}
        error={dialog.apiError}
        loading={dialog.isSubmitting}
      >
        <OrgFormSection
          icon={<BadgeOutlined />}
          title="Identité du service"
          description="Code unique et libellé affiché dans l'organigramme."
        >
          <OrgCodeNameFields
            control={dialog.form.control}
            disabled={dialog.isSubmitting}
            codePlaceholder="SRV-RH"
            nomPlaceholder="Ressources humaines"
            nomLabel="Nom du service *"
          />
        </OrgFormSection>

        <OrgFormSection
          icon={<AccountTree />}
          title="Rattachement hiérarchique"
          description="Chaque service appartient à une division, elle-même rattachée à une direction."
        >
          <Controller
            name="divisionId"
            control={dialog.form.control}
            rules={{ required: 'Division requise' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Division parente *"
                required
                fullWidth
                sx={orgFieldSx}
                disabled={dialog.isSubmitting}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? (!field.value ? 'Sélectionnez la division de rattachement' : undefined)}
              >
                {divisions.map((division) => (
                  <MenuItem key={division.id} value={String(division.id)}>
                    {division.name} — {division.directionName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {hierarchyPreview.length > 0 ? <OrgHierarchyPreview items={hierarchyPreview} /> : null}
        </OrgFormSection>
      </OrgEntityDialog>

      <FeedbackSnackbar feedback={feedback} onClose={clearFeedback} />
      {confirmState ? (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          content={confirmState.content}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          severity={confirmState.severity}
          loading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null}
    </Box>
  )
}
