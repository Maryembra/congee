import { Add } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import SectionHeader from '@/components/admin/SectionHeader'
import DataList from '@/components/organisms/DataList'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import FeedbackSnackbar from '@/components/molecules/FeedbackSnackbar'
import SearchFilterBar from '@/components/molecules/SearchFilterBar'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getApiErrorMessage } from '@/services/apiError'
import ModernTablePagination from '@/components/common/ModernTablePagination'
import { statusFilterOptions, useDemandes } from '@/hooks/useDemandes'
import type { DemandeScope } from '@/features/demandes/demandesApi'
import type { StatutDemande } from '@/features/demandes/demandeTypes'
import DemandeDetailDrawer from '@/pages/demandes/DemandeDetailDrawer'
import DemandeFormDialog from '@/pages/demandes/DemandeFormDialog'
import { DemandeRejectDialog, DemandeSignatureDialog, DemandeSubmitDialog } from '@/pages/demandes/DemandeWorkflowDialogs'
import { buildDemandeListColumns, DEMANDE_LIST_GRID } from '@/pages/demandes/demandeListColumns'

export default function DemandesPage() {
  const {
    roles,
    user,
    fonctionnaires,
    currentFonctionnaireId,
    status,
    error,
    history,
    availableScopes,
    activeScope,
    annualSolde,
    filtered,
    pagedDemandes,
    selectedDocuments,
    signatureDocuments,
    setScope,
    query,
    setQuery,
    statutFilter,
    setStatutFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    formOpen,
    editingDemande,
    formError,
    formSaving,
    detail,
    setDetail,
    rejecting,
    setRejecting,
    submitTarget,
    setSubmitTarget,
    justificatifFile,
    setJustificatifFile,
    justificatifError,
    setJustificatifError,
    submitSubmitting,
    submittingDemandeId,
    arreteError,
    setArreteError,
    signatureTarget,
    setSignatureTarget,
    signatureFile,
    setSignatureFile,
    signatureError,
    setSignatureError,
    signatureSubmitting,
    commentaire,
    setCommentaire,
    openDetail,
    openSubmit,
    downloadArrete,
    openCreate,
    openEdit,
    openSignature,
    closeForm,
    handleSaveDemande,
    handleReject,
    handleSignature,
    handleDownloadSignatureTemplate,
    handleSubmitWithJustificatif,
    handleCancelDemande,
    handleValidateChef,
    feedback,
    clearFeedback,
    showError,
  } = useDemandes()

  const { confirmState, confirmLoading, requestConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const confirmCancelDemande = (id: number) => {
    requestConfirm({
      title: 'Confirmer l annulation',
      content: 'Voulez-vous vraiment annuler cette demande ?',
      confirmLabel: 'Annuler la demande',
      severity: 'warning',
      onConfirm: async () => {
        try {
          await handleCancelDemande(id)
        } catch (error) {
          showError(getApiErrorMessage(error, 'Annulation impossible.'))
        }
      },
    })
  }

  const listColumns = useMemo(
    () =>
      buildDemandeListColumns({
        activeScope,
        submittingDemandeId,
        onSubmit: openSubmit,
        onEdit: openEdit,
        onCancel: confirmCancelDemande,
        onValidateChef: (id) => {
          void handleValidateChef(id).catch(() => undefined)
        },
        onRejectChef: (id) => setRejecting({ id, level: 'chef' }),
        onSign: openSignature,
        onRejectDirecteur: (id) => setRejecting({ id, level: 'directeur' }),
        onConsult: openDetail,
        onDownloadArrete: downloadArrete,
      }),
    [
      activeScope,
      submittingDemandeId,
      openSubmit,
      openEdit,
      confirmCancelDemande,
      handleValidateChef,
      setRejecting,
      openSignature,
      openDetail,
      downloadArrete,
    ],
  )

  const scopeSelector =
    availableScopes.length > 1 ? (
      <TextField
        select
        size="small"
        label="Vue"
        value={activeScope}
        onChange={(event) => {
          setScope(event.target.value as DemandeScope)
          setPage(0)
        }}
        sx={{ width: { xs: '100%', md: 220 } }}
      >
        {availableScopes.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    ) : null

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="REGISTRE DES CONGÉS DÉPOSÉS"
        subtitle="Aperçu de l'ensemble du cycle de vie des dossiers de l'onboarding administratif."
        actions={
          !roles.includes('ADMIN') ? (
            <Button variant="contained" color="success" startIcon={<Add />} onClick={openCreate} sx={{ fontWeight: 700 }}>
              Créer Demande
            </Button>
          ) : null
        }
      />

      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SearchFilterBar
            searchValue={query}
            onSearchChange={(value) => {
              setQuery(value)
              setPage(0)
            }}
            searchPlaceholder="Rechercher un dossier…"
            filterValue={statutFilter}
            onFilterChange={(value) => {
              setStatutFilter(value as StatutDemande | 'ALL')
              setPage(0)
            }}
            filterOptions={statusFilterOptions}
            filterLabel="Statut"
            leading={scopeSelector}
          />

          {status === 'loading' ? <Typography color="text.secondary">Chargement...</Typography> : null}
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
          {arreteError ? (
            <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setArreteError(null)}>
              {arreteError}
            </Alert>
          ) : null}

          <DataList
            items={pagedDemandes}
            columns={listColumns}
            gridTemplateColumns={DEMANDE_LIST_GRID}
            getRowKey={(demande) => demande.id}
            emptyMessage={status === 'loading' ? '' : 'Aucun dossier ne correspond aux filtres.'}
          />

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

      <DemandeFormDialog
        open={formOpen}
        editingDemande={editingDemande}
        user={user}
        annualSolde={annualSolde}
        fonctionnaires={fonctionnaires}
        currentFonctionnaireId={currentFonctionnaireId}
        saving={formSaving}
        apiError={formError}
        onClose={closeForm}
        onSave={handleSaveDemande}
      />

      <DemandeRejectDialog
        open={Boolean(rejecting)}
        commentaire={commentaire}
        onCommentaireChange={setCommentaire}
        onClose={() => setRejecting(null)}
        onConfirm={handleReject}
      />

      <DemandeSubmitDialog
        target={submitTarget}
        justificatifFile={justificatifFile}
        justificatifError={justificatifError}
        submitting={submitSubmitting}
        onClose={() => setSubmitTarget(null)}
        onFileChange={setJustificatifFile}
        onFileError={setJustificatifError}
        onConfirm={handleSubmitWithJustificatif}
      />

      <DemandeSignatureDialog
        target={signatureTarget}
        signatureFile={signatureFile}
        signatureError={signatureError}
        signatureSubmitting={signatureSubmitting}
        hasExistingDocument={signatureDocuments.length > 0}
        onClose={() => setSignatureTarget(null)}
        onFileChange={setSignatureFile}
        onFileError={setSignatureError}
        onDownloadTemplate={handleDownloadSignatureTemplate}
        onConfirm={handleSignature}
      />

      <DemandeDetailDrawer
        demande={detail}
        documents={selectedDocuments}
        history={history}
        onClose={() => setDetail(null)}
      />

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
