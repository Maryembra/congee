import {
  Add,
  AccountTree,
  BadgeOutlined,
  Business,
  DeleteOutline,
  Edit,
  Hub,
  Search,
  ViewList,
} from '@mui/icons-material'
import {
  Alert,
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
import DivisionHierarchyView from '@/components/admin/orgTree/DivisionHierarchyView'
import OrgCodeNameFields from '@/components/admin/OrgCodeNameFields'
import OrgEntityDialog from '@/components/admin/OrgEntityDialog'
import OrgFormSection from '@/components/admin/OrgFormSection'
import OrgHierarchyPreview from '@/components/admin/OrgHierarchyPreview'
import OrgStatCard from '@/components/admin/OrgStatCard'
import SectionHeader from '@/components/admin/SectionHeader'
import { orgCardSx, orgFieldSx, orgTableHeadSx } from '@/components/admin/orgAdminStyles'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import type { Division } from '@/features/admin/adminTypes'
import { emptyDivisionForm, type DivisionFormValues } from '@/features/admin/orgFormTypes'
import { avgServicesPerDivision } from '@/features/admin/orgStats'
import { useOrgEntityDialog } from '@/hooks/useOrgEntityDialog'
import { createDivision, deleteDivision, fetchDivisions, updateDivision } from '@/features/admin/divisionsSlice'
import { fetchDirections } from '@/features/admin/directionsSlice'
import { fetchServices } from '@/features/admin/servicesSlice'

type ViewMode = 'hierarchy' | 'table'

export default function AdminDivisionsPage() {
  const dispatch = useAppDispatch()
  const divisions = useAppSelector((state) => state.divisions.items)
  const status = useAppSelector((state) => state.divisions.status)
  const error = useAppSelector((state) => state.divisions.error)
  const directions = useAppSelector((state) => state.directions.items)
  const services = useAppSelector((state) => state.services.items)
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const dialog = useOrgEntityDialog<DivisionFormValues, Division>({
    defaultValues: emptyDivisionForm,
    toFormValues: (division) => ({
      code: division.code,
      name: division.name,
      directionId: String(division.directionId),
    }),
    onSave: async (values, editing) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        directionId: Number(values.directionId),
      }
      if (editing) {
        await dispatch(updateDivision({ id: editing.id, payload })).unwrap()
      } else {
        await dispatch(createDivision(payload)).unwrap()
      }
    },
    onSuccess: (isEdit) =>
      showSuccess(isEdit ? 'Division modifiee avec succes.' : 'Division creee avec succes.'),
  })

  useEffect(() => {
    dispatch(fetchDivisions())
    dispatch(fetchDirections())
  }, [dispatch])

  useEffect(() => {
    if (viewMode === 'hierarchy') {
      dispatch(fetchServices())
    }
  }, [dispatch, viewMode])

  const chargeMoyenne = useMemo(() => avgServicesPerDivision(divisions), [divisions])

  const directionMap = useMemo(() => new Map(directions.map((d) => [d.id, d])), [directions])

  const filtered = useMemo(
    () =>
      divisions.filter((division) => {
        const directionName = directionMap.get(division.directionId)?.name ?? division.directionName
        const haystack = `${division.code} ${division.name} ${division.directionCode} ${directionName}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [directionMap, divisions, query],
  )

  const pagedDivisions = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  const watchedDirectionId = dialog.form.watch('directionId')
  const watchedCode = dialog.form.watch('code')
  const watchedName = dialog.form.watch('name')
  const selectedDirection = directions.find((d) => d.id === Number(watchedDirectionId))

  const hierarchyPreview = useMemo(() => {
    if (!selectedDirection) return []
    const items: { label: string; code?: string }[] = [
      { label: selectedDirection.name, code: selectedDirection.code },
    ]
    if (watchedName.trim()) {
      items.push({ label: watchedName.trim(), code: watchedCode.trim() || undefined })
    }
    return items
  }, [selectedDirection, watchedCode, watchedName])

  const handleDelete = (division: Division) => {
    requestConfirm({
      title: 'Confirmer la suppression',
      content: `Voulez-vous vraiment supprimer la division « ${division.name} » ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      severity: 'error',
      onConfirm: async () => {
        try {
          await dispatch(deleteDivision(division.id)).unwrap()
          showSuccess('Division supprimee avec succes.')
        } catch (error) {
          showError(getApiErrorMessage(error, 'Suppression impossible.'))
        }
      },
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Divisions"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={dialog.openCreate} sx={{ borderRadius: 2 }}>
            Nouvelle division
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Divisions actives"
            value={`${divisions.length}`}
            hint="Niveau intermédiaire de l'organigramme"
            icon={<Business fontSize="small" />}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Directions"
            value={`${directions.length}`}
            hint="Pôles de pilotage au sommet"
            icon={<Hub fontSize="small" />}
            accent="info"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Charge moyenne"
            value={chargeMoyenne}
            hint="Services par division (moyenne)"
            icon={<AccountTree fontSize="small" />}
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
              placeholder="Rechercher une division ou une direction…"
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
            <Typography color="text.secondary">Chargement des divisions…</Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {viewMode === 'hierarchy' ? (
            <DivisionHierarchyView
              divisions={filtered}
              directions={directions}
              services={services}
              onEdit={dialog.openEdit}
              onDelete={handleDelete}
            />
          ) : (
            <>
              <TableContainer>
                <Table size="medium" sx={orgTableHeadSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Division</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Direction</TableCell>
                      <TableCell align="center">Services</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedDivisions.map((division) => {
                      const svcCount = division.serviceCount ?? 0
                      return (
                        <TableRow key={division.id} hover>
                          <TableCell>
                            <Typography fontWeight={700}>{division.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={division.code} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {directionMap.get(division.directionId)?.name ?? division.directionName}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={svcCount}
                              color={svcCount > 0 ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Modifier">
                              <IconButton color="primary" onClick={() => dialog.openEdit(division)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton color="error" onClick={() => handleDelete(division)}>
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {!pagedDivisions.length && status !== 'loading' ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            Aucune division trouvée.
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
        icon={<Business />}
        onClose={dialog.close}
        title={dialog.editing ? 'Modifier la division' : 'Nouvelle division'}
        subtitle="Rattachement : direction → division. Les services seront créés sous cette division."
        submitLabel={dialog.editing ? 'Enregistrer les modifications' : 'Créer la division'}
        onSubmit={dialog.submit}
        error={dialog.apiError}
        loading={dialog.isSubmitting}
      >
        <OrgFormSection
          icon={<BadgeOutlined />}
          title="Identité de la division"
          description="Code unique et libellé visible dans l'organigramme."
        >
          <OrgCodeNameFields
            control={dialog.form.control}
            disabled={dialog.isSubmitting}
            codePlaceholder="DIV-IT"
            nomPlaceholder="Systèmes d'information"
            nomLabel="Nom de la division *"
          />
        </OrgFormSection>

        <OrgFormSection
          icon={<Hub />}
          title="Rattachement hiérarchique"
          description="La division est rattachée directement à une direction."
        >
          <Controller
            name="directionId"
            control={dialog.form.control}
            rules={{ required: 'Direction requise' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Direction parente *"
                required
                fullWidth
                sx={orgFieldSx}
                disabled={dialog.isSubmitting}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? (!field.value ? 'Choisissez la direction de rattachement' : undefined)}
              >
                {directions.map((direction) => (
                  <MenuItem key={direction.id} value={String(direction.id)}>
                    {direction.name} ({direction.code})
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
