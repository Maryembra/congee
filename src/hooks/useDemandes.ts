import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchInterimaires } from '@/features/admin/fonctionnairesSlice'
import type { DemandeScope } from '@/features/demandes/demandesApi'
import { downloadDocument, generateSignatureTemplate } from '@/features/demandes/demandesApi'
import {
  calcCalendarSpan,
  CURRENT_YEAR,
  type DemandeFormValues,
} from '@/features/demandes/demandeFormTypes'
import {
  canSubmitWithoutJustificatif,
  findSignedDocument,
  hasJustificatifDocument,
  requiresJustificatifOnSubmit,
  requiresMedicalPdfJustificatif,
  resolveApiTypeConge,
  validateGenuinePdfClient,
} from '@/features/demandes/demandeRules'
import type { DemandeConge, StatutDemande } from '@/features/demandes/demandeTypes'
import {
  cancelDemande,
  createDemande,
  fetchDemandeHistory,
  fetchDemandes,
  fetchDocuments,
  rejectChef,
  rejectDirecteur,
  signDemande,
  submitDemande,
  updateDemande,
  uploadDocument,
  validateChef,
} from '@/features/demandes/demandesSlice'
import { fetchQuotas } from '@/features/quotas/quotasSlice'
import { useFeedback } from '@/hooks/useFeedback'

export const statusFilterOptions: Array<{ label: string; value: StatutDemande | 'ALL' }> = [
  { label: 'Tous les statuts', value: 'ALL' },
  { label: 'Brouillon', value: 'BROUILLON' },
  { label: 'Soumise', value: 'SOUMISE' },
  { label: 'Visée chef', value: 'VISE_CHEF' },
  { label: 'Rejetée chef', value: 'REJETEE_CHEF' },
  { label: 'Signée', value: 'SIGNEE_DIRECTEUR' },
  { label: 'Rejetée directeur', value: 'REJETEE_DIRECTEUR' },
  { label: 'Annulée', value: 'ANNULEE' },
]

export function useDemandes() {
  const dispatch = useAppDispatch()
  const { feedback, clearFeedback, showSuccess, showError } = useFeedback()
  const roles = useAppSelector((state) => state.auth.roles)
  const user = useAppSelector((state) => state.auth.user)
  const quotas = useAppSelector((state) => state.quotas.items)
  const currentFonctionnaireId = user?.fonctionnaire?.id
  const demandes = useAppSelector((state) => state.demandes.items)
  const status = useAppSelector((state) => state.demandes.status)
  const error = useAppSelector((state) => state.demandes.error)
  const history = useAppSelector((state) => state.demandes.selectedHistory)
  const documentsByDemande = useAppSelector((state) => state.demandes.documentsByDemande)
  const fonctionnaires = useAppSelector((state) => state.fonctionnaires.interimaires)

  const availableScopes = useMemo(() => {
    const scopes: { label: string; value: DemandeScope }[] = []
    if (roles.includes('ADMIN')) scopes.push({ label: 'Toutes', value: 'admin' })
    if (roles.includes('CHEF_HIERARCHIE')) scopes.push({ label: 'A viser', value: 'chef' })
    if (roles.includes('SIGNATAIRE')) scopes.push({ label: 'A signer', value: 'signataire' })
    if (!roles.includes('ADMIN')) scopes.push({ label: 'Mes demandes', value: 'mine' })
    return scopes.length ? scopes : [{ label: 'Mes demandes', value: 'mine' as DemandeScope }]
  }, [roles])

  const [scope, setScope] = useState<DemandeScope>(availableScopes[0].value)
  const [query, setQuery] = useState('')
  const [statutFilter, setStatutFilter] = useState<StatutDemande | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDemande, setEditingDemande] = useState<DemandeConge | null>(null)
  const [detail, setDetail] = useState<DemandeConge | null>(null)
  const [rejecting, setRejecting] = useState<{ id: number; level: 'chef' | 'directeur' } | null>(null)
  const [submitTarget, setSubmitTarget] = useState<DemandeConge | null>(null)
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null)
  const [justificatifError, setJustificatifError] = useState('')
  const [submitSubmitting, setSubmitSubmitting] = useState(false)
  const [submittingDemandeId, setSubmittingDemandeId] = useState<number | null>(null)
  const [arreteError, setArreteError] = useState<string | null>(null)
  const [signatureTarget, setSignatureTarget] = useState<DemandeConge | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signatureError, setSignatureError] = useState('')
  const [signatureSubmitting, setSignatureSubmitting] = useState(false)
  const [commentaire, setCommentaire] = useState('')
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  const activeScope = availableScopes.some((item) => item.value === scope) ? scope : availableScopes[0].value
  const annualSolde = quotas.find((q) => q.leaveType === 'ANNUEL' && q.year === CURRENT_YEAR)?.remainingDays ?? null

  useEffect(() => {
    dispatch(fetchDemandes(activeScope))
  }, [activeScope, dispatch])

  useEffect(() => {
    if (!formOpen || roles.includes('ADMIN')) return
    if (!fonctionnaires.length) {
      dispatch(fetchInterimaires())
    }
    if (!quotas.length) {
      dispatch(fetchQuotas({ admin: false, annee: CURRENT_YEAR }))
    }
  }, [formOpen, dispatch, roles, fonctionnaires.length, quotas.length])

  const filtered = demandes.filter((demande) => {
    const haystack = `${demande.reference} ${demande.applicant?.lastName} ${demande.applicant?.firstName} ${demande.leaveType}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesStatus = statutFilter === 'ALL' || demande.status === statutFilter
    return matchesQuery && matchesStatus
  })

  const pagedDemandes = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  const selectedDocuments = detail ? documentsByDemande[detail.id] ?? [] : []
  const justificatifDocuments = submitTarget
    ? (documentsByDemande[submitTarget.id] ?? []).filter((document) => document.typeDocument === 'JUSTIFICATIF')
    : []
  const signatureDocuments = signatureTarget
    ? (documentsByDemande[signatureTarget.id] ?? []).filter((document) => document.typeDocument === 'DOCUMENT_SIGNE')
    : []

  const loadDemandeDocuments = async (demandeId: number) => {
    const cached = documentsByDemande[demandeId]
    if (cached) return cached

    const result = await dispatch(fetchDocuments(demandeId))
    if (fetchDocuments.fulfilled.match(result)) {
      return result.payload
    }
    return []
  }

  const openDetail = (demande: DemandeConge) => {
    setDetail(demande)
    dispatch(fetchDemandeHistory(demande.id))
    dispatch(fetchDocuments(demande.id))
  }

  const openSubmit = async (demande: DemandeConge) => {
    if (canSubmitWithoutJustificatif(demande.leaveType)) {
      setSubmittingDemandeId(demande.id)
      try {
        await dispatch(submitDemande(demande.id)).unwrap()
      } catch {
        /* erreur affichée via le slice demandes */
      } finally {
        setSubmittingDemandeId(null)
      }
      return
    }

    if (!requiresJustificatifOnSubmit(demande.leaveType)) {
      setSubmittingDemandeId(demande.id)
      try {
        await dispatch(submitDemande(demande.id)).unwrap()
      } finally {
        setSubmittingDemandeId(null)
      }
      return
    }

    const documents = await loadDemandeDocuments(demande.id)
    if (hasJustificatifDocument(documents)) {
      setSubmittingDemandeId(demande.id)
      try {
        await dispatch(submitDemande(demande.id)).unwrap()
      } catch {
        /* erreur affichée via le slice demandes */
      } finally {
        setSubmittingDemandeId(null)
      }
      return
    }

    setSubmitTarget(demande)
    setJustificatifFile(null)
    setJustificatifError('')
  }

  const downloadArrete = async (demande: DemandeConge) => {
    setArreteError(null)
    try {
      const documents = await loadDemandeDocuments(demande.id)
      const signedDocument = findSignedDocument(documents)
      if (!signedDocument) {
        setArreteError(`Aucun arrêté signé disponible pour ${demande.reference}.`)
        return
      }
      const filename = signedDocument.originalFileName || `arrete_${demande.reference}.pdf`
      await downloadDocument(signedDocument.id, filename)
    } catch {
      setArreteError('Téléchargement de l’arrêté impossible.')
    }
  }

  const openCreate = () => {
    setEditingDemande(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (demande: DemandeConge) => {
    setEditingDemande(demande)
    setFormError('')
    setFormOpen(true)
  }

  const openSignature = (demande: DemandeConge) => {
    setSignatureTarget(demande)
    setSignatureFile(null)
    setSignatureError('')
    dispatch(fetchDocuments(demande.id))
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingDemande(null)
    setFormError('')
  }

  const buildPayload = (form: DemandeFormValues) => {
    const reason =
      form.leaveType === 'PELERINAGE'
        ? form.reason?.trim() || 'Congé pèlerinage (sans solde)'
        : form.reason
    return {
      leaveStartDate: form.leaveStartDate,
      leaveEndDate: form.leaveEndDate,
      leaveType: resolveApiTypeConge(form.leaveType),
      administrativeYear: Number(form.administrativeYear),
      substituteId: Number(form.substituteId),
      reason,
    }
  }

  const handleSaveDemande = async (form: DemandeFormValues, formJustificatifFile: File | null) => {
    const { business: businessDays } = calcCalendarSpan(form.leaveStartDate, form.leaveEndDate)
    const apiTypeConge = resolveApiTypeConge(form.leaveType)
    const needsMedicalPdf = requiresMedicalPdfJustificatif(apiTypeConge)

    if (businessDays <= 0) {
      setFormError('La période doit contenir au moins un jour ouvrable.')
      return
    }

    if (needsMedicalPdf && !formJustificatifFile && !editingDemande) {
      setFormError('Un certificat PDF est obligatoire pour les congés maladie et maternité.')
      return
    }

    if (formJustificatifFile && needsMedicalPdf) {
      const pdfError = await validateGenuinePdfClient(formJustificatifFile)
      if (pdfError) {
        setFormError(pdfError)
        return
      }
    }

    setFormSaving(true)
    setFormError('')
    const isEdit = Boolean(editingDemande)
    try {
      const payload = buildPayload(form)
      let demandeId = editingDemande?.id

      if (editingDemande) {
        const updated = await dispatch(updateDemande({ id: editingDemande.id, payload })).unwrap()
        demandeId = updated.id
      } else {
        const created = await dispatch(createDemande(payload)).unwrap()
        demandeId = created.id
      }

      if (formJustificatifFile && demandeId && needsMedicalPdf) {
        await dispatch(
          uploadDocument({
            demandeId,
            typeDocument: 'JUSTIFICATIF',
            file: formJustificatifFile,
          }),
        ).unwrap()
      }

      setEditingDemande(null)
      setFormOpen(false)
      showSuccess(isEdit ? 'Demande modifiee avec succes.' : 'Demande creee avec succes.')
    } catch (cause) {
      setFormError(typeof cause === 'string' ? cause : 'Enregistrement impossible.')
    } finally {
      setFormSaving(false)
    }
  }

  const handleReject = async () => {
    if (!rejecting || !commentaire.trim()) return
    if (rejecting.level === 'chef') {
      await dispatch(rejectChef({ id: rejecting.id, commentaire }))
    } else {
      await dispatch(rejectDirecteur({ id: rejecting.id, commentaire }))
    }
    setRejecting(null)
    setCommentaire('')
    showSuccess('Demande rejetee avec succes.')
  }

  const handleSignature = async () => {
    if (!signatureTarget) return
    const hasSignedDocument = signatureDocuments.length > 0
    if (!signatureFile && !hasSignedDocument) {
      setSignatureError('Un document signe est obligatoire avant la signature.')
      return
    }

    setSignatureSubmitting(true)
    setSignatureError('')
    try {
      if (signatureFile) {
        await dispatch(
          uploadDocument({
            demandeId: signatureTarget.id,
            typeDocument: 'DOCUMENT_SIGNE',
            file: signatureFile,
          }),
        ).unwrap()
      }
      await dispatch(signDemande(signatureTarget.id)).unwrap()
      setSignatureTarget(null)
      setSignatureFile(null)
      showSuccess('Demande signee avec succes.')
    } catch (cause) {
      setSignatureError(
        typeof cause === 'string'
          ? cause
          : "Signature impossible. Verifiez que le document signe est bien ajoute puis reessayez.",
      )
    } finally {
      setSignatureSubmitting(false)
    }
  }

  const handleDownloadSignatureTemplate = async () => {
    if (!signatureTarget) return
    setSignatureError('')
    try {
      await generateSignatureTemplate(signatureTarget.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération du modèle'
      setSignatureError(message)
    }
  }

  const handleSubmitWithJustificatif = async () => {
    if (!submitTarget) return
    const hasJustificatif = justificatifDocuments.length > 0
    const strictPdf = requiresMedicalPdfJustificatif(submitTarget.leaveType)

    if (!justificatifFile && !hasJustificatif) {
      setJustificatifError('Un justificatif est obligatoire pour ce type de conge avant la soumission.')
      return
    }

    if (justificatifFile && strictPdf) {
      const pdfError = await validateGenuinePdfClient(justificatifFile)
      if (pdfError) {
        setJustificatifError(pdfError)
        return
      }
    }

    setSubmitSubmitting(true)
    setJustificatifError('')
    try {
      if (justificatifFile) {
        await dispatch(
          uploadDocument({
            demandeId: submitTarget.id,
            typeDocument: 'JUSTIFICATIF',
            file: justificatifFile,
          }),
        ).unwrap()
      }
      await dispatch(submitDemande(submitTarget.id)).unwrap()
      setSubmitTarget(null)
      setJustificatifFile(null)
      showSuccess('Demande soumise avec succes.')
    } catch (cause) {
      setJustificatifError(
        typeof cause === 'string' ? cause : 'Soumission impossible. Ajoutez un justificatif valide puis reessayez.',
      )
    } finally {
      setSubmitSubmitting(false)
    }
  }

  const handleCancelDemande = async (id: number) => {
    await dispatch(cancelDemande(id)).unwrap()
    showSuccess('Demande annulee avec succes.')
  }

  const handleValidateChef = async (id: number) => {
    await dispatch(validateChef(id)).unwrap()
    showSuccess('Demande visee avec succes.')
  }

  return {
    dispatch,
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
    justificatifDocuments,
    signatureDocuments,
    scope,
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
  }
}
