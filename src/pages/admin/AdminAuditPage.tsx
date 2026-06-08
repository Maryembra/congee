import { FactCheck, Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '@/components/admin/SectionHeader'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchAuditLogs } from '@/features/admin/adminApi'
import type { AuditLogEntry } from '@/features/admin/adminTypes'

const actionOptions = [
  { value: '', label: 'Toutes les actions' },
  { value: 'CONNEXION', label: 'Connexion' },
  { value: 'ECHEC_CONNEXION', label: 'Sécurité' },
  { value: 'DECONNEXION', label: 'Déconnexion' },
  { value: 'CREATION', label: 'Création' },
  { value: 'MODIFICATION', label: 'Modification' },
  { value: 'SUPPRESSION', label: 'Suppression' },
  { value: 'IMPORTATION', label: 'Importation' },
  { value: 'EXPORTATION', label: 'Exportation' },
//   { value: 'VALIDATION', label: 'Validation' },
//   { value: 'SIGNATURE', label: 'Signature' },
//   { value: 'SOUMISSION', label: 'Soumission' },
  { value: 'DEMANDE_CREATION', label: 'Demande création' },
  { value: 'DEMANDE_SOUMISE', label: 'Demande soumise' },
  { value: 'DEMANDE_VALIDEE_CHEF', label: 'Demande validée chef' },
  { value: 'DEMANDE_SIGNEE', label: 'Demande signée' },
  { value: 'DOCUMENT_UPLOAD', label: 'Document upload' },
  { value: 'DOCUMENT_SIGNATURE_TEMPLATE_GENERATED', label: 'Modèle signature document' },
  { value: 'EMAIL_SENT', label: 'Email envoyé' },
  { value: 'REFRESH_TOKEN_ROTATED', label: 'Renouvellement' },
]

function getActionColor(action: string) {
  switch (action) {
    case 'CONNEXION':
    case 'CREATION':
    case 'VALIDATION':
    case 'DEMANDE_CREATION':
    case 'DEMANDE_SOUMISE':
    case 'DEMANDE_VALIDEE_CHEF':
    case 'DEMANDE_SIGNEE':
      return 'success'
    case 'MODIFICATION':
      return 'primary'
    case 'SUPPRESSION':
    case 'ECHEC_CONNEXION':
      return 'error'
    case 'IMPORTATION':
    case 'EXPORTATION':
    case 'EMAIL_SENT':
    case 'DOCUMENT_UPLOAD':
    case 'DOCUMENT_SIGNATURE_TEMPLATE_GENERATED':
      return 'warning'
    case 'SIGNATURE':
      return 'info'
    case 'DECONNEXION':
    case 'SOUMISSION':
    case 'REFRESH_TOKEN_ROTATED':
      return 'secondary'
    default:
      return 'default'
  }
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminAuditPage() {
  const [items, setItems] = useState<AuditLogEntry[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetchAuditLogs({
      search: debouncedSearch,
      action,
      page,
      size: rowsPerPage,
    })
      .then((response) => {
        if (!mounted) return
        setItems(response.content)
        setTotalElements(response.totalElements)
      })
      .catch(() => {
        if (!mounted) return
        setItems([])
        setTotalElements(0)
        setError('Impossible de charger le journal d\'audit.')
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [action, debouncedSearch, page, rowsPerPage])

  const stats = useMemo(() => {
    const successCount = items.filter((item) => item.success).length
    const failureCount = items.length - successCount
    return { successCount, failureCount }
  }, [items])

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Journal d'audit"
        subtitle="Traçabilité des connexions, modifications, validations et suppressions côté administration."
        actions={
          <Chip
            icon={<FactCheck />}
            label="Section 7.2 compliance"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        }
      />

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Entrées affichées
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {totalElements}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Succès sur la page
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {stats.successCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Échecs sur la page
            </Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {stats.failureCount}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
            <TextField
              fullWidth
              placeholder="Rechercher par fardeau, action, détails..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', md: 220 } }}>
              <Select
                value={action}
                onChange={(event) => {
                  setAction(event.target.value)
                  setPage(0)
                }}
                displayEmpty
              >
                {actionOptions.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Détails de l'action</TableCell>
                  <TableCell align="right">Durée ms</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">Chargement des logs...</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading && !items.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">Aucune entrée trouvée.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatTimestamp(item.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {item.actorName ?? item.actorUsername ?? 'Système'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.actorUsername ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.actorRole ?? item.category ?? 'N/A'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.actionLabel || item.action}
                        size="small"
                        color={getActionColor(item.action)}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 500 }} noWrap title={item.details}>
                        {item.details}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {item.durationMs ?? '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
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
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}