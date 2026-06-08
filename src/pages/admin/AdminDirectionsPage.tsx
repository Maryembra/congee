import {
  Add,
  AccountTree,
  BadgeOutlined,
  DeleteOutline,
  Draw,
  Edit,
  Gavel,
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
import OrgCodeNameFields from '@/components/admin/OrgCodeNameFields'
import OrgEntityDialog from '@/components/admin/OrgEntityDialog'
import OrgFormSection from '@/components/admin/OrgFormSection'
import OrgStatCard from '@/components/admin/OrgStatCard'
import DirectionHierarchyView from '@/components/admin/orgTree/DirectionHierarchyView'
import SectionHeader from '@/components/admin/SectionHeader'
import { orgCardSx, orgTableHeadSx } from '@/components/admin/orgAdminStyles'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import type { Direction } from '@/features/admin/adminTypes'
import { emptyDirectionForm, type DirectionFormValues } from '@/features/admin/orgFormTypes'
import { createDirection, deleteDirection, fetchDirections, updateDirection } from '@/features/admin/directionsSlice'
import { useOrgEntityDialog } from '@/hooks/useOrgEntityDialog'
import { fetchDivisions } from '@/features/admin/divisionsSlice'
import { fetchServices } from '@/features/admin/servicesSlice'

type ViewMode = 'hierarchy' | 'table'

export default function AdminDirectionsPage() {
  const dispatch = useAppDispatch()
  const directions = useAppSelector((state) => state.directions.items)
  const status = useAppSelector((state) => state.directions.status)
  const error = useAppSelector((state) => state.directions.error)
  const divisions = useAppSelector((state) => state.divisions.items)
  const services = useAppSelector((state) => state.services.items)
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const dialog = useOrgEntityDialog<DirectionFormValues, Direction>({
    defaultValues: emptyDirectionForm,
    toFormValues: (direction) => ({ code: direction.code, name: direction.name }),
    onSave: async (values, editing) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        signataireId: editing?.signataireId ?? null,
      }
      if (editing) {
        await dispatch(updateDirection({ id: editing.id, payload })).unwrap()
      } else {
        await dispatch(createDirection(payload)).unwrap()
      }
    },
    onSuccess: (isEdit) =>
      showSuccess(isEdit ? 'Direction modifiee avec succes.' : 'Direction creee avec succes.'),
  })

  useEffect(() => {
    dispatch(fetchDirections())
  }, [dispatch])

  useEffect(() => {
    if (viewMode === 'hierarchy') {
      dispatch(fetchDivisions())
      dispatch(fetchServices())
    }
  }, [dispatch, viewMode])

  const assignedCount = useMemo(
    () => directions.filter((direction) => Boolean(direction.signataireId)).length,
    [directions],
  )

  const filtered = useMemo(
    () =>
      directions.filter((direction) => {
        const haystack =
          `${direction.code} ${direction.name} ${direction.signatoryFirstName ?? ''} ${direction.signatoryLastName ?? ''}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [directions, query],
  )

  const pagedDirections = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  const handleDelete = (direction: Direction) => {
    requestConfirm({
      title: 'Confirmer la suppression',
      content: `Voulez-vous vraiment supprimer la direction « ${direction.name} » ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      severity: 'error',
      onConfirm: async () => {
        try {
          await dispatch(deleteDirection(direction.id)).unwrap()
          showSuccess('Direction supprimee avec succes.')
        } catch (error) {
          showError(getApiErrorMessage(error, 'Suppression impossible.'))
        }
      },
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Directions"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={dialog.openCreate} sx={{ borderRadius: 2 }}>
            Nouvelle direction
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Directions actives"
            value={`${directions.length}`}
            hint="Pôles de pilotage"
            icon={<Hub fontSize="small" />}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Signataires assignés"
            value={`${assignedCount}`}
            hint="Responsables des signatures"
            icon={<Draw fontSize="small" />}
            accent="info"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OrgStatCard
            label="Sans signataire"
            value={`${directions.length - assignedCount}`}
            hint="À compléter si besoin"
            icon={<Gavel fontSize="small" />}
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
              placeholder="Rechercher une direction ou un signataire…"
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
                flexShrink: 0,
                '& .MuiTab-root': { minHeight: 36, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 },
              }}
            >
              <Tab icon={<AccountTree fontSize="small" />} iconPosition="start" label="Organigramme" value="hierarchy" />
              <Tab icon={<ViewList fontSize="small" />} iconPosition="start" label="Liste" value="table" />
            </Tabs>
          </Stack>
          {status === 'loading' && (
            <Typography color="text.secondary">Chargement des directions…</Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {viewMode === 'hierarchy' ? (
            <DirectionHierarchyView
              directions={filtered}
              divisions={divisions}
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
                  <TableCell>Direction</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Signataire</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedDirections.map((direction) => (
                  <TableRow key={direction.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{direction.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={direction.code} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {direction.signatoryLastName ? (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={`${direction.signatoryFirstName ?? ''} ${direction.signatoryLastName}`.trim()}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non assigné
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton color="primary" onClick={() => dialog.openEdit(direction)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton color="error" onClick={() => handleDelete(direction)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!pagedDirections.length && status !== 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        Aucune direction trouvée.
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
        icon={<Hub />}
        onClose={dialog.close}
        title={dialog.editing ? 'Modifier la direction' : 'Nouvelle direction'}
        subtitle="Code et nom de la direction."
        submitLabel={dialog.editing ? 'Enregistrer les modifications' : 'Créer la direction'}
        onSubmit={dialog.submit}
        error={dialog.apiError}
        loading={dialog.isSubmitting}
      >
        <OrgFormSection
          icon={<BadgeOutlined />}
          title="Identité de la direction"
          description="Code unique et libellé officiel de la direction."
        >
          <OrgCodeNameFields
            control={dialog.form.control}
            disabled={dialog.isSubmitting}
            codePlaceholder="DIR-GEN"
            nomPlaceholder="Direction générale"
            nomLabel="Nom de la direction *"
          />
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
