import { Add, DeleteOutline, Download, Edit, Search, UploadFile } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import SectionHeader from '@/components/admin/SectionHeader'
import StatCard from '@/components/admin/StatCard'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useFeedback } from '@/hooks/useFeedback'
import { getApiErrorMessage } from '@/services/apiError'
import {
  createJourFerie,
  deleteJourFerie,
  importJoursFeries,
  fetchJoursFeries,
  updateJourFerie,
} from '@/features/admin/joursFeriesSlice'
import type { JourFerie } from '@/features/admin/adminTypes'
import { emptyJourFerieForm, type JourFerieFormValues } from '@/features/admin/orgFormTypes'
import { useOrgEntityDialog } from '@/hooks/useOrgEntityDialog'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))

export default function AdminJoursFeriesPage() {
  const dispatch = useAppDispatch()
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const joursFeries = useAppSelector((state) => state.joursFeries.items)
  const status = useAppSelector((state) => state.joursFeries.status)
  const error = useAppSelector((state) => state.joursFeries.error)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [importing, setImporting] = useState(false)
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const dialog = useOrgEntityDialog<JourFerieFormValues, JourFerie>({
    defaultValues: emptyJourFerieForm,
    toFormValues: (jourFerie) => ({ date: jourFerie.date, label: jourFerie.label }),
    onSave: async (values, editing) => {
      const payload = {
        date: values.date,
        label: values.label.trim(),
      }
      if (editing) {
        await dispatch(updateJourFerie({ id: editing.id, payload })).unwrap()
      } else {
        await dispatch(createJourFerie(payload)).unwrap()
      }
    },
    onSuccess: (isEdit) =>
      showSuccess(isEdit ? 'Jour ferie modifie avec succes.' : 'Jour ferie cree avec succes.'),
  })

  useEffect(() => {
    dispatch(fetchJoursFeries())
  }, [dispatch])

  const currentYear = new Date().getFullYear()
  const today = new Date().toISOString().slice(0, 10)

  const filtered = useMemo(
    () =>
      joursFeries.filter((jourFerie) => {
        const haystack = `${jourFerie.label} ${jourFerie.date}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [joursFeries, query],
  )

  const pagedJoursFeries = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  const joursFeriesAnnee = useMemo(
    () => joursFeries.filter((jourFerie) => jourFerie.date.startsWith(`${currentYear}-`)).length,
    [currentYear, joursFeries],
  )

  const prochainsJours = useMemo(
    () => joursFeries.filter((jourFerie) => jourFerie.date >= today).length,
    [joursFeries, today],
  )

  const handleDelete = (jourFerie: JourFerie) => {
    requestConfirm({
      title: 'Confirmer la suppression',
      content: `Voulez-vous vraiment supprimer le jour ferie « ${jourFerie.label} » ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      severity: 'error',
      onConfirm: async () => {
        try {
          await dispatch(deleteJourFerie(jourFerie.id)).unwrap()
          showSuccess('Jour ferie supprime avec succes.')
        } catch (error) {
          showError(getApiErrorMessage(error, 'Suppression impossible.'))
        }
      },
    })
  }

  const downloadTemplate = () => {
    const csv = ['date;libelle', '2026-01-01;Nouvel an', '2026-06-25;Jour ferie', '2026-12-25;Noel'].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'jours-feries-modele.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setImporting(true)

    try {
      await dispatch(importJoursFeries({ file })).unwrap()
      await dispatch(fetchJoursFeries())
      showSuccess(`Import termine avec succes pour ${file.name}.`)
    } catch (cause) {
      showError(getApiErrorMessage(cause, 'Import impossible.'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Jours feries"
        subtitle="Configurez les dates exclues du calcul des conges."
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>
              Modele CSV
            </Button>
            <Button variant="outlined" startIcon={<UploadFile />} onClick={handleImportClick} disabled={importing}>
              {importing ? 'Import...' : 'Importer CSV'}
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={dialog.openCreate}>
              Ajouter
            </Button>
          </Stack>
        }
      />
      <input ref={importInputRef} type="file" accept=".csv,text/csv" hidden onChange={handleImportFile} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard label="Jours feries" value={`${joursFeries.length}`} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label={`Annee ${currentYear}`} value={`${joursFeriesAnnee}`} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="A venir" value={`${prochainsJours}`} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher par libelle ou date"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
              InputProps={{ startAdornment: <Search fontSize="small" /> }}
              fullWidth
            />
          </Stack>

          {status === 'loading' ? <Typography color="text.secondary">Chargement...</Typography> : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Libelle</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedJoursFeries.map((jourFerie) => (
                  <TableRow key={jourFerie.id} hover>
                    <TableCell>{formatDate(jourFerie.date)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{jourFerie.label}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton color="primary" onClick={() => dialog.openEdit(jourFerie)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton color="error" onClick={() => handleDelete(jourFerie)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!pagedJoursFeries.length && status !== 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="text.secondary">Aucun jour ferie trouve.</Typography>
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
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onClose={dialog.close} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.editing ? 'Modifier le jour ferie' : 'Nouveau jour ferie'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          {dialog.apiError ? (
            <Alert severity="error">{dialog.apiError}</Alert>
          ) : null}
          <Controller
            name="date"
            control={dialog.form.control}
            rules={{ required: 'Date requise' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={dialog.isSubmitting}
              />
            )}
          />
          <Controller
            name="label"
            control={dialog.form.control}
            rules={{ required: 'Libelle requis' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Libelle"
                required
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={dialog.isSubmitting}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.close} disabled={dialog.isSubmitting}>
            Annuler
          </Button>
          <Button variant="contained" onClick={dialog.submit} disabled={dialog.isSubmitting}>
            {dialog.editing ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>

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
